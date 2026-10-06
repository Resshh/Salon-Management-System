const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["pending", "in-progress", "resolved"],
            default: "pending"
        },

        adminResponse: {
            type: String,
            trim: true
        }
    },
    { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;