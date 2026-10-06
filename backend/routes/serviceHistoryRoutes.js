const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createServiceHistory,
    getCustomerHistory,
    getStylistHistory,
    updateServiceNotes
} = require("../controllers/serviceHistoryController");


// Create service history
router.post(
    "/",
    authMiddleware,
    roleMiddleware("stylist"),
    createServiceHistory
);


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


module.exports = router;