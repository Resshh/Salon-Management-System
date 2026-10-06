const express = require("express");

const router = express.Router();

const {
    addFeedback,
    getMyFeedback,
    getStylistFeedback,
    updateFeedback,
    deleteFeedback
} = require("../controllers/feedbackController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// Customer submits feedback
router.post(
    "/",
    authMiddleware,
    roleMiddleware("customer"),
    addFeedback
);


// Customer views own feedback
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("customer"),
    getMyFeedback
);


// Stylist views feedback
router.get(
    "/stylist",
    authMiddleware,
    roleMiddleware("stylist"),
    getStylistFeedback
);


// Customer updates feedback
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("customer"),
    updateFeedback
);


// Customer deletes feedback
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("customer"),
    deleteFeedback
);


module.exports = router;