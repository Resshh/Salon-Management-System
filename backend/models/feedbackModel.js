const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true,
            unique: true
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

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        comment: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;