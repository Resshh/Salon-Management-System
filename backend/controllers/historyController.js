const Appointment = require("../models/appointmentModel");
const Stylist = require("../models/stylistModel");


// ==========================================
// CUSTOMER - SERVICE HISTORY
// ==========================================

const getCustomerHistory = async (req, res) => {
    try {
        const customer = req.user.userId;

        const history = await Appointment.find({
            customer,
            status: "completed"
        })
            .populate("stylist")
            .populate("service")
            .sort({ date: -1 });

        return res.status(200).json({
            message: "Service history fetched successfully",
            history
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch service history",
            error: error.message
        });
    }
};


// ==========================================
// STYLIST - CUSTOMER SERVICE HISTORY
// ==========================================

const getCustomerHistoryForStylist = async (req, res) => {
    try {
        const stylist = await Stylist.findOne({
            user: req.user.userId
        });

        if (!stylist) {
            return res.status(404).json({
                message: "Stylist profile not found"
            });
        }

        const customerId = req.params.customerId;

        const history = await Appointment.find({
            customer: customerId,
            stylist: stylist._id,
            status: "completed"
        })
            .populate("customer", "name email phone")
            .populate("service")
            .sort({ date: -1 });

        return res.status(200).json({
            message: "Customer service history fetched successfully",
            history
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch customer service history",
            error: error.message
        });
    }
};


module.exports = {
    getCustomerHistory,
    getCustomerHistoryForStylist
};