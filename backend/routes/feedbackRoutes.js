const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getStylistFeedback,
    createFeedback,
    getMyFeedback,
    getAllFeedback
} = require("../controllers/feedbackController");


// Customer submits feedback
router.post(
    "/",
    authMiddleware,
    roleMiddleware("customer"),
    createFeedback
);


// Customer views own feedback
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("customer"),
    getMyFeedback
);


// Admin views all feedback
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllFeedback
);


router.get(
    "/stylist",
    authMiddleware,
    roleMiddleware("stylist"),
    getStylistFeedback
);

module.exports = router;