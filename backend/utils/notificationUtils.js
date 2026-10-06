const nodemailer = require("nodemailer");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");


// ======================================================
// EMAIL TRANSPORTER
// ======================================================

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});


// ======================================================
// SEND EMAIL
// ======================================================

const sendEmail = async (to, subject, text, html) => {

    try {

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("Email sent:", info.messageId);

        return true;

    } catch (error) {

        console.error("Email sending failed:", error.message);

        return false;
    }
};


// ======================================================
// SEND IN-APP + EMAIL NOTIFICATION
// ======================================================

const sendNotification = async ({
    recipient,
    title,
    message,
    type,
    emailSubject,
    emailText,
    emailHtml
}) => {

    try {

        // ------------------------------------------
        // FIND RECIPIENT
        // ------------------------------------------

        const user = await User.findById(recipient);

        if (!user) {

            console.error(
                "Notification recipient not found:",
                recipient
            );

            return null;
        }


        // ------------------------------------------
        // CREATE IN-APP NOTIFICATION
        // ------------------------------------------

        const notification = await Notification.create({
            recipient: recipient,
            title: title,
            message: message,
            type: type
        });


        // ------------------------------------------
        // SEND EMAIL
        // ------------------------------------------

        if (user.email) {

            await sendEmail(
                user.email,
                emailSubject || title,
                emailText || message,
                emailHtml || `<p>${message}</p>`
            );

        }


        return notification;

    } catch (error) {

        console.error(
            "Notification error:",
            error.message
        );

        return null;
    }
};


module.exports = {
    sendEmail,
    sendNotification
};