const Feedback = require("../models/feedbackModel");
const Appointment = require("../models/appointmentModel");
const Stylist = require("../models/stylistModel");


// Customer submits feedback
const createFeedback = async (req, res) => {
    try {
        const { appointment, rating, review } = req.body;

        const customer = req.user.userId;

        const existingAppointment = await Appointment.findById(appointment);

        if (!existingAppointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        // Check appointment belongs to customer
        if (existingAppointment.customer.toString() !== customer) {
            return res.status(403).json({
                message: "You can only review your own appointment"
            });
        }

        // Feedback only for completed appointments
        if (existingAppointment.status !== "completed") {
            return res.status(400).json({
                message: "Feedback can only be submitted for completed appointments"
            });
        }

        // Check duplicate feedback
        const existingFeedback = await Feedback.findOne({
            appointment
        });

        if (existingFeedback) {
            return res.status(400).json({
                message: "Feedback already submitted for this appointment"
            });
        }

        const feedback = await Feedback.create({
            customer,
            appointment,
            rating,
            review
        });

        res.status(201).json({
            message: "Feedback submitted successfully",
            feedback
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to submit feedback"
        });
    }
};


// Customer views own feedback
const getMyFeedback = async (req, res) => {
    try {
        const customer = req.user.userId;

        const feedback = await Feedback.find({ customer })
            .populate("customer", "name email")
            .populate({
                path: "appointment",
                populate: [
                    {
                        path: "service",
                        select: "name price duration"
                    },
                    {
                        path: "stylist",
                        select: "specialization"
                    }
                ]
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Feedback fetched successfully",
            feedback
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch feedback"
        });
    }
};


// Admin views all feedback
const getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find()
            .populate("customer", "name email")
            .populate({
                path: "appointment",
                populate: [
                    {
                        path: "service",
                        select: "name price duration"
                    },
                    {
                        path: "stylist",
                        select: "specialization"
                    }
                ]
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "All feedback fetched successfully",
            feedback
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch feedback"
        });
    }
};


// Stylist views ratings and feedback for their own appointments
const getStylistFeedback = async (req, res) => {
    try {
        const stylist = await Stylist.findOne({
            user: req.user.userId
        });

        if (!stylist) {
            return res.status(404).json({
                message: "Stylist profile not found"
            });
        }

        // Step 1: all appointments of this stylist
        const appointments = await Appointment.find({
            stylist: stylist._id
        }).select("_id");

        const appointmentIds = appointments.map((item) => item._id);

        // Step 2: feedback written for those appointments
        const feedback = await Feedback.find({
            appointment: { $in: appointmentIds }
        })
            .populate("customer", "name")
            .populate({
                path: "appointment",
                select: "date service",
                populate: {
                    path: "service",
                    select: "name"
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Feedback fetched successfully",
            feedback
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch feedback"
        });
    }
};


module.exports = {
    getStylistFeedback,
    createFeedback,
    getMyFeedback,
    getAllFeedback
};