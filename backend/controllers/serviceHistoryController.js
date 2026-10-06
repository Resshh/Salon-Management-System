const ServiceHistory = require("../models/serviceHistoryModel");
const Appointment = require("../models/appointmentModel");


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
        const history = await ServiceHistory.find({
            stylist: req.user.stylistId
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

        if (history.stylist.toString() !== req.user.stylistId) {
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


module.exports = {
    createServiceHistory,
    getCustomerHistory,
    getStylistHistory,
    updateServiceNotes
};