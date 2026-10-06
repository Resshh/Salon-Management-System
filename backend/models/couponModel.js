const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },

        discountPercent: {
            type: Number,
            required: true,
            min: 1,
            max: 100
        },

        expiryDate: {
            type: Date,
            required: true
        },

        active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
