const express = require("express");
const router = express.Router();

const {
    createOrder,
    verifyPayment,
    razorpayWebhook,
    markCashPayment
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
    "/order",
    authMiddleware,
    roleMiddleware("customer"),
    createOrder
);

router.post(
    "/verify",
    authMiddleware,
    roleMiddleware("customer"),
    verifyPayment
);

router.post("/webhook", razorpayWebhook);

router.put(
    "/:id/cash",
    authMiddleware,
    roleMiddleware("stylist", "admin"),
    markCashPayment
);

module.exports = router;
