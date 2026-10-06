const ServiceHistory = require("../models/serviceHistoryModel");
const Appointment = require("../models/appointmentModel");
const Stylist = require("../models/stylistModel");


// Create service history when appointment is completed
const createServiceHistory = async (req, res) => {
    try {
        const { appointment, notes } = req.body;

        const existingAppointment = await Appointment.findById(appointment);

        if (!existingAppointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if (existingAppointment.status !== "completed") {
            return res.status(400).json({
                message: "Service history can only be created for completed appointments"
            });
        }

        const existingHistory = await ServiceHistory.findOne({
            appointment
        });

        if (existingHistory) {
            return res.status(400).json({
                message: "Service history already exists"
            });
        }

        const history = await ServiceHistory.create({
            appointment,
            customer: existingAppointment.customer,
            stylist: existingAppointment.stylist,
            service: existingAppointment.service,
            serviceDate: existingAppointment.date,
            notes
        });

        res.status(201).json({
            message: "Service history created successfully",
            history
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create service history"
        });
    }
};


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
    createServiceHistory,
    getCustomerHistory,
    getStylistHistory,
    updateServiceNotes
};