const express = require("express");

const router = express.Router();

const {
    getCustomerHistory,
    getCustomerHistoryForStylist
} = require("../controllers/historyController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// Customer's service history
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("customer"),
    getCustomerHistory
);


// Stylist views a customer's history
router.get(
    "/customer/:customerId",
    authMiddleware,
    roleMiddleware("stylist"),
    getCustomerHistoryForStylist
);


module.exports = router;