const express = require("express");
const router = express.Router();

const {
    clockIn,
    clockOut,
    getMyAttendance,
    getTodayAttendance
} = require("../controllers/attendanceController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
    "/clock-in",
    authMiddleware,
    roleMiddleware("stylist"),
    clockIn
);

router.post(
    "/clock-out",
    authMiddleware,
    roleMiddleware("stylist"),
    clockOut
);

router.get(
    "/my",
    authMiddleware,
    roleMiddleware("stylist"),
    getMyAttendance
);

router.get(
    "/today",
    authMiddleware,
    roleMiddleware("admin"),
    getTodayAttendance
);

module.exports = router;
