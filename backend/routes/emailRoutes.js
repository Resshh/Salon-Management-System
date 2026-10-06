const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    sendTestEmail
} = require("../controllers/emailController");


router.get(
    "/test",
    authMiddleware,
    sendTestEmail
);


module.exports = router;