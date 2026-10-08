const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getCustomerHistoryForStylist,
    getCustomerHistory,
    getStylistHistory,
    updateServiceNotes
} = require("../controllers/serviceHistoryController");


// Create service history
// Customer history
router.get(
    "/customer",
    authMiddleware,
    roleMiddleware("customer"),
    getCustomerHistory
);


// Stylist history
router.get(
    "/stylist",
    authMiddleware,
    roleMiddleware("stylist"),
    getStylistHistory
);


// Stylist notes
router.put(
    "/:id/notes",
    authMiddleware,
    roleMiddleware("stylist"),
    updateServiceNotes
);


router.get(
    "/customer/:customerId",
    authMiddleware,
    roleMiddleware("stylist"),
    getCustomerHistoryForStylist
);

module.exports = router;