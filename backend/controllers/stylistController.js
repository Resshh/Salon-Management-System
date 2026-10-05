const Stylist = require("../models/stylistModel");
const Service = require("../models/serviceModel");

const createStylistProfile = async (req, res) => {
    try {
        const {
            specialization,
            services,
            workingSchedule
        } = req.body;

        // Get stylist's User ID from JWT
        const user = req.user.userId;

        // Check if profile already exists
        const existingStylist = await Stylist.findOne({ user });

        if (existingStylist) {
            return res.status(400).json({
                message: "Stylist profile already exists"
            });
        }

        // Check whether all services exist
        for (const serviceId of services) {
            const service = await Service.findById(serviceId);

            if (!service) {
                return res.status(400).json({
                    message: "One or more services not found"
                });
            }
        }

        // Create stylist profile
        const newStylist = new Stylist({
            user,
            specialization,
            services,
            workingSchedule
        });

        await newStylist.save();

        return res.status(201).json({
            message: "Stylist profile created successfully",
            stylistId: newStylist._id
        });

    } catch (error) {
        return res.status(500).json({
            message: "Stylist profile creation failed",
            error: error.message
        });
    }
};


const getMyStylistProfile = async (req, res) => {
    try {
        const user = req.user.userId;

        const stylist = await Stylist.findOne({ user })
            .populate("user", "name email phone gender dateOfBirth")
            .populate("services", "name description duration price");

        if (!stylist) {
            return res.status(404).json({
                message: "Stylist profile not found"
            });
        }

        return res.status(200).json({
            message: "Stylist profile fetched successfully",
            stylist
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch stylist profile",
            error: error.message
        });
    }
};

const updateMyStylistProfile = async (req, res) => {
    try {
        const user = req.user.userId;

        const {
            specialization,
            services,
            workingSchedule
        } = req.body;

        const stylist = await Stylist.findOne({ user });

        if (!stylist) {
            return res.status(404).json({
                message: "Stylist profile not found"
            });
        }

        // Check services
        for (const serviceId of services) {
            const service = await Service.findById(serviceId);

            if (!service) {
                return res.status(400).json({
                    message: "One or more services not found"
                });
            }
        }

        stylist.specialization = specialization;
        stylist.services = services;
        stylist.workingSchedule = workingSchedule;

        await stylist.save();

        return res.status(200).json({
            message: "Stylist profile updated successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Stylist profile update failed",
            error: error.message
        });
    }
};

module.exports = {
    createStylistProfile,
    getMyStylistProfile,
    updateMyStylistProfile
};