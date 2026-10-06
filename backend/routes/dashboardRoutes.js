const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getDashboardStats
} = require("../controllers/dashboardController");

router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getDashboardStats
);

module.exports = router;