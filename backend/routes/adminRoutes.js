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
    getComplaints,
    updateUser,
    deleteUser,
    sendPromotion
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


const {
    updateAppointmentByAdmin
} = require("../controllers/appointmentController");

router.put(
    "/users/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateUser
);

router.delete(
    "/users/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteUser
);

router.put(
    "/appointments/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateAppointmentByAdmin
);

router.post(
    "/notify",
    authMiddleware,
    roleMiddleware("admin"),
    sendPromotion
);

module.exports = router;