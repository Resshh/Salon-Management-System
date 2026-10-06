const express = require("express");
const router = express.Router();

const {
    createAppointment, approveAppointment, rejectAppointment, getMyAppointments, getStylistAppointments, cancelAppointment, rescheduleAppointment, completeAppointment
} = require("../controllers/appointmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
    "/",
    authMiddleware,
    roleMiddleware("customer"),
    createAppointment
);

router.put(
    "/:id/approve",
    authMiddleware,
    roleMiddleware("stylist"),
    approveAppointment
);

router.put(
    "/:id/reject",
    authMiddleware,
    roleMiddleware("stylist"),
    rejectAppointment
);

router.get(
    "/my",
    authMiddleware,
    roleMiddleware("customer"),
    getMyAppointments
);

router.get(
    "/stylist",
    authMiddleware,
    roleMiddleware("stylist"),
    getStylistAppointments
);
router.put(
    "/:id/cancel",
    authMiddleware,
    roleMiddleware("customer"),
    cancelAppointment
);
router.put(
    "/:id/reschedule",
    authMiddleware,
    roleMiddleware("customer"),
    rescheduleAppointment
);

router.put(
    "/:id/complete",
    authMiddleware,
    roleMiddleware("stylist"),
    completeAppointment
);


module.exports = router;