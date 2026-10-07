const Razorpay = require("razorpay");
const crypto = require("crypto");

const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");
const Stylist = require("../models/stylistModel");
const Coupon = require("../models/couponModel");

const sendNotification = require("../utils/notificationService");

// ======================================================
// PAYMENT FLOW
//
// 1. Customer books            -> status "pending",  payment "unpaid"
// 2. Stylist accepts           -> status "approved", payment "unpaid"  (payment is now due)
// 3. Customer pays online  OR  stylist/admin marks "paid in cash" -> payment "paid"
// 4. Stylist marks completed   -> status "completed"
//
// If a paid appointment is cancelled, an online payment is refunded -> payment "refunded"
// ======================================================

// Membership discount in percent
const MEMBERSHIP_DISCOUNT = {
    none: 0,
    silver: 5,
    gold: 10
};

// 1 loyalty point for every 100 rupees paid
const pointsFor = (amount) => Math.floor(amount / 100);

const getRazorpay = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
};

// Compare two signatures safely
const signaturesMatch = (expectedSignature, receivedSignature) => {

    const expected = Buffer.from(expectedSignature);
    const received = Buffer.from(String(receivedSignature));

    return (
        expected.length === received.length &&
        crypto.timingSafeEqual(expected, received)
    );

};


// ======================================================
// HELPER: MARK AN APPOINTMENT AS PAID
// Used by: verifyPayment, razorpayWebhook, markCashPayment
// Returns false when the appointment was already paid.
// ======================================================

const markAppointmentPaid = async (appointmentId, details) => {

    // The filter "not already paid" and the update happen in ONE database step.
    // So if the browser and the webhook both report the same payment,
    // only the first one is recorded and loyalty points are given once.
    const appointment = await Appointment.findOneAndUpdate(
        {
            _id: appointmentId,
            paymentStatus: { $nin: ["paid", "refunded"] }
        },
        {
            paymentStatus: "paid",
            ...details
        },
        { new: true }
    );

    if (!appointment) {
        return false;
    }

    const points = pointsFor(appointment.amount);

    await User.findByIdAndUpdate(appointment.customer, {
        $inc: { loyaltyPoints: points }
    });

    const method =
        appointment.paymentMethod === "cash" ? "cash" : "online";

    await sendNotification({
        recipient: appointment.customer,
        title: "Payment Received",
        message: `We received your ${method} payment of ₹${appointment.amount}. You earned ${points} loyalty points.`,
        type: "payment",
        emailSubject: "Payment Receipt - Beauté Salon",
        emailText: `Thank you. We received your ${method} payment of ₹${appointment.amount}.\nLoyalty points earned: ${points}`
    });

    return true;

};


// ======================================================
// HELPER: REFUND A PAID APPOINTMENT (used when it is cancelled)
// It changes the appointment fields; the caller saves the appointment.
// Returns { ok: true } or { ok: false, message }.
// ======================================================

const refundIfPaid = async (appointment) => {

    if (appointment.paymentStatus !== "paid") {
        return { ok: true };
    }

    // Cash cannot be sent back by Razorpay. The salon returns it by hand.
    // (No Razorpay payment id also means it was not paid online.)
    if (
        appointment.paymentMethod === "cash" ||
        !appointment.razorpayPaymentId
    ) {

        await sendNotification({
            recipient: appointment.customer,
            title: "Refund At Salon",
            message: `Your appointment was cancelled. Please collect your cash refund of ₹${appointment.amount} at the salon.`,
            type: "payment",
            emailSubject: "Refund - Beauté Salon",
            emailText: `Your appointment was cancelled. Please collect your cash refund of ₹${appointment.amount} at the salon.`
        });

        return { ok: true };

    }

    try {

        // Razorpay works in paise: 1 rupee = 100 paise
        const refund = await getRazorpay().payments.refund(
            appointment.razorpayPaymentId,
            {
                amount: appointment.amount * 100
            }
        );

        appointment.paymentStatus = "refunded";
        appointment.razorpayRefundId = refund.id;

    } catch (error) {

        console.error("Refund failed:", error);

        return {
            ok: false,
            message: "Refund failed, so the appointment was not cancelled. Please try again."
        };

    }

    // Take back the loyalty points earned from this payment (never below 0)
    const customer = await User.findById(appointment.customer);

    if (customer) {

        customer.loyaltyPoints = Math.max(
            customer.loyaltyPoints - pointsFor(appointment.amount),
            0
        );

        await customer.save();

    }

    await sendNotification({
        recipient: appointment.customer,
        title: "Refund Started",
        message: `Your payment of ₹${appointment.amount} is being refunded. It reaches your account in 5-7 working days.`,
        type: "payment",
        emailSubject: "Refund Started - Beauté Salon",
        emailText: `Your appointment was cancelled and your payment of ₹${appointment.amount} is being refunded. It usually reaches your account in 5-7 working days.`
    });

    return { ok: true };

};


// ======================================================
// STEP 1: CREATE A RAZORPAY ORDER
// POST /api/payment/order   body: { appointment, couponCode }
// ======================================================

