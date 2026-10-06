const express = require("express");
const router = express.Router();

const {
    createStylistProfile, getMyStylistProfile, getAllStylists, updateMyStylistProfile
} = require("../controllers/stylistController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
    "/profile",
    authMiddleware,
    roleMiddleware("stylist"),
    createStylistProfile
);
router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("stylist"),
    getMyStylistProfile
);
router.put(
    "/profile",
    authMiddleware,
    roleMiddleware("stylist"),
    updateMyStylistProfile
);
router.get(
    "/",
    authMiddleware,
    roleMiddleware("customer"),
    getAllStylists
);
module.exports = router;