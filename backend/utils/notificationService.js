const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

const sendEmail = require("./emailService");
const { sendToUser } = require("./socket");


// ======================================================
// SEND IN-APP NOTIFICATION + EMAIL
// ======================================================

const sendNotification = async ({
    recipient,
    title,
    message,
    type,
    emailSubject,
    emailText
}) => {

    // -------------------------------
    // IN-APP NOTIFICATION
    // -------------------------------

    try {

        const notification = await Notification.create({
            recipient,
            title,
            message,
            type
        });

        // Push it to the user's browser straight away (if they are online)
        sendToUser(recipient, notification);

    } catch (error) {

        console.error(
            "In-app notification failed:",
            error.message
        );

    }


    // -------------------------------
    // EMAIL NOTIFICATION
    // -------------------------------

    try {

        const user = await User.findById(recipient)
            .select("email");

        if (
            user &&
            user.email &&
            emailSubject &&
            emailText
        ) {

            await sendEmail(
                user.email,
                emailSubject,
                emailText
            );

        }

    } catch (error) {

        console.error(
            "Email notification failed:",
            error.message
        );

    }

};


module.exports = sendNotification;
