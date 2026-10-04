const express = require("express");
const router = express.Router();

const { createStylist } = require("../controllers/stylistController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createStylist
);

module.exports = router;