const express = require("express");
const router = express.Router();

const {
    createOrder,
    verifyPayment
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

module.exports = router;
