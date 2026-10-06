const Razorpay = require("razorpay");
const crypto = require("crypto");

const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");
const Coupon = require("../models/couponModel");

const sendNotification = require("../utils/notificationService");

// Membership discount in percent
const MEMBERSHIP_DISCOUNT = {
    none: 0,
    silver: 5,
    gold: 10
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

        if (existingAppointment.paymentStatus === "paid") {
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

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        // Razorpay works in paise: 1 rupee = 100 paise
        const order = await razorpay.orders.create({
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
// STEP 2: VERIFY THE PAYMENT
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

        const expected = Buffer.from(expectedSignature);
        const received = Buffer.from(String(razorpay_signature));

        if (
            expected.length !== received.length ||
            !crypto.timingSafeEqual(expected, received)
        ) {
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

        // Already handled (for example the request was sent twice)
        if (appointment.paymentStatus === "paid") {
            return res.status(200).json({
                message: "Payment already recorded"
            });
        }

        appointment.paymentStatus = "paid";
        appointment.razorpayPaymentId = razorpay_payment_id;

        await appointment.save();

        // ---------- LOYALTY POINTS: 1 point for every 100 rupees ----------

        const points = Math.floor(appointment.amount / 100);

        await User.findByIdAndUpdate(req.user.userId, {
            $inc: { loyaltyPoints: points }
        });

        await sendNotification({
            recipient: req.user.userId,
            title: "Payment Successful",
            message: `We received your payment of ₹${appointment.amount}. You earned ${points} loyalty points.`,
            type: "payment",
            emailSubject: "Payment Receipt - Beauté Salon",
            emailText: `Thank you. We received your payment of ₹${appointment.amount}.\nPayment id: ${razorpay_payment_id}\nLoyalty points earned: ${points}`
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


module.exports = {
    createOrder,
    verifyPayment
};
