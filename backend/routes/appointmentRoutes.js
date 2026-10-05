const express = require("express");
const router = express.Router();

const {
    createAppointment
} = require("../controllers/appointmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
    "/",
    authMiddleware,
    roleMiddleware("customer"),
    createAppointment
);

module.exports = router;