const Complaint = require("../models/complaintModel");
const sendNotification = require("../utils/notificationService");


// Customer creates complaint
const createComplaint = async (req, res) => {
    try {
        const { subject, description } = req.body;

        const complaint = await Complaint.create({
            customer: req.user.userId,
            subject,
            description
        });

        res.status(201).json({
            message: "Complaint submitted successfully",
            complaint
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to submit complaint"
        });
    }
};


// Customer views own complaints
const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({
            customer: req.user.userId
        }).sort({ createdAt: -1 });

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


// Admin views all complaints
const getAllComplaints = async (req, res) => {
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


// Admin updates complaint
const updateComplaint = async (req, res) => {
    try {
        const { status, adminResponse } = req.body;

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        if (status) {
            complaint.status = status;
        }

        if (adminResponse !== undefined) {
            complaint.adminResponse = adminResponse;
        }

        await complaint.save();

        await sendNotification({
            recipient: complaint.customer,
            title: "Complaint Updated",
            message: `Your complaint "${complaint.subject}" is now ${complaint.status}.`,
            type: "general",
            emailSubject: "Update on your complaint - Beauté Salon",
            emailText: `Your complaint "${complaint.subject}" is now ${complaint.status}.\n\nSalon response: ${complaint.adminResponse || "No response yet"}`
        });

        res.status(200).json({
            message: "Complaint updated successfully",
            complaint
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update complaint"
        });
    }
};


module.exports = {
    createComplaint,
    getMyComplaints,
    getAllComplaints,
    updateComplaint
};