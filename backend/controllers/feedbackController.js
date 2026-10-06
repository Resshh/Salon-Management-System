const Feedback = require("../models/feedbackModel");
const Appointment = require("../models/appointmentModel");
const Stylist = require("../models/stylistModel");


// ==========================================
// CUSTOMER - ADD FEEDBACK
// ==========================================

const addFeedback = async (req, res) => {
    try {
        const customer = req.user.userId;

        const {
            appointmentId,
            rating,
            comment
        } = req.body;

        // Validate required fields
        if (!appointmentId || !rating) {
            return res.status(400).json({
                message: "Appointment ID and rating are required"
            });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        // Find appointment
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        // Check appointment belongs to customer
        if (appointment.customer.toString() !== customer.toString()) {
            return res.status(403).json({
                message: "You are not allowed to review this appointment"
            });
        }

        // Only completed appointments can be reviewed
        if (appointment.status !== "completed") {
            return res.status(400).json({
                message: "You can only review completed appointments"
            });
        }

        // Check if feedback already exists
        const existingFeedback = await Feedback.findOne({
            appointment: appointmentId
        });

        if (existingFeedback) {
            return res.status(400).json({
                message: "Feedback has already been submitted for this appointment"
            });
        }

        // Create feedback
        const feedback = await Feedback.create({
            customer,
            appointment: appointment._id,
            stylist: appointment.stylist,
            service: appointment.service,
            rating,
            comment: comment ? comment.trim() : ""
        });

        return res.status(201).json({
            message: "Feedback submitted successfully",
            feedback
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to submit feedback",
            error: error.message
        });
    }
};


// ==========================================
// CUSTOMER - VIEW MY FEEDBACK
// ==========================================

const getMyFeedback = async (req, res) => {
    try {
        const customer = req.user.userId;

        const feedback = await Feedback.find({
            customer
        })
            .populate("stylist")
            .populate("service")
            .populate("appointment")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Feedback fetched successfully",
            feedback
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch feedback",
            error: error.message
        });
    }
};


// ==========================================
// STYLIST - VIEW MY FEEDBACK
// ==========================================

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

        const feedback = await Feedback.find({
            stylist: stylist._id
        })
            .populate("customer", "name email")
            .populate("service", "name price duration")
            .populate("appointment")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Stylist feedback fetched successfully",
            feedback
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch stylist feedback",
            error: error.message
        });
    }
};


// ==========================================
// CUSTOMER - UPDATE FEEDBACK
// ==========================================

const updateFeedback = async (req, res) => {
    try {
        const customer = req.user.userId;

        const {
            rating,
            comment
        } = req.body;

        if (!rating) {
            return res.status(400).json({
                message: "Rating is required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({
                message: "Feedback not found"
            });
        }

        if (feedback.customer.toString() !== customer.toString()) {
            return res.status(403).json({
                message: "You are not allowed to update this feedback"
            });
        }

        feedback.rating = rating;
        feedback.comment = comment ? comment.trim() : "";

        await feedback.save();

        return res.status(200).json({
            message: "Feedback updated successfully",
            feedback
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to update feedback",
            error: error.message
        });
    }
};


// ==========================================
// CUSTOMER - DELETE FEEDBACK
// ==========================================

const deleteFeedback = async (req, res) => {
    try {
        const customer = req.user.userId;

        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({
                message: "Feedback not found"
            });
        }

        if (feedback.customer.toString() !== customer.toString()) {
            return res.status(403).json({
                message: "You are not allowed to delete this feedback"
            });
        }

        await Feedback.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message: "Feedback deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete feedback",
            error: error.message
        });
    }
};


module.exports = {
    addFeedback,
    getMyFeedback,
    getStylistFeedback,
    updateFeedback,
    deleteFeedback
};