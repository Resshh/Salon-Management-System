const User = require("../models/userModel");
const Stylist = require("../models/stylistModel");
const Service = require("../models/serviceModel");
const Appointment = require("../models/appointmentModel");
const Feedback = require("../models/feedbackModel");
const Complaint = require("../models/complaintModel");
const sendNotification = require("../utils/notificationService");


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

            // Skip profiles whose user account was deleted
            stylists: stylists.filter(
                (stylist) => stylist.user
            )

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
// UPDATE A CUSTOMER OR STYLIST
// PUT /api/admin/users/:id
// ======================================================

const updateUser = async (req, res) => {

    try {

        const {
            name,
            phone,
            membership,
            loyaltyPoints,
            specialization
        } = req.body;

        const user = await User.findById(req.params.id);

        if (!user || user.role === "admin") {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.name = name ?? user.name;
        user.phone = phone ?? user.phone;
        user.membership = membership ?? user.membership;
        user.loyaltyPoints = loyaltyPoints ?? user.loyaltyPoints;

        await user.save();

        // Specialization is stored on the stylist profile
        if (user.role === "stylist" && specialization) {

            await Stylist.findOneAndUpdate(
                { user: user._id },
                { specialization }
            );

        }

        res.status(200).json({
            message: "User updated successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to update user",
            error: error.message
        });

    }

};


// ======================================================
// DELETE A CUSTOMER OR STYLIST
// DELETE /api/admin/users/:id
// ======================================================

const deleteUser = async (req, res) => {

    try {

        const user = await User.findById(req.params.id);

        if (!user || user.role === "admin") {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Do not delete someone who still has open appointments
        let filter = { customer: user._id };

        if (user.role === "stylist") {

            const stylist = await Stylist.findOne({ user: user._id });

            filter = { stylist: stylist ? stylist._id : null };

        }

        const openAppointment = await Appointment.findOne({
            ...filter,
            status: { $in: ["pending", "approved"] }
        });

        if (openAppointment) {
            return res.status(400).json({
                message: "This user still has pending or approved appointments"
            });
        }

        if (user.role === "stylist") {
            await Stylist.findOneAndDelete({ user: user._id });
        }

        await User.findByIdAndDelete(user._id);

        res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to delete user",
            error: error.message
        });

    }

};


// ======================================================
// SEND A NOTIFICATION / OFFER TO ALL CUSTOMERS
// POST /api/admin/notify   body: { title, message }
// ======================================================

const sendPromotion = async (req, res) => {

    try {

        const { title, message } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                message: "Title and message are required"
            });
        }

        const customers = await User.find({
            role: "customer"
        }).select("_id");

        // Sends to one customer at a time. Fine for a small salon; a job queue is better for a very large customer list.
        for (const customer of customers) {

            await sendNotification({
                recipient: customer._id,
                title,
                message,
                type: "promotion",
                emailSubject: `${title} - Beauté Salon`,
                emailText: message
            });

        }

        res.status(200).json({
            message: `Notification sent to ${customers.length} customers`
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to send notification",
            error: error.message
        });

    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    updateUser,
    deleteUser,
    sendPromotion,

    getCustomers,
    getStylists,
    getServices,
    getAppointments,
    getFeedback,
    getComplaints

};