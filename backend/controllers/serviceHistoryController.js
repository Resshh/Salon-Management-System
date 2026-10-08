const ServiceHistory = require("../models/serviceHistoryModel");
const Appointment = require("../models/appointmentModel");
const Stylist = require("../models/stylistModel");


// Customer views own service history
const getCustomerHistory = async (req, res) => {
    try {
        const history = await ServiceHistory.find({
            customer: req.user.userId
        })
            .populate("customer", "name email")
            .populate({
                path: "stylist",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .populate("service", "name price duration")
            .populate("appointment", "date startTime endTime status")
            .sort({ serviceDate: -1 });

        res.status(200).json({
            message: "Service history fetched successfully",
            history
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch service history"
        });
    }
};


// Stylist views own service history
const getStylistHistory = async (req, res) => {
    try {
        // The token only has the userId, so find the stylist profile first
        const stylist = await Stylist.findOne({
            user: req.user.userId
        });

        if (!stylist) {
            return res.status(404).json({
                message: "Stylist profile not found"
            });
        }

        const history = await ServiceHistory.find({
            stylist: stylist._id
        })
            .populate("customer", "name email phone")
            .populate("service", "name price duration")
            .populate("appointment", "date startTime endTime status")
            .sort({ serviceDate: -1 });

        res.status(200).json({
            message: "Stylist service history fetched successfully",
            history
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch stylist service history"
        });
    }
};


// Stylist adds/updates notes
const updateServiceNotes = async (req, res) => {
    try {
        const { notes } = req.body;

        const history = await ServiceHistory.findById(
            req.params.id
        );

        if (!history) {
            return res.status(404).json({
                message: "Service history not found"
            });
        }

        const stylist = await Stylist.findOne({
            user: req.user.userId
        });

        if (!stylist || history.stylist.toString() !== stylist._id.toString()) {
            return res.status(403).json({
                message: "You can only update your own service history"
            });
        }

        history.notes = notes;

        await history.save();

        res.status(200).json({
            message: "Service notes updated successfully",
            history
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update service notes"
        });
    }
};


// Stylist views the previous services of one customer
const getCustomerHistoryForStylist = async (req, res) => {
    try {
        // A stylist may only look at customers who have booked with them
        const stylist = await Stylist.findOne({
            user: req.user.userId
        });

        const hasBooked = stylist && await Appointment.findOne({
            stylist: stylist._id,
            customer: req.params.customerId
        });

        if (!hasBooked) {
            return res.status(403).json({
                message: "You can only view customers who have booked with you"
            });
        }

        const history = await ServiceHistory.find({
            customer: req.params.customerId
        })
            .populate({
                path: "stylist",
                populate: {
                    path: "user",
                    select: "name"
                }
            })
            .populate("service", "name")
            .sort({ serviceDate: -1 });

        res.status(200).json({
            message: "Customer history fetched successfully",
            history
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch customer history"
        });
    }
};


module.exports = {
    getCustomerHistoryForStylist,
    getCustomerHistory,
    getStylistHistory,
    updateServiceNotes
};