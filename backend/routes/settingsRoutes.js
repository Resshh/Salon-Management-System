const express = require("express");
const router = express.Router();

const {
    getSettings,
    updateSettings
} = require("../controllers/settingsController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", getSettings);

router.put(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    updateSettings
);

module.exports = router;