const createOrder = async (req, res) => {
    try {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({
                message: "Razorpay keys are not set in the .env file"
            });
        }

        const { appointment, couponCode } = req.body;

        const existingAppointment = await Appointment.findById(appointment)
            .populate("service", "name price");

        if (!existingAppointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if (existingAppointment.customer.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only pay for your own appointment"
            });
        }

        if (
            existingAppointment.status !== "approved" &&
            existingAppointment.status !== "completed"
        ) {
            return res.status(400).json({
                message: "You can pay after the stylist approves the appointment"
            });
        }

        if (existingAppointment.paymentStatus !== "unpaid") {
            return res.status(400).json({
                message: "This appointment is already paid"
            });
        }

        // ---------- WORK OUT THE DISCOUNT ----------

        const customer = await User.findById(req.user.userId);

        let discountPercent = MEMBERSHIP_DISCOUNT[customer.membership] || 0;

        let usedCoupon = "";

        if (couponCode) {

            const coupon = await Coupon.findOne({
                code: couponCode.toUpperCase(),
                active: true,
                expiryDate: { $gte: new Date() }
            });

            if (!coupon) {
                return res.status(400).json({
                    message: "Invalid or expired coupon"
                });
            }

            discountPercent = discountPercent + coupon.discountPercent;
            usedCoupon = coupon.code;

        }

        // The price is always read from the database, never from the browser
        const price = existingAppointment.service.price;

        // Never give more than 100% off, and Razorpay needs at least 1 rupee
        if (discountPercent > 100) {
            discountPercent = 100;
        }

        const discount = Math.round(price * discountPercent / 100);
        const amount = Math.max(price - discount, 1);

        // ---------- CREATE THE ORDER ON RAZORPAY ----------

        // Razorpay works in paise: 1 rupee = 100 paise
        const order = await getRazorpay().orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: existingAppointment._id.toString()
        });

        existingAppointment.razorpayOrderId = order.id;
        existingAppointment.amount = amount;
        existingAppointment.discount = discount;
        existingAppointment.couponCode = usedCoupon;

        await existingAppointment.save();

        res.status(200).json({
            message: "Order created successfully",
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            discount,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create payment order"
        });
    }
};


// ======================================================
// STEP 2: VERIFY THE PAYMENT (called by the customer's browser)
// POST /api/payment/verify
// body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// ======================================================

const verifyPayment = async (req, res) => {
    try {
        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({
                message: "Razorpay keys are not set in the .env file"
            });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                message: "Payment details are missing"
            });
        }

        // Razorpay signs "order_id|payment_id" with our secret key.
        // We make the same signature here. If both match, the payment is real.
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (!signaturesMatch(expectedSignature, razorpay_signature)) {
            return res.status(400).json({
                message: "Payment verification failed"
            });
        }

        const appointment = await Appointment.findOne({
            razorpayOrderId: razorpay_order_id,
            customer: req.user.userId
        });

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found for this payment"
            });
        }

        await markAppointmentPaid(appointment._id, {
            paymentMethod: "online",
            razorpayPaymentId: razorpay_payment_id
        });

        res.status(200).json({
            message: "Payment successful"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to verify payment"
        });
    }
};


// ======================================================
// WEBHOOK: RAZORPAY'S SERVER CALLS OUR SERVER
// POST /api/payment/webhook
//
// A backup for verifyPayment. If the customer closes the browser right
// after paying, the browser never calls /verify, but Razorpay still
// calls this URL, so the payment is not lost.
// There is no login token here: the signature proves it is Razorpay.
// ======================================================

const razorpayWebhook = async (req, res) => {
    try {
        if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
            return res.status(500).json({
                message: "Razorpay webhook secret is not set in the .env file"
            });
        }

        // The signature is made from the exact bytes Razorpay sent,
        // so we use req.rawBody (saved in app.js), not the parsed req.body
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(req.rawBody)
            .digest("hex");

        if (
            !signaturesMatch(
                expectedSignature,
                req.headers["x-razorpay-signature"]
            )
        ) {
            return res.status(400).json({
                message: "Invalid webhook signature"
            });
        }

        if (req.body.event === "payment.captured") {

            const payment = req.body.payload.payment.entity;

            const appointment = await Appointment.findOne({
                razorpayOrderId: payment.order_id
            });

            if (appointment) {

                await markAppointmentPaid(appointment._id, {
                    paymentMethod: "online",
                    razorpayPaymentId: payment.id
                });

            }

        }

        // Always answer 200 quickly, otherwise Razorpay sends the event again
        res.status(200).json({
            received: true
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Webhook failed"
        });
    }
};


// ======================================================
// CUSTOMER PAID AT THE SALON
// PUT /api/payment/:id/cash   (stylist of that appointment, or admin)
// ======================================================

const markCashPayment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate("service", "price");

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        // A stylist can only do this for their own appointment
        if (req.user.role === "stylist") {

            const stylist = await Stylist.findOne({
                user: req.user.userId
            });

            if (
                !stylist ||
                appointment.stylist.toString() !== stylist._id.toString()
            ) {
                return res.status(403).json({
                    message: "You are not assigned to this appointment"
                });
            }

        }

        if (
            appointment.status !== "approved" &&
            appointment.status !== "completed"
        ) {
            return res.status(400).json({
                message: "Only approved or completed appointments can be marked as paid"
            });
        }

        const marked = await markAppointmentPaid(appointment._id, {
            paymentMethod: "cash",
            amount: appointment.service.price,
            discount: 0,
            couponCode: ""
        });

        if (!marked) {
            return res.status(400).json({
                message: "This appointment is already paid"
            });
        }

        res.status(200).json({
            message: "Marked as paid in cash"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to mark cash payment"
        });
    }
};


module.exports = {
    createOrder,
    verifyPayment,
    razorpayWebhook,
    markCashPayment,
    refundIfPaid
};
