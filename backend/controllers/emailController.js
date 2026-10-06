const User = require("../models/userModel");
const sendEmail = require("../utils/emailService");

const sendTestEmail = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await sendEmail(
            user.email,
            "BEAUTÉ Email Test",
            "This is a test email from the BEAUTÉ Salon Management System."
        );

        res.status(200).json({
            message: "Test email sent successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to send test email"
        });
    }
};

module.exports = {
    sendTestEmail
};