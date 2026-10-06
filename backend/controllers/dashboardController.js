const User = require("../models/userModel");
const Stylist = require("../models/stylistModel");
const Service = require("../models/serviceModel");
const Appointment = require("../models/appointmentModel");
const Feedback = require("../models/feedbackModel");
const Complaint = require("../models/complaintModel");

const getDashboardStats = async (req, res) => {
    try {
        const totalCustomers = await User.countDocuments({
            role: "customer"
        });

        const totalStylists = await User.countDocuments({
            role: "stylist"
        });

        const totalServices = await Service.countDocuments();

        const totalAppointments = await Appointment.countDocuments();

        const pendingAppointments = await Appointment.countDocuments({
            status: "pending"
        });

        const approvedAppointments = await Appointment.countDocuments({
            status: "approved"
        });

        const completedAppointments = await Appointment.countDocuments({
            status: "completed"
        });

        const cancelledAppointments = await Appointment.countDocuments({
            status: "cancelled"
        });

        const rejectedAppointments = await Appointment.countDocuments({
            status: "rejected"
        });

        const totalFeedback = await Feedback.countDocuments();

        const totalComplaints = await Complaint.countDocuments();

        const pendingComplaints = await Complaint.countDocuments({
            status: "pending"
        });

        res.status(200).json({
            message: "Dashboard statistics fetched successfully",

            statistics: {
                totalCustomers,
                totalStylists,
                totalServices,
                totalAppointments,

                appointments: {
                    pending: pendingAppointments,
                    approved: approvedAppointments,
                    completed: completedAppointments,
                    cancelled: cancelledAppointments,
                    rejected: rejectedAppointments
                },

                totalFeedback,
                totalComplaints,
                pendingComplaints
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch dashboard statistics"
        });
    }
};

module.exports = {
    getDashboardStats
};