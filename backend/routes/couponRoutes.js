const express = require("express");
const router = express.Router();

const {
    createCoupon,
    getAllCoupons,
    updateCoupon,
    deleteCoupon
} = require("../controllers/couponController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createCoupon
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllCoupons
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateCoupon
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteCoupon
);

module.exports = router;
