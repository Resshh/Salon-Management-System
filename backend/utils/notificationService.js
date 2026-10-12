const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

const sendEmail = require("./emailService");
const { sendToUser } = require("./socket");



const sendNotification = async ({
    recipient,
    title,
    message,
    type,
    emailSubject,
    emailText
}) => {


    try {

        const notification = await Notification.create({
            recipient,
            title,
            message,
            type
        });

        sendToUser(recipient, notification);

    } catch (error) {

        console.error(
            "In-app notification failed:",
            error.message
        );

    }



    try {

        const user = await User.findById(recipient)
            .select("email");

        if (
            user &&
            user.email &&
            emailSubject &&
            emailText
        ) {

            sendEmail(
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
