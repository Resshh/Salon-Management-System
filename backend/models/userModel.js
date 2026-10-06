const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        gender: {
            type: String,
            required: true
        },

        dateOfBirth: {
            type: Date,
            required: true
        },

        role: {
            type: String,
            enum: ["customer", "stylist", "admin"],
            required: true
        },

        // Only used for customers
        membership: {
            type: String,
            enum: ["none", "silver", "gold"],
            default: "none"
        },

        loyaltyPoints: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;