const mongoose = require("mongoose");

const serviceHistorySchema = new mongoose.Schema(
    {
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true,
            unique: true
        },

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

        serviceDate: {
            type: Date,
            required: true
        },

        notes: {
            type: String,
            trim: true
        }
    },
    { timestamps: true }
);

const ServiceHistory = mongoose.model(
    "ServiceHistory",
    serviceHistorySchema
);

module.exports = ServiceHistory;