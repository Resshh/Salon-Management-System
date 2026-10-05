const express = require("express");
const router = express.Router();

const {
    getMyNotifications,
    markNotificationAsRead
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

router.get(
    "/",
    authMiddleware,
    getMyNotifications
);

router.put(
    "/:id/read",
    authMiddleware,
    markNotificationAsRead
);

module.exports = router;