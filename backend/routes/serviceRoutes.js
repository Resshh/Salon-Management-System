const express = require("express");
const router = express.Router();

const { createService, getAllServices, updateService, deleteService, getServicesByCategory } = require("../controllers/serviceController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createService
);

router.get(
    "/",
    getAllServices
);


router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateService
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteService
);

router.get(
    "/category/:categoryId",
    getServicesByCategory
);

module.exports = router;