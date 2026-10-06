const Appointment = require("../models/appointmentModel");

const User = require("../models/userModel");

const Stylist = require("../models/stylistModel");

const Service = require("../models/serviceModel");

const { sendNotification } = require("../utils/notificationUtils");


// ======================================================
// CHECK STYLIST WORKING SCHEDULE
// ======================================================

const isWithinWorkingSchedule = (
    stylist,
    date,
    startTime,
    endTime
) => {

    const appointmentDate = new Date(`${date}T00:00:00`);

    const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const appointmentDay =
        dayNames[appointmentDate.getDay()];

    const schedule = stylist.workingSchedule.find(
        (item) =>
            item.day.toLowerCase() ===
            appointmentDay.toLowerCase()
    );

    if (!schedule) {

        return {
            valid: false,
            message:
                `Stylist is not available on ${appointmentDay}`
        };
    }

    if (startTime < schedule.startTime) {

        return {
            valid: false,
            message:
                `Stylist starts working at ${schedule.startTime} on ${appointmentDay}`
        };
    }

    if (endTime > schedule.endTime) {

        return {
            valid: false,
            message:
                `Stylist finishes working at ${schedule.endTime} on ${appointmentDay}`
        };
    }

    return {
        valid: true
    };
};


// ======================================================
// CREATE APPOINTMENT
// ======================================================

const createAppointment = async (req, res) => {

    try {

        const {
            stylist,
            service,
            date,
            startTime,
            endTime
        } = req.body;


        if (!stylist || !service || !date || !startTime || !endTime) {

            return res.status(400).json({
                message:
                    "Stylist, service, date, start time and end time are required"
            });
        }


        if (startTime >= endTime) {

            return res.status(400).json({
                message:
                    "End time must be after start time"
            });
        }


        const customer = req.user.userId;


        const existingCustomer =
            await User.findById(customer);


        if (!existingCustomer) {

            return res.status(404).json({
                message:
                    "Customer not found"
            });
        }


        const existingStylist =
            await Stylist.findById(stylist);


        if (!existingStylist) {

            return res.status(404).json({
                message:
                    "Stylist not found"
            });
        }


        const existingService =
            await Service.findById(service);


        if (!existingService) {

            return res.status(404).json({
                message:
                    "Service not found"
            });
        }


        // ==================================================
        // CHECK WHETHER STYLIST PROVIDES SERVICE
        // ==================================================

        const providesService =
            existingStylist.services.some(
                (item) =>
                    item.toString() ===
                    service.toString()
            );


        if (!providesService) {

            return res.status(400).json({
                message:
                    "Selected stylist does not provide this service"
            });
        }


        // ==================================================
        // CHECK WORKING SCHEDULE
        // ==================================================

        const scheduleCheck =
            isWithinWorkingSchedule(
                existingStylist,
                date,
                startTime,
                endTime
            );


        if (!scheduleCheck.valid) {

            return res.status(400).json({
                message:
                    scheduleCheck.message
            });
        }


        // ==================================================
        // CHECK OVERLAPPING APPOINTMENT
        // ==================================================

        const existingAppointment =
            await Appointment.findOne({

                stylist,

                date,

                status: {
                    $in: [
                        "pending",
                        "approved"
                    ]
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
                message:
                    "Stylist is already booked for this time"
            });
        }


        // ==================================================
        // CREATE APPOINTMENT
        // ==================================================

        const newAppointment =
            new Appointment({

                customer,

                stylist,

                service,

                date,

                startTime,

                endTime,

                status: "pending"

            });


        await newAppointment.save();


        // ==================================================
        // NOTIFICATION TO STYLIST
        // ==================================================

        await sendNotification({

            recipient:
                existingStylist.user,

            title:
                "New Appointment Request",

            message:
                "You have received a new appointment request",

            type:
                "booking",

            emailSubject:
                "New Appointment Request - Beauté Salon",

            emailText:
                `You have received a new appointment request for ${date} at ${startTime}.`,

            emailHtml:
                `
                <h2>New Appointment Request</h2>

                <p>
                    You have received a new appointment request.
                </p>

                <p>
                    <strong>Date:</strong> ${date}<br>
                    <strong>Time:</strong> ${startTime} - ${endTime}
                </p>

                <p>
                    Please log in to view and manage the appointment.
                </p>
                `
        });


        // ==================================================
        // NOTIFICATION TO CUSTOMER
        // ==================================================

        await sendNotification({

            recipient:
                customer,

            title:
                "Appointment Request Submitted",

            message:
                "Your appointment request has been submitted successfully",

            type:
                "booking",

            emailSubject:
                "Appointment Request Submitted - Beauté Salon",

            emailText:
                `Your appointment request for ${date} at ${startTime} has been submitted successfully.`,

            emailHtml:
                `
                <h2>Appointment Request Submitted</h2>

                <p>
                    Your appointment request has been submitted successfully.
                </p>

                <p>
                    <strong>Date:</strong> ${date}<br>
                    <strong>Time:</strong> ${startTime} - ${endTime}
                </p>

                <p>
                    You will receive another notification when
                    the stylist approves or rejects your appointment.
                </p>
                `
        });


        return res.status(201).json({

            message:
                "Appointment booked successfully",

            appointmentId:
                newAppointment._id

        });

    } catch (error) {

        return res.status(500).json({

            message:
                "Appointment booking failed",

            error:
                error.message

        });
    }
};


// ======================================================
// APPROVE APPOINTMENT
// ======================================================

const approveAppointment = async (req, res) => {

    try {

        const appointmentId =
            req.params.id;

        const userId =
            req.user.userId;


        const stylist =
            await Stylist.findOne({
                user: userId
            });


        if (!stylist) {

            return res.status(404).json({
                message:
                    "Stylist profile not found"
            });
        }


        const appointment =
            await Appointment.findById(
                appointmentId
            );


        if (!appointment) {

            return res.status(404).json({
                message:
                    "Appointment not found"
            });
        }


        if (
            appointment.stylist.toString() !==
            stylist._id.toString()
        ) {

            return res.status(403).json({
                message:
                    "You are not assigned to this appointment"
            });
        }


        if (appointment.status !== "pending") {

            return res.status(400).json({
                message:
                    "Only pending appointments can be approved"
            });
        }


        appointment.status =
            "approved";

        await appointment.save();


        // ==================================================
        // NOTIFY CUSTOMER
        // ==================================================

        await sendNotification({

            recipient:
                appointment.customer,

            title:
                "Appointment Approved",

            message:
                "Your appointment has been approved",

            type:
                "approval",

            emailSubject:
                "Your Appointment Has Been Approved - Beauté Salon",

            emailText:
                `Your appointment on ${appointment.date} from ${appointment.startTime} to ${appointment.endTime} has been approved.`,

            emailHtml:
                `
                <h2>Appointment Approved</h2>

                <p>
                    Your salon appointment has been approved.
                </p>

                <p>
                    <strong>Date:</strong> ${appointment.date}<br>
                    <strong>Time:</strong> ${appointment.startTime} - ${appointment.endTime}
                </p>

                <p>
                    We look forward to seeing you.
                </p>
                `
        });


        return res.status(200).json({

            message:
                "Appointment approved successfully"

        });

    } catch (error) {

        return res.status(500).json({

            message:
                "Appointment approval failed",

            error:
                error.message

        });
    }
};


// ======================================================
// REJECT APPOINTMENT
// ======================================================

const rejectAppointment = async (req, res) => {

    try {

        const appointmentId =
            req.params.id;

        const userId =
            req.user.userId;


        const stylist =
            await Stylist.findOne({
                user: userId
            });


        if (!stylist) {

            return res.status(404).json({
                message:
                    "Stylist profile not found"
            });
        }


        const appointment =
            await Appointment.findById(
                appointmentId
            );


        if (!appointment) {

            return res.status(404).json({
                message:
                    "Appointment not found"
            });
        }


        if (
            appointment.stylist.toString() !==
            stylist._id.toString()
        ) {

            return res.status(403).json({
                message:
                    "You are not assigned to this appointment"
            });
        }


        if (appointment.status !== "pending") {

            return res.status(400).json({
                message:
                    "Only pending appointments can be rejected"
            });
        }


        appointment.status =
            "rejected";

        await appointment.save();


        // ==================================================
        // NOTIFY CUSTOMER
        // ==================================================

        await sendNotification({

            recipient:
                appointment.customer,

            title:
                "Appointment Rejected",

            message:
                "Your appointment has been rejected",

            type:
                "rejection",

            emailSubject:
                "Appointment Request Rejected - Beauté Salon",

            emailText:
                "Unfortunately, your salon appointment request has been rejected by the stylist.",

            emailHtml:
                `
                <h2>Appointment Request Rejected</h2>

                <p>
                    Unfortunately, your salon appointment request
                    has been rejected by the stylist.
                </p>

                <p>
                    Please log in to choose another available
                    appointment slot.
                </p>
                `
        });


        return res.status(200).json({

            message:
                "Appointment rejected successfully"

        });

    } catch (error) {

        return res.status(500).json({

            message:
                "Appointment rejection failed",

            error:
                error.message

        });
    }
};


// ======================================================
// GET CUSTOMER APPOINTMENTS
// ======================================================

const getMyAppointments = async (req, res) => {

    try {

        const customer =
            req.user.userId;


        const appointments =
            await Appointment.find({
                customer
            })

            .populate(
                "stylist",
                "specialization"
            )

            .populate({
                path: "service",
                select:
                    "name description duration price"
            })

            .sort({
                date: 1,
                startTime: 1
            });


        return res.status(200).json({

            message:
                "Appointments fetched successfully",

            appointments

        });

    } catch (error) {

        return res.status(500).json({

            message:
                "Failed to fetch appointments",

            error:
                error.message

        });
    }
};


// ======================================================
// GET STYLIST APPOINTMENTS
// ======================================================

const getStylistAppointments = async (req, res) => {

    try {

        const userId =
            req.user.userId;


        const stylist =
            await Stylist.findOne({
                user: userId
            });


        if (!stylist) {

            return res.status(404).json({
                message:
                    "Stylist profile not found"
            });
        }


        const appointments =
            await Appointment.find({
                stylist: stylist._id
            })

            .populate(
                "customer",
                "name email phone"
            )

            .populate(
                "service",
                "name description duration price"
            )

            .sort({
                date: 1,
                startTime: 1
            });


        return res.status(200).json({

            message:
                "Stylist appointments fetched successfully",

            appointments

        });

    } catch (error) {

        return res.status(500).json({

            message:
                "Failed to fetch stylist appointments",

            error:
                error.message

        });
    }
};


// ======================================================
// CANCEL APPOINTMENT
// ======================================================

const cancelAppointment = async (req, res) => {

    try {

        const appointmentId =
            req.params.id;

        const customer =
            req.user.userId;


        const appointment =
            await Appointment.findById(
                appointmentId
            );


        if (!appointment) {

            return res.status(404).json({
                message:
                    "Appointment not found"
            });
        }


        if (
            appointment.customer.toString() !==
            customer
        ) {

            return res.status(403).json({
                message:
                    "You are not allowed to cancel this appointment"
            });
        }


        if (
            appointment.status !== "pending" &&
            appointment.status !== "approved"
        ) {

            return res.status(400).json({
                message:
                    "This appointment cannot be cancelled"
            });
        }


        appointment.status =
            "cancelled";

        await appointment.save();


        // ==================================================
        // GET STYLIST
        // ==================================================

        const stylist =
            await Stylist.findById(
                appointment.stylist
            );


        // ==================================================
        // NOTIFY STYLIST
        // ==================================================

        if (stylist) {

            await sendNotification({

                recipient:
                    stylist.user,

                title:
                    "Appointment Cancelled",

                message:
                    "A customer has cancelled an appointment",

                type:
                    "cancellation",

                emailSubject:
                    "Appointment Cancelled - Beauté Salon",

                emailText:
                    `A customer has cancelled the appointment on ${appointment.date} at ${appointment.startTime}.`,

                emailHtml:
                    `
                    <h2>Appointment Cancelled</h2>

                    <p>
                        A customer has cancelled an appointment.
                    </p>

                    <p>
                        <strong>Date:</strong> ${appointment.date}<br>
                        <strong>Time:</strong> ${appointment.startTime} - ${appointment.endTime}
                    </p>
                    `
            });
        }


        // ==================================================
        // NOTIFY CUSTOMER
        // ==================================================

        await sendNotification({

            recipient:
                customer,

            title:
                "Appointment Cancelled",

            message:
                "Your appointment has been cancelled",

            type:
                "cancellation",

            emailSubject:
                "Your Appointment Has Been Cancelled - Beauté Salon",

            emailText:
                `Your appointment on ${appointment.date} at ${appointment.startTime} has been cancelled.`,

            emailHtml:
                `
                <h2>Appointment Cancelled</h2>

                <p>
                    Your salon appointment has been cancelled.
                </p>

                <p>
                    <strong>Date:</strong> ${appointment.date}<br>
                    <strong>Time:</strong> ${appointment.startTime} - ${appointment.endTime}
                </p>
                `
        });


        return res.status(200).json({

            message:
                "Appointment cancelled successfully"

        });

    } catch (error) {

        return res.status(500).json({

            message:
                "Appointment cancellation failed",

            error:
                error.message

        });
    }
};


// ======================================================
// RESCHEDULE APPOINTMENT
// ======================================================

const rescheduleAppointment = async (req, res) => {

    try {

        const appointmentId =
            req.params.id;

        const customer =
            req.user.userId;


        const {
            date,
            startTime,
            endTime
        } = req.body;


        if (startTime >= endTime) {

            return res.status(400).json({
                message:
                    "End time must be after start time"
            });
        }


        const appointment =
            await Appointment.findById(
                appointmentId
            );


        if (!appointment) {

            return res.status(404).json({
                message:
                    "Appointment not found"
            });
        }


        if (
            appointment.customer.toString() !==
            customer
        ) {

            return res.status(403).json({
                message:
                    "You are not allowed to reschedule this appointment"
            });
        }


        if (
            appointment.status !== "pending" &&
            appointment.status !== "approved"
        ) {

            return res.status(400).json({
                message:
                    "This appointment cannot be rescheduled"
            });
        }


        const stylist =
            await Stylist.findById(
                appointment.stylist
            );


        if (!stylist) {

            return res.status(404).json({
                message:
                    "Stylist not found"
            });
        }


        // ==================================================
        // CHECK WORKING SCHEDULE
        // ==================================================

        const scheduleCheck =
            isWithinWorkingSchedule(
                stylist,
                date,
                startTime,
                endTime
            );


        if (!scheduleCheck.valid) {

            return res.status(400).json({
                message:
                    scheduleCheck.message
            });
        }


        // ==================================================
        // CHECK OVERLAP
        // ==================================================

        const existingAppointment =
            await Appointment.findOne({

                _id: {
                    $ne: appointmentId
                },

                stylist:
                    appointment.stylist,

                date,

                status: {
                    $in: [
                        "pending",
                        "approved"
                    ]
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

                message:
                    "Stylist is already booked for the new time"

            });
        }


        appointment.date =
            date;

        appointment.startTime =
            startTime;

        appointment.endTime =
            endTime;


        await appointment.save();


        // ==================================================
        // NOTIFY STYLIST
        // ==================================================

        await sendNotification({

            recipient:
                stylist.user,

            title:
                "Appointment Rescheduled",

            message:
                "A customer has rescheduled an appointment",

            type:
                "reschedule",

            emailSubject:
                "Appointment Rescheduled - Beauté Salon",

            emailText:
                `A customer has rescheduled an appointment to ${date} at ${startTime}.`,

            emailHtml:
                `
                <h2>Appointment Rescheduled</h2>

                <p>
                    A customer has rescheduled an appointment.
                </p>

                <p>
                    <strong>New Date:</strong> ${date}<br>
                    <strong>New Time:</strong> ${startTime} - ${endTime}
                </p>
                `
        });


        // ==================================================
        // NOTIFY CUSTOMER
        // ==================================================

        await sendNotification({

            recipient:
                customer,

            title:
                "Appointment Rescheduled",

            message:
                "Your appointment has been rescheduled",

            type:
                "reschedule",

            emailSubject:
                "Your Appointment Has Been Rescheduled - Beauté Salon",

            emailText:
                `Your appointment has been rescheduled to ${date} at ${startTime}.`,

            emailHtml:
                `
                <h2>Appointment Rescheduled</h2>

                <p>
                    Your appointment has been successfully rescheduled.
                </p>

                <p>
                    <strong>New Date:</strong> ${date}<br>
                    <strong>New Time:</strong> ${startTime} - ${endTime}
                </p>
                `
        });


        return res.status(200).json({

            message:
                "Appointment rescheduled successfully"

        });

    } catch (error) {

        return res.status(500).json({

            message:
                "Appointment rescheduling failed",

            error:
                error.message

        });
    }
};


// ======================================================
// COMPLETE APPOINTMENT
// ======================================================

const completeAppointment = async (req, res) => {

    try {

        const appointmentId =
            req.params.id;

        const userId =
            req.user.userId;


        const stylist =
            await Stylist.findOne({
                user: userId
            });


        if (!stylist) {

            return res.status(404).json({
                message:
                    "Stylist profile not found"
            });
        }


        const appointment =
            await Appointment.findById(
                appointmentId
            );


        if (!appointment) {

            return res.status(404).json({
                message:
                    "Appointment not found"
            });
        }


        if (
            appointment.stylist.toString() !==
            stylist._id.toString()
        ) {

            return res.status(403).json({
                message:
                    "You are not assigned to this appointment"
            });
        }


        if (appointment.status !== "approved") {

            return res.status(400).json({
                message:
                    "Only approved appointments can be completed"
            });
        }


        appointment.status =
            "completed";

        await appointment.save();


        // ==================================================
        // NOTIFY CUSTOMER
        // ==================================================

        await sendNotification({

            recipient:
                appointment.customer,

            title:
                "Appointment Completed",

            message:
                "Your appointment has been completed. You can now rate your service.",

            type:
                "completion",

            emailSubject:
                "Thank You for Visiting Beauté Salon",

            emailText:
                "Your appointment has been completed. You can now rate your service.",

            emailHtml:
                `
                <h2>Thank You for Visiting Beauté Salon</h2>

                <p>
                    Your appointment has been completed successfully.
                </p>

                <p>
                    We would love to hear about your experience.
                    Please log in to rate your service and stylist.
                </p>
                `
        });


        return res.status(200).json({

            message:
                "Appointment completed successfully"

        });

    } catch (error) {

        return res.status(500).json({

            message:
                "Appointment completion failed",

            error:
                error.message

        });
    }
};


// ======================================================
// EXPORT
// ======================================================

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