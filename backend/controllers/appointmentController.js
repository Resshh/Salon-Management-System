const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");
const Stylist = require("../models/stylistModel");
const Service = require("../models/serviceModel");
const ServiceHistory = require("../models/serviceHistoryModel");

const sendNotification = require("../utils/notificationService");
const { refundIfPaid } = require("./paymentController");

// Date, time and opening-hours helpers shared with clock in and the dashboard
const {
    DAY_NAMES,
    isValidDate,
    isValidTime,
    toMinutes,
    toTime,
    getToday,
    getTimeNow,
    isSalonOpen
} = require("../utils/salonHours");


// ======================================================
// CHECK STYLIST WORKING SCHEDULE
// ======================================================

const isWithinWorkingSchedule = (
    stylist,
    date,
    startTime,
    endTime
) => {

    const appointmentDate =
        new Date(`${date}T00:00:00`);

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

    // A stylist can have several working time slots on one day
    // (for example 10:00-13:00 and 15:00-18:00), so collect all of them
    const daySlots =
        stylist.workingSchedule.filter(
            (item) =>
                item.day.toLowerCase() ===
                appointmentDay.toLowerCase()
        );

    if (daySlots.length === 0) {

        return {
            valid: false,
            message:
                `Stylist is not available on ${appointmentDay}`
        };

    }

    // The appointment must fit completely inside ONE of those slots
    const fits = daySlots.some(
        (slot) =>
            startTime >= slot.startTime &&
            endTime <= slot.endTime
    );

    if (!fits) {

        const hours = daySlots
            .map((slot) => `${slot.startTime} - ${slot.endTime}`)
            .join(", ");

        return {
            valid: false,
            message:
                `Stylist works on ${appointmentDay} at: ${hours}`
        };

    }

    return {
        valid: true
    };

};


// ======================================================
// INPUT CHECK
// Never trust what the browser sends: the date and time must have the exact
// shape the rest of this file relies on ("2026-10-07" and "09:30").
// The shape checks themselves are in utils/salonHours.js.
// ======================================================

// Checks a date and start time sent by the browser.
// Returns an error message, or null when everything is fine.
const checkDateAndTime = (date, startTime) => {

    if (!isValidDate(date) || !isValidTime(startTime)) {
        return "Date must look like 2026-10-07 and time like 09:30";
    }

    if (date < getToday()) {
        return "You cannot choose a date in the past";
    }

    if (date === getToday() && startTime <= getTimeNow()) {
        return "That time has already passed today";
    }

    return null;

};


// ======================================================
// GET AVAILABLE SLOTS
// GET /api/appointment/slots?stylist=..&service=..&date=YYYY-MM-DD
// ======================================================

const getAvailableSlots = async (req, res) => {

    try {

        const { stylist, service, date } = req.query;

        if (!stylist || !service || !date) {
            return res.status(400).json({
                message: "Stylist, service and date are required"
            });
        }

        if (!isValidDate(date)) {
            return res.status(400).json({
                message: "Date must look like 2026-10-07"
            });
        }

        // No slots for a day that is already over
        if (date < getToday()) {
            return res.status(200).json({
                message: "That date is in the past",
                slots: []
            });
        }

        const existingStylist = await Stylist.findById(stylist);
        const existingService = await Service.findById(service);

        if (!existingStylist || !existingService) {
            return res.status(404).json({
                message: "Stylist or service not found"
            });
        }

        // Stylist's working hours for that day
        const dayName =
            DAY_NAMES[new Date(`${date}T00:00:00`).getDay()];

        // All the working time slots of that day (there can be more than one)
        const daySlots = existingStylist.workingSchedule.filter(
            (item) => item.day.toLowerCase() === dayName.toLowerCase()
        );

        if (daySlots.length === 0) {
            return res.status(200).json({
                message: `Stylist is not available on ${dayName}`,
                slots: []
            });
        }

        // Appointments that already block the stylist on that date
        const bookedAppointments = await Appointment.find({
            stylist,
            date,
            status: { $in: ["pending", "approved"] }
        });

        const slots = [];

        const duration = existingService.duration;

        // Go through each working time slot of the day
        for (const workSlot of daySlots) {

        const dayStart = toMinutes(workSlot.startTime);
        const dayEnd = toMinutes(workSlot.endTime);

        // Try an appointment every 30 minutes inside this working slot
        for (
            let start = dayStart;
            start + duration <= dayEnd;
            start += 30
        ) {

            const startTime = toTime(start);
            const endTime = toTime(start + duration);

            // Today: skip times that have already passed
            if (date === getToday() && startTime <= getTimeNow()) {
                continue;
            }

            const salonCheck = await isSalonOpen(date, startTime, endTime);

            if (!salonCheck.valid) {
                continue;
            }

            // Two time ranges overlap when each one starts before the other ends
            const isBooked = bookedAppointments.some(
                (item) =>
                    item.startTime < endTime &&
                    item.endTime > startTime
            );

            if (!isBooked) {
                slots.push({ startTime, endTime });
            }

        }

        }

        // Show the earliest time first
        slots.sort((a, b) => a.startTime.localeCompare(b.startTime));

        return res.status(200).json({
            message: "Available slots fetched successfully",
            slots
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch available slots",
            error: error.message
        });

    }

};


// ======================================================
// CREATE APPOINTMENT
// ======================================================

const createAppointment = async (req, res) => {

    try {

        // The end time is NOT taken from the browser. It is worked out below
        // from the service duration, so nobody can book a shorter or longer time.
        const {
            stylist,
            service,
            date,
            startTime
        } = req.body;


        if (
            !stylist ||
            !service ||
            !date ||
            !startTime
        ) {

            return res.status(400).json({
                message:
                    "Stylist, service, date and start time are required"
            });

        }


        const inputError =
            checkDateAndTime(date, startTime);

        if (inputError) {

            return res.status(400).json({
                message:
                    inputError
            });

        }


        const customer =
            req.user.userId;


        // ------------------------------------------
        // CHECK CUSTOMER
        // ------------------------------------------

        const existingCustomer =
            await User.findById(customer);

        if (!existingCustomer) {

            return res.status(404).json({
                message:
                    "Customer not found"
            });

        }


        // ------------------------------------------
        // CHECK STYLIST
        // ------------------------------------------

        const existingStylist =
            await Stylist.findById(stylist);

        if (!existingStylist) {

            return res.status(404).json({
                message:
                    "Stylist not found"
            });

        }


        // ------------------------------------------
        // CHECK SERVICE
        // ------------------------------------------

        const existingService =
            await Service.findById(service);

        if (!existingService) {

            return res.status(404).json({
                message:
                    "Service not found"
            });

        }

        // The admin has hidden this service
        if (!existingService.availability) {

            return res.status(400).json({
                message:
                    "This service is not available right now"
            });

        }

        // End time = start time + how long the service takes
        const endTime =
            toTime(
                toMinutes(startTime) +
                existingService.duration
            );


        // ------------------------------------------
        // CHECK STYLIST PROVIDES SERVICE
        // ------------------------------------------

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


        // ------------------------------------------
        // CHECK SALON HOURS AND HOLIDAYS
        // ------------------------------------------

        const salonCheck =
            await isSalonOpen(date, startTime, endTime);

        if (!salonCheck.valid) {

            return res.status(400).json({
                message:
                    salonCheck.message
            });

        }


        // ------------------------------------------
        // CHECK WORKING SCHEDULE
        // ------------------------------------------

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


        // ------------------------------------------
        // CHECK OVERLAPPING APPOINTMENT
        // ------------------------------------------

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


        // ------------------------------------------
        // CREATE APPOINTMENT
        // ------------------------------------------

        const newAppointment =
            new Appointment({

                // the moment the customer asked (used for waiting time)
                requestedAt:
                    new Date(),

                customer,

                stylist,

                service,

                date,

                startTime,

                endTime,

                status: "pending"

            });


        await newAppointment.save();


        // ------------------------------------------
        // NOTIFY STYLIST
        // ------------------------------------------

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
                `You have received a new appointment request for ${date} at ${startTime} - ${endTime}.`

        });


        // ------------------------------------------
        // NOTIFY CUSTOMER
        // ------------------------------------------

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
                `Your appointment request for ${date} at ${startTime} - ${endTime} has been submitted successfully. You will receive another notification when the stylist approves or rejects your appointment.`

        });


        return res.status(201).json({

            message:
                "Appointment booked successfully",

            appointmentId:
                newAppointment._id

        });


    } catch (error) {

        console.error(error);

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

        // remember when the stylist answered (used for response time)
        appointment.respondedAt =
            new Date();

        await appointment.save();


        // ------------------------------------------
        // NOTIFY CUSTOMER
        // ------------------------------------------

        await sendNotification({

            recipient:
                appointment.customer,

            title:
                "Appointment Approved",

            message:
                // Do not ask for payment again if it is already paid
                appointment.paymentStatus === "paid"
                    ? "Your appointment has been approved."
                    : "Your appointment has been approved. Please pay online from My Appointments, or pay at the salon.",

            type:
                "approval",

            emailSubject:
                "Your Appointment Has Been Approved - Beauté Salon",

            emailText:
                `Your appointment on ${appointment.date} from ${appointment.startTime} to ${appointment.endTime} has been approved. If you have not paid yet, you can pay online from My Appointments or at the salon. We look forward to seeing you at Beauté Salon.`

        });


        return res.status(200).json({

            message:
                "Appointment approved successfully"

        });


    } catch (error) {

        console.error(error);

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


        // ------------------------------------------
        // REFUND FIRST (only if it was already paid)
        // This happens when a paid appointment was rescheduled
        // and the stylist rejects the new time.
        // ------------------------------------------

        const refund =
            await refundIfPaid(appointment, "rejected");

        if (!refund.ok) {

            return res.status(500).json({
                message:
                    refund.message
            });

        }


        appointment.status =
            "rejected";

        // remember when the stylist answered (used for response time)
        appointment.respondedAt =
            new Date();

        await appointment.save();


        // ------------------------------------------
        // NOTIFY CUSTOMER
        // ------------------------------------------

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
                "Unfortunately, your salon appointment request has been rejected by the stylist. Please log in to choose another available appointment slot."

        });


        return res.status(200).json({

            message:
                "Appointment rejected successfully"

        });


    } catch (error) {

        console.error(error);

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

            .populate({
                path: "stylist",
                select: "specialization",
                populate: {
                    path: "user",
                    select: "name"
                }
            })

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

        console.error(error);

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

        console.error(error);

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


        // ------------------------------------------
        // REFUND FIRST (only if it was already paid)
        // ------------------------------------------

        const refund =
            await refundIfPaid(appointment);

        if (!refund.ok) {

            return res.status(500).json({
                message:
                    refund.message
            });

        }


        appointment.status =
            "cancelled";

        await appointment.save();


        // ------------------------------------------
        // FIND STYLIST
        // ------------------------------------------

        const stylist =
            await Stylist.findById(
                appointment.stylist
            );


        // ------------------------------------------
        // NOTIFY STYLIST
        // ------------------------------------------

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
                    `A customer has cancelled the appointment on ${appointment.date} at ${appointment.startTime} - ${appointment.endTime}.`

            });

        }


        // ------------------------------------------
        // NOTIFY CUSTOMER
        // ------------------------------------------

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
                `Your appointment on ${appointment.date} at ${appointment.startTime} - ${appointment.endTime} has been cancelled.`

        });


        return res.status(200).json({

            message:
                "Appointment cancelled successfully"

        });


    } catch (error) {

        console.error(error);

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


        // The end time is worked out on the server from the service duration
        const {
            date,
            startTime
        } = req.body;


        if (!date || !startTime) {

            return res.status(400).json({
                message:
                    "Date and start time are required"
            });

        }


        const inputError =
            checkDateAndTime(date, startTime);

        if (inputError) {

            return res.status(400).json({
                message:
                    inputError
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


        // End time = start time + how long the service takes
        const bookedService =
            await Service.findById(
                appointment.service
            );

        const endTime =
            toTime(
                toMinutes(startTime) +
                (bookedService ? bookedService.duration : 45)
            );


        // ------------------------------------------
        // CHECK SALON HOURS AND HOLIDAYS
        // ------------------------------------------

        const salonCheck =
            await isSalonOpen(date, startTime, endTime);

        if (!salonCheck.valid) {

            return res.status(400).json({
                message:
                    salonCheck.message
            });

        }


        // ------------------------------------------
        // CHECK WORKING SCHEDULE
        // ------------------------------------------

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


        // ------------------------------------------
        // CHECK OVERLAP
        // ------------------------------------------

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


        // ------------------------------------------
        // UPDATE APPOINTMENT
        // ------------------------------------------

        appointment.date =
            date;

        appointment.startTime =
            startTime;

        appointment.endTime =
            endTime;

        // The stylist approved the OLD time, not the new one.
        // So the appointment goes back to "pending" and must be approved again.
        // (A payment that was already made stays on the appointment.)
        appointment.status =
            "pending";

        // The waiting time starts again from now
        appointment.requestedAt =
            new Date();

        appointment.respondedAt =
            undefined;

        await appointment.save();


        // ------------------------------------------
        // NOTIFY STYLIST
        // ------------------------------------------

        await sendNotification({

            recipient:
                stylist.user,

            title:
                "Appointment Rescheduled",

            message:
                "A customer has rescheduled an appointment. Please approve or reject the new time.",

            type:
                "reschedule",

            emailSubject:
                "Appointment Rescheduled - Beauté Salon",

            emailText:
                `A customer has rescheduled an appointment to ${date} at ${startTime} - ${endTime}. Please log in to approve or reject the new time.`

        });


        // ------------------------------------------
        // NOTIFY CUSTOMER
        // ------------------------------------------

        await sendNotification({

            recipient:
                customer,

            title:
                "Appointment Rescheduled",

            message:
                "Your appointment has been rescheduled. It is waiting for the stylist to approve the new time.",

            type:
                "reschedule",

            emailSubject:
                "Your Appointment Has Been Rescheduled - Beauté Salon",

            emailText:
                `Your appointment has been rescheduled to ${date} at ${startTime} - ${endTime}. It is waiting for the stylist to approve the new time.`

        });


        return res.status(200).json({

            message:
                "Appointment rescheduled successfully"

        });


    } catch (error) {

        console.error(error);

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


        // ------------------------------------------
        // COMPLETE APPOINTMENT
        // ------------------------------------------

        appointment.status =
            "completed";

        await appointment.save();


        // ------------------------------------------
        // SAVE SERVICE HISTORY
        // ------------------------------------------

        await ServiceHistory.create({
            appointment: appointment._id,
            customer: appointment.customer,
            stylist: appointment.stylist,
            service: appointment.service,
            serviceDate: appointment.date
        });


        // ------------------------------------------
        // NOTIFY CUSTOMER
        // ------------------------------------------

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
                "Your appointment has been completed successfully. We would love to hear about your experience. Please log in to rate your service and stylist."

        });


        return res.status(200).json({

            message:
                "Appointment completed successfully"

        });


    } catch (error) {

        console.error(error);

        return res.status(500).json({

            message:
                "Appointment completion failed",

            error:
                error.message

        });

    }

};


// ======================================================
// MARK NO-SHOW (customer did not come)
// ======================================================

const markNoShow = async (req, res) => {

    try {

        const stylist = await Stylist.findOne({
            user: req.user.userId
        });

        if (!stylist) {
            return res.status(404).json({
                message: "Stylist profile not found"
            });
        }

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if (appointment.stylist.toString() !== stylist._id.toString()) {
            return res.status(403).json({
                message: "You are not assigned to this appointment"
            });
        }

        if (appointment.status !== "approved") {
            return res.status(400).json({
                message: "Only approved appointments can be marked as no-show"
            });
        }

        appointment.status = "no-show";

        await appointment.save();

        return res.status(200).json({
            message: "Appointment marked as no-show"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to mark no-show",
            error: error.message
        });

    }

};


// ======================================================
// ADMIN: APPROVE / CANCEL / RESCHEDULE ANY APPOINTMENT
// PUT /api/admin/appointments/:id
// body: { status } or { date, startTime, endTime }
// ======================================================

const updateAppointmentByAdmin = async (req, res) => {

    try {

        // For a reschedule the end time is worked out below, not taken from the browser
        const { status, date, startTime } = req.body;

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if (
            appointment.status !== "pending" &&
            appointment.status !== "approved"
        ) {
            return res.status(400).json({
                message: "This appointment can no longer be changed"
            });
        }

        let title = "";
        let type = "";

        if (status) {

            // ---------- APPROVE OR CANCEL ----------

            if (status !== "approved" && status !== "cancelled") {
                return res.status(400).json({
                    message: "Admin can only approve or cancel"
                });
            }

            // Admin cancels a paid appointment: refund first
            if (status === "cancelled") {

                const refund = await refundIfPaid(appointment);

                if (!refund.ok) {
                    return res.status(500).json({
                        message: refund.message
                    });
                }

            }

            appointment.status = status;

            // the admin answered a pending request
            if (status === "approved" && !appointment.respondedAt) {
                appointment.respondedAt = new Date();
            }

            if (status === "approved") {
                title = "Appointment Approved";
                type = "approval";
            } else {
                title = "Appointment Cancelled";
                type = "cancellation";
            }

        } else {

            // ---------- RESCHEDULE ----------

            if (!date || !startTime) {
                return res.status(400).json({
                    message: "Date and start time are required"
                });
            }

            const inputError = checkDateAndTime(date, startTime);

            if (inputError) {
                return res.status(400).json({
                    message: inputError
                });
            }

            // End time = start time + how long the service takes
            const bookedService = await Service.findById(appointment.service);

            const endTime = toTime(
                toMinutes(startTime) +
                (bookedService ? bookedService.duration : 45)
            );

            const stylist = await Stylist.findById(appointment.stylist);

            if (!stylist) {
                return res.status(404).json({
                    message: "Stylist not found"
                });
            }

            const salonCheck = await isSalonOpen(date, startTime, endTime);

            if (!salonCheck.valid) {
                return res.status(400).json({
                    message: salonCheck.message
                });
            }

            const scheduleCheck = isWithinWorkingSchedule(
                stylist,
                date,
                startTime,
                endTime
            );

            if (!scheduleCheck.valid) {
                return res.status(400).json({
                    message: scheduleCheck.message
                });
            }

            const overlapping = await Appointment.findOne({
                _id: { $ne: appointment._id },
                stylist: appointment.stylist,
                date,
                status: { $in: ["pending", "approved"] },
                startTime: { $lt: endTime },
                endTime: { $gt: startTime }
            });

            if (overlapping) {
                return res.status(400).json({
                    message: "Stylist is already booked for the new time"
                });
            }

            appointment.date = date;
            appointment.startTime = startTime;
            appointment.endTime = endTime;

            title = "Appointment Rescheduled";
            type = "reschedule";

        }

        await appointment.save();

        // Tell the customer and the stylist
        const stylistProfile = await Stylist.findById(appointment.stylist);

        const message =
            `${title} by the salon. Date: ${new Date(appointment.date).toDateString()}, time: ${appointment.startTime} - ${appointment.endTime}.`;

        await sendNotification({
            recipient: appointment.customer,
            title,
            message,
            type,
            emailSubject: `${title} - Beauté Salon`,
            emailText: message
        });

        if (stylistProfile) {
            await sendNotification({
                recipient: stylistProfile.user,
                title,
                message,
                type,
                emailSubject: `${title} - Beauté Salon`,
                emailText: message
            });
        }

        return res.status(200).json({
            message: "Appointment updated successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to update appointment",
            error: error.message
        });

    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getAvailableSlots,
    markNoShow,
    updateAppointmentByAdmin,
    createAppointment,
    approveAppointment,
    rejectAppointment,
    getMyAppointments,
    getStylistAppointments,
    cancelAppointment,
    rescheduleAppointment,
    completeAppointment

};