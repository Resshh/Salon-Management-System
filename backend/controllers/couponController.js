const Coupon = require("../models/couponModel");


// Admin creates a coupon
const createCoupon = async (req, res) => {
    try {
        const { code, discountPercent, expiryDate } = req.body;

        if (!code || !discountPercent || !expiryDate) {
            return res.status(400).json({
                message: "Code, discount percent and expiry date are required"
            });
        }

        const existingCoupon = await Coupon.findOne({
            code: code.toUpperCase()
        });

        if (existingCoupon) {
            return res.status(400).json({
                message: "Coupon code already exists"
            });
        }

        const coupon = await Coupon.create({
            code,
            discountPercent,
            expiryDate
        });

        res.status(201).json({
            message: "Coupon created successfully",
            coupon
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create coupon",
            error: error.message
        });
    }
};


// Admin views all coupons
const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });

        res.status(200).json({
            message: "Coupons fetched successfully",
            coupons
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch coupons"
        });
    }
};


// Admin turns a coupon on or off
const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                message: "Coupon not found"
            });
        }

        coupon.active = req.body.active ?? coupon.active;

        await coupon.save();

        res.status(200).json({
            message: "Coupon updated successfully",
            coupon
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update coupon"
        });
    }
};


// Admin deletes a coupon
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                message: "Coupon not found"
            });
        }

        res.status(200).json({
            message: "Coupon deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete coupon"
        });
    }
};


module.exports = {
    createCoupon,
    getAllCoupons,
    updateCoupon,
    deleteCoupon
};
