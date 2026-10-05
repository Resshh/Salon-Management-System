const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    createStylistUser
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post(
    "/stylist",
    authMiddleware,
    roleMiddleware("admin"),
    createStylistUser
);

module.exports = router;