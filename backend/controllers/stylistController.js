const Stylist = require("../models/stylistModel");
const User = require("../models/userModel");
const Service = require("../models/serviceModel");

const createStylist = async (req, res) => {

    try {

        const {
            user,
            specialization,
            services,
            workingSchedule
        } = req.body;

        const existingUser = await User.findById(user);

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (existingUser.role !== "stylist") {
            return res.status(400).json({
                message: "User is not a stylist"
            });
        }

        const existingStylist = await Stylist.findOne({ user });

        if (existingStylist) {
            return res.status(400).json({
                message: "Stylist profile already exists"
            });
        }

        for (const serviceId of services) {

            const service = await Service.findById(serviceId);

            if (!service) {
                return res.status(400).json({
                    message: "One or more services not found"
                });
            }
        }

        const newStylist = new Stylist({
            user,
            specialization,
            services,
            workingSchedule
        });

        await newStylist.save();

        return res.status(201).json({
            message: "Stylist profile created successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Stylist profile creation failed",
            error: error.message
        });

    }
};

module.exports = {
    createStylist
};