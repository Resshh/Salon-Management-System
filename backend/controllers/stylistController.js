const Stylist = require("../models/stylistModel");
const Service = require("../models/serviceModel");

const { DAY_NAMES, isValidTime } = require("../utils/salonHours");


// Checks the working time slots a stylist sends.
// Returns an error message, or null when everything is fine.
const checkWorkingSchedule = (workingSchedule) => {

    if (!Array.isArray(workingSchedule)) {
        return "The working schedule must be a list of time slots";
    }

    for (const slot of workingSchedule) {

        // The day must be spelled exactly like "Monday"
        if (!slot || !DAY_NAMES.includes(slot.day)) {
            return "Every time slot needs a day, for example Monday";
        }

        if (
            !isValidTime(slot.startTime) ||
            !isValidTime(slot.endTime) ||
            slot.startTime >= slot.endTime
        ) {
            return `Times on ${slot.day} must look like 09:30, and the end must be after the start`;
        }

        // Two slots on the same day must not overlap
        const overlapping = workingSchedule.find(
            (other) =>
                other !== slot &&
                other.day === slot.day &&
                other.startTime < slot.endTime &&
                other.endTime > slot.startTime
        );

        if (overlapping) {
            return `Two time slots overlap on ${slot.day}`;
        }

    }

    return null;

};

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

        // Check the working time slots (same rules as when updating)
        if (workingSchedule) {

            const scheduleError = checkWorkingSchedule(workingSchedule);

            if (scheduleError) {
                return res.status(400).json({
                    message: scheduleError
                });
            }

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

const getAllStylists = async (req, res) => {
    try {
        const stylists = await Stylist.find()
            .populate("user", "name email phone")
            .populate("services", "name price duration");

        // Skip profiles whose user account was deleted
        const activeStylists = stylists.filter(
            (stylist) => stylist.user
        );

        res.status(200).json(activeStylists);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get stylists"
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

        // Check services (only when services are sent)
        if (services) {
            for (const serviceId of services) {
                const service = await Service.findById(serviceId);

                if (!service) {
                    return res.status(400).json({
                        message: "One or more services not found"
                    });
                }
            }
        }

        // Check the working time slots (only when a schedule is sent)
        if (workingSchedule) {

            const scheduleError = checkWorkingSchedule(workingSchedule);

            if (scheduleError) {
                return res.status(400).json({
                    message: scheduleError
                });
            }

        }

        // Update only the fields that were sent,
        // so saving the profile does not erase the schedule (and vice versa)
        stylist.specialization = specialization ?? stylist.specialization;
        stylist.services = services ?? stylist.services;
        stylist.workingSchedule = workingSchedule ?? stylist.workingSchedule;

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
    updateMyStylistProfile,
    getAllStylists
};