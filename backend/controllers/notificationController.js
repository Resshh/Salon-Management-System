const Notification = require("../models/notificationModel");

const getMyNotifications = async (req, res) => {
    try {
        const recipient = req.user.userId;

        const notifications = await Notification.find({ recipient })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Notifications fetched successfully",
            notifications
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch notifications",
            error: error.message
        });
    }
};


const markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const recipient = req.user.userId;

        const notification = await Notification.findOne({
            _id: notificationId,
            recipient
        });

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        notification.isRead = true;

        await notification.save();

        return res.status(200).json({
            message: "Notification marked as read"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to update notification",
            error: error.message
        });
    }
};


module.exports = {
    getMyNotifications,
    markNotificationAsRead
};