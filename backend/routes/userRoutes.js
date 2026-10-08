const express = require("express");
const { rateLimit } = require("express-rate-limit");
const router = express.Router();

const {
    registerUser,
    loginUser,
    createStylistUser,
    getMe
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Limits how often one computer can try to log in or register.
// This slows down someone who is guessing passwords.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    limit: 30,                  // at most 30 tries in that time
    message: {
        message: "Too many attempts. Please try again in 15 minutes."
    }
});

router.post("/register", authLimiter, registerUser);

router.post("/login", authLimiter, loginUser);

router.post(
    "/stylist",
    authMiddleware,
    roleMiddleware("admin"),
    createStylistUser
);

router.get("/me", authMiddleware, getMe);

module.exports = router;