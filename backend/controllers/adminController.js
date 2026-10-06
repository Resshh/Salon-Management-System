const User = require("../models/userModel");
const Stylist = require("../models/stylistModel");
const Service = require("../models/serviceModel");
const Appointment = require("../models/appointmentModel");
const Feedback = require("../models/feedbackModel");
const Complaint = require("../models/complaintModel");


// ======================================================
// GET ALL CUSTOMERS
// ======================================================

const getCustomers = async (req, res) => {

    try {

        const customers = await User.find({
            role: "customer"
        })
        .select("-password")
        .sort({
            createdAt: -1
        });

        res.status(200).json({
            message: "Customers fetched successfully",
            customers
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch customers",
            error: error.message
        });

    }

};


// ======================================================
// GET ALL STYLISTS
// ======================================================

const getStylists = async (req, res) => {

    try {

        const stylists = await Stylist.find()

            .populate(
                "user",
                "name email phone gender dateOfBirth role"
            )

            .populate(
                "services",
                "name description duration price"
            )

            .sort({
                createdAt: -1
            });


        res.status(200).json({

            message:
                "Stylists fetched successfully",

            stylists

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to fetch stylists",

            error:
                error.message

        });

    }

};


// ======================================================
// GET ALL SERVICES
// ======================================================

const getServices = async (req, res) => {

    try {

        const services = await Service.find()

            .populate(
                "category",
                "name"
            )

            .sort({
                createdAt: -1
            });


        res.status(200).json({

            message:
                "Services fetched successfully",

            services

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to fetch services",

            error:
                error.message

        });

    }

};


// ======================================================
// GET ALL APPOINTMENTS
// ======================================================

const getAppointments = async (req, res) => {

    try {

        const appointments =
            await Appointment.find()

                .populate(
                    "customer",
                    "name email phone"
                )

                .populate({
                    path: "stylist",
                    populate: {
                        path: "user",
                        select:
                            "name email phone"
                    }
                })

                .populate(
                    "service",
                    "name description duration price"
                )

                .sort({
                    date: 1,
                    startTime: 1
                });


        res.status(200).json({

            message:
                "Appointments fetched successfully",

            appointments

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to fetch appointments",

            error:
                error.message

        });

    }

};


// ======================================================
// GET ALL FEEDBACK
// ======================================================

const getFeedback = async (req, res) => {

    try {

        const feedback =
            await Feedback.find()

                .populate(
                    "customer",
                    "name email"
                )

                .populate({
                    path: "appointment",

                    populate: [
                        {
                            path: "service",
                            select:
                                "name price duration"
                        },
                        {
                            path: "stylist",

                            populate: {
                                path: "user",
                                select:
                                    "name email"
                            }
                        }
                    ]
                })

                .sort({
                    createdAt: -1
                });


        res.status(200).json({

            message:
                "Feedback fetched successfully",

            feedback

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to fetch feedback",

            error:
                error.message

        });

    }

};


// ======================================================
// GET ALL COMPLAINTS
// ======================================================

const getComplaints = async (req, res) => {

    try {

        const complaints =
            await Complaint.find()

                .populate(
                    "customer",
                    "name email phone"
                )

                .sort({
                    createdAt: -1
                });


        res.status(200).json({

            message:
                "Complaints fetched successfully",

            complaints

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to fetch complaints",

            error:
                error.message

        });

    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getCustomers,
    getStylists,
    getServices,
    getAppointments,
    getFeedback,
    getComplaints

};