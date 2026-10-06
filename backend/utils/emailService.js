const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});


const sendEmail = async (to, subject, message) => {
    try {
        await transporter.sendMail({
            from: `"BEAUTÉ Salon" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text: message
        });

        console.log(`Email sent to ${to}`);

    } catch (error) {
        console.error("Email sending failed:", error.message);
    }
};


module.exports = sendEmail;