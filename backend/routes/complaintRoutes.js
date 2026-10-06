const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createComplaint,
    getMyComplaints,
    getAllComplaints,
    updateComplaint
} = require("../controllers/complaintController");


// Customer submits complaint
router.post(
    "/",
    authMiddleware,
    roleMiddleware("customer"),
    createComplaint
);


// Customer views own complaints
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("customer"),
    getMyComplaints
);


// Admin views complaints
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllComplaints
);


// Admin updates complaint
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateComplaint
);


module.exports = router;