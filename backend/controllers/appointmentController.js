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

module.exports = {
    createAppointment
};