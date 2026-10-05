const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");
const Stylist = require("../models/stylistModel");
const Service = require("../models/serviceModel");

const createAppointment = async (req, res) => {
    try {
        const {
            stylist,
            service,
            date,
            startTime,
            endTime
        } = req.body;

        // Customer comes from logged-in user's JWT
        const customer = req.user.userId;

        // Check customer
        const existingCustomer = await User.findById(customer);

        if (!existingCustomer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        // Check stylist
        const existingStylist = await Stylist.findById(stylist);

        if (!existingStylist) {
            return res.status(404).json({
                message: "Stylist not found"
            });
        }

        // Check service
        const existingService = await Service.findById(service);

        if (!existingService) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        // Check for overlapping appointment
        const existingAppointment = await Appointment.findOne({
            stylist,
            date,
            status: {
                $in: ["pending", "approved"]
            },
            startTime: {
                $lt: endTime
            },
            endTime: {
                $gt: startTime
            }
        });

        if (existingAppointment) {
            return res.status(400).json({
                message: "Stylist is already booked for this time"
            });
        }

        // Create appointment
        const newAppointment = new Appointment({
            customer,
            stylist,
            service,
            date,
            startTime,
            endTime,
            status: "pending"
        });

        await newAppointment.save();

        return res.status(201).json({
            message: "Appointment booked successfully",
            appointmentId: newAppointment._id
        });

    } catch (error) {
        return res.status(500).json({
            message: "Appointment booking failed",
            error: error.message
        });
    }
};

const approveAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const userId = req.user.userId;

        const stylist = await Stylist.findOne({ user: userId });

        if (!stylist) {
            return res.status(404).json({
                message: "Stylist profile not found"
            });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if (appointment.stylist.toString() !== stylist._id.toString()) {
            return res.status(403).json({
                message: "You are not assigned to this appointment"
            });
        }

        if (appointment.status !== "pending") {
            return res.status(400).json({
                message: "Only pending appointments can be approved"
            });
        }

        appointment.status = "approved";

        await appointment.save();

        return res.status(200).json({
            message: "Appointment approved successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Appointment approval failed",
            error: error.message
        });
    }
};


const rejectAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const userId = req.user.userId;

        const stylist = await Stylist.findOne({ user: userId });

        if (!stylist) {
            return res.status(404).json({
                message: "Stylist profile not found"
            });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if (appointment.stylist.toString() !== stylist._id.toString()) {
            return res.status(403).json({
                message: "You are not assigned to this appointment"
            });
        }

        if (appointment.status !== "pending") {
            return res.status(400).json({
                message: "Only pending appointments can be rejected"
            });
        }

        appointment.status = "rejected";

        await appointment.save();

        return res.status(200).json({
            message: "Appointment rejected successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Appointment rejection failed",
            error: error.message
        });
    }
};

const getMyAppointments = async (req, res) => {
    try {
        const customer = req.user.userId;

        const appointments = await Appointment.find({ customer })
            .populate("stylist", "specialization")
            .populate({
                path: "service",
                select: "name description duration price"
            })
            .sort({ date: 1, startTime: 1 });

        return res.status(200).json({
            message: "Appointments fetched successfully",
            appointments
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch appointments",
            error: error.message
        });
    }
};

const getStylistAppointments = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Find the stylist profile of the logged-in stylist
        const stylist = await Stylist.findOne({ user: userId });

        if (!stylist) {
            return res.status(404).json({
                message: "Stylist profile not found"
            });
        }

        const appointments = await Appointment.find({
            stylist: stylist._id
        })
            .populate("customer", "name email phone")
            .populate("service", "name description duration price")
            .sort({ date: 1, startTime: 1 });

        return res.status(200).json({
            message: "Stylist appointments fetched successfully",
            appointments
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch stylist appointments",
            error: error.message
        });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const customer = req.user.userId;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        // Make sure this appointment belongs to the logged-in customer
        if (appointment.customer.toString() !== customer) {
            return res.status(403).json({
                message: "You are not allowed to cancel this appointment"
            });
        }

        // Only pending or approved appointments can be cancelled
        if (
            appointment.status !== "pending" &&
            appointment.status !== "approved"
        ) {
            return res.status(400).json({
                message: "This appointment cannot be cancelled"
            });
        }

        appointment.status = "cancelled";

        await appointment.save();

        return res.status(200).json({
            message: "Appointment cancelled successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Appointment cancellation failed",
            error: error.message
        });
    }
};

const rescheduleAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const customer = req.user.userId;

        const {
            date,
            startTime,
            endTime
        } = req.body;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        // Make sure this appointment belongs to the customer
        if (appointment.customer.toString() !== customer) {
            return res.status(403).json({
                message: "You are not allowed to reschedule this appointment"
            });
        }

        // Only pending or approved appointments can be rescheduled
        if (
            appointment.status !== "pending" &&
            appointment.status !== "approved"
        ) {
            return res.status(400).json({
                message: "This appointment cannot be rescheduled"
            });
        }

        // Check whether the new time overlaps another appointment
        const existingAppointment = await Appointment.findOne({
            _id: { $ne: appointmentId },
            stylist: appointment.stylist,
            date,
            status: {
                $in: ["pending", "approved"]
            },
            startTime: {
                $lt: endTime
            },
            endTime: {
                $gt: startTime
            }
        });

        if (existingAppointment) {
            return res.status(400).json({
                message: "Stylist is already booked for the new time"
            });
        }

        appointment.date = date;
        appointment.startTime = startTime;
        appointment.endTime = endTime;

        await appointment.save();

        return res.status(200).json({
            message: "Appointment rescheduled successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Appointment rescheduling failed",
            error: error.message
        });
    }
};

const completeAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const userId = req.user.userId;

        const stylist = await Stylist.findOne({ user: userId });

        if (!stylist) {
            return res.status(404).json({
                message: "Stylist profile not found"
            });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        // Make sure this appointment belongs to this stylist
        if (appointment.stylist.toString() !== stylist._id.toString()) {
            return res.status(403).json({
                message: "You are not assigned to this appointment"
            });
        }

        // Only approved appointments can be completed
        if (appointment.status !== "approved") {
            return res.status(400).json({
                message: "Only approved appointments can be completed"
            });
        }

        appointment.status = "completed";

        await appointment.save();

        return res.status(200).json({
            message: "Appointment completed successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Appointment completion failed",
            error: error.message
        });
    }
};

module.exports = {
    createAppointment,
    approveAppointment,
    rejectAppointment,
    getMyAppointments,
    getStylistAppointments,
    cancelAppointment,
    rescheduleAppointment,
    completeAppointment
};