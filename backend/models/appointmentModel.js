const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        stylist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Stylist",
            required: true
        },

        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        startTime: {
            type: String,
            required: true
        },

        endTime: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: [
                "pending",
                "approved",
                "rejected",
                "cancelled",
                "completed",
                "no-show"
            ],
            default: "pending"
        },

        // ---------- PAYMENT ----------

        paymentStatus: {
            type: String,
            enum: ["unpaid", "paid", "refunded"],
            default: "unpaid"
        },

        // How it was paid: on the website or at the salon
        paymentMethod: {
            type: String,
            enum: ["online", "cash"]
        },

        // Final amount paid, after discounts
        amount: {
            type: Number
        },

        discount: {
            type: Number,
            default: 0
        },

        couponCode: {
            type: String
        },

        razorpayOrderId: {
            type: String
        },

        razorpayPaymentId: {
            type: String
        },

        razorpayRefundId: {
            type: String
        }
    },
    { timestamps: true }
);

const Appointment = mongoose.model(
    "Appointment",
    appointmentSchema
);

module.exports = Appointment;