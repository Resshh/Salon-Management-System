const User = require("../models/userModel");
const Stylist = require("../models/stylistModel");
const Service = require("../models/serviceModel");
const Appointment = require("../models/appointmentModel");
const Feedback = require("../models/feedbackModel");
const Complaint = require("../models/complaintModel");


// Get all customers
const getCustomers = async (req, res) => {
    try {
        const customers = await User.find({
            role: "customer"
        }).select("-password");

        res.status(200).json({
            message: "Customers fetched successfully",
            customers
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch customers"
        });
    }
};


// Get all stylists
const getStylists = async (req, res) => {
    try {
        const stylists = await Stylist.find()
            .populate("user", "name email phone gender dateOfBirth")
            .populate("services", "name price duration");

        res.status(200).json({
            message: "Stylists fetched successfully",
            stylists
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch stylists"
        });
    }
};


// Get all services
const getServices = async (req, res) => {
    try {
        const services = await Service.find()
            .populate("category", "name");

        res.status(200).json({
            message: "Services fetched successfully",
            services
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch services"
        });
    }
};


// Get all appointments
const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate("customer", "name email phone")
            .populate({
                path: "stylist",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .populate("service", "name price duration")
            .sort({ date: -1 });

        res.status(200).json({
            message: "Appointments fetched successfully",
            appointments
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch appointments"
        });
    }
};


// Get all feedback
const getFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find()
            .populate("customer", "name email")
            .populate({
                path: "appointment",
                populate: [
                    {
                        path: "service",
                        select: "name price"
                    },
                    {
                        path: "stylist",
                        populate: {
                            path: "user",
                            select: "name"
                        }
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


// Get all complaints
const getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate("customer", "name email phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Complaints fetched successfully",
            complaints
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch complaints"
        });
    }
};


module.exports = {
    getCustomers,
    getStylists,
    getServices,
    getAppointments,
    getFeedback,
    getComplaints
};