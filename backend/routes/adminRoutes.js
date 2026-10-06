const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getCustomers,
    getStylists,
    getServices,
    getAppointments,
    getFeedback,
    getComplaints
} = require("../controllers/adminController");


router.get(
    "/customers",
    authMiddleware,
    roleMiddleware("admin"),
    getCustomers
);


router.get(
    "/stylists",
    authMiddleware,
    roleMiddleware("admin"),
    getStylists
);


router.get(
    "/services",
    authMiddleware,
    roleMiddleware("admin"),
    getServices
);


router.get(
    "/appointments",
    authMiddleware,
    roleMiddleware("admin"),
    getAppointments
);


router.get(
    "/feedback",
    authMiddleware,
    roleMiddleware("admin"),
    getFeedback
);


router.get(
    "/complaints",
    authMiddleware,
    roleMiddleware("admin"),
    getComplaints
);


module.exports = router;