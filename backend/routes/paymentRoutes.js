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

// Called by Razorpay's server, so there is no login token.
// The controller checks Razorpay's signature instead.
router.post("/webhook", razorpayWebhook);

router.put(
    "/:id/cash",
    authMiddleware,
    roleMiddleware("stylist", "admin"),
    markCashPayment
);

module.exports = router;
