// Adds test data to the database so every screen has something to show.
// Run with:  npm run seed   (inside the backend folder)
//
// It only ADDS data. It never deletes anything, and running it twice is safe.

require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const db = require("./connection");

const User = require("./models/userModel");
const Stylist = require("./models/stylistModel");
const Service = require("./models/serviceModel");
const Appointment = require("./models/appointmentModel");
const ServiceHistory = require("./models/serviceHistoryModel");
const Feedback = require("./models/feedbackModel");
const Complaint = require("./models/complaintModel");
const Notification = require("./models/notificationModel");
const Coupon = require("./models/couponModel");
const SalonSetting = require("./models/salonSettingModel");

// Every seeded user logs in with this password
const PASSWORD = "Test@123";


// ======================================================
// TEST DATA
// ======================================================

const services = [
    { name: "Hair Cut", duration: 45, price: 500, description: "Professional haircut and styling" },
    { name: "Hair Colouring", duration: 120, price: 2500, description: "Full hair colour with premium products" },
    { name: "Hair Spa", duration: 60, price: 1200, description: "Deep conditioning treatment for soft hair" },
    { name: "Classic Facial", duration: 60, price: 1500, description: "Cleansing, scrub, massage and face pack" },
    { name: "Clean Up", duration: 30, price: 700, description: "Quick skin cleansing and refresh" },
    { name: "Manicure", duration: 45, price: 600, description: "Nail shaping, cuticle care and polish" },
    { name: "Pedicure", duration: 60, price: 800, description: "Foot soak, scrub, nail care and polish" },
    { name: "Party Makeup", duration: 90, price: 3000, description: "Full face makeup for parties and events" },
    { name: "Bridal Makeup", duration: 180, price: 12000, description: "Complete bridal look with hairstyling" },
    { name: "Head Massage", duration: 30, price: 400, description: "Relaxing oil head massage" }
];

const stylists = [
    {
        name: "Anjali Menon",
        email: "anjali.stylist@beaute.test",
        phone: "9000000001",
        gender: "Female",
        specialization: "Hair colouring and styling",
        services: ["Hair Cut", "Hair Colouring", "Hair Spa", "Head Massage"]
    },
    {
        name: "Rahul Nair",
        email: "rahul.stylist@beaute.test",
        phone: "9000000002",
        gender: "Male",
        specialization: "Skin care and facials",
        services: ["Classic Facial", "Clean Up", "Hair Cut", "Head Massage"]
    },
    {
        name: "Meera Joseph",
        email: "meera.stylist@beaute.test",
        phone: "9000000003",
        gender: "Female",
        specialization: "Makeup and nails",
        services: ["Party Makeup", "Bridal Makeup", "Manicure", "Pedicure"]
    }
];

const customers = [
    { name: "Priya Sharma", email: "priya.customer@beaute.test", phone: "9100000001", gender: "Female", membership: "gold", loyaltyPoints: 120 },
    { name: "Arjun Das", email: "arjun.customer@beaute.test", phone: "9100000002", gender: "Male", membership: "silver", loyaltyPoints: 40 },
    { name: "Sneha Pillai", email: "sneha.customer@beaute.test", phone: "9100000003", gender: "Female", membership: "none", loyaltyPoints: 0 }
];

// Stylists work Monday to Saturday, 10:00 to 18:00
const workingSchedule = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
].map((day) => ({
    day: day,
    startTime: "10:00",
    endTime: "18:00"
}));


// ======================================================
// SMALL HELPERS
// ======================================================

// Gives "YYYY-MM-DD" for today + offset days (offset can be negative).
// Sunday is skipped because the salon is closed.
const dateFromToday = (offset) => {

    const date = new Date();

    date.setDate(date.getDate() + offset);

    if (date.getDay() === 0) {
        // Past dates move one day back, future dates one day forward
        date.setDate(date.getDate() + (offset < 0 ? -1 : 1));
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

};

// "10:00" + 45 minutes -> "10:45"
const addMinutes = (time, minutes) => {

    const [hours, mins] = time.split(":").map(Number);

    const total = hours * 60 + mins + minutes;

    const endHours = String(Math.floor(total / 60)).padStart(2, "0");
    const endMins = String(total % 60).padStart(2, "0");

    return `${endHours}:${endMins}`;

};


// ======================================================
// SEED
// ======================================================

const seed = async () => {

    try {

        await db();

        const hashedPassword = await bcrypt.hash(PASSWORD, 10);


        // ---------- SERVICES ----------

        const serviceDocs = {};

        for (const item of services) {

            let service = await Service.findOne({ name: item.name });

            if (!service) {

                service = await Service.create({
                    name: item.name,
                    description: item.description,
                    duration: item.duration,
                    price: item.price
                });

            }

            serviceDocs[item.name] = service;

        }


        // ---------- STYLISTS (User + Stylist profile) ----------

        const stylistDocs = [];

        for (const item of stylists) {

            let user = await User.findOne({ email: item.email });

            if (!user) {

                user = await User.create({
                    name: item.name,
                    email: item.email,
                    password: hashedPassword,
                    phone: item.phone,
                    gender: item.gender,
                    dateOfBirth: "1995-05-15",
                    role: "stylist"
                });

            }

            let profile = await Stylist.findOne({ user: user._id });

            if (!profile) {

                profile = await Stylist.create({
                    user: user._id,
                    specialization: item.specialization,
                    services: item.services.map(
                        (name) => serviceDocs[name]._id
                    ),
                    workingSchedule: workingSchedule
                });

            }

            stylistDocs.push(profile);

        }


        // ---------- CUSTOMERS ----------

        const customerDocs = [];

        // If the first customer already exists, the seed ran before
        const alreadySeeded = await User.findOne({
            email: customers[0].email
        });

        for (const item of customers) {

            let user = await User.findOne({ email: item.email });

            if (!user) {

                user = await User.create({
                    name: item.name,
                    email: item.email,
                    password: hashedPassword,
                    phone: item.phone,
                    gender: item.gender,
                    dateOfBirth: "1998-08-20",
                    role: "customer",
                    membership: item.membership,
                    loyaltyPoints: item.loyaltyPoints
                });

            }

            customerDocs.push(user);

        }


        // ---------- SALON SETTINGS ----------

        const existingSettings = await SalonSetting.findOne();

        if (!existingSettings) {

            await SalonSetting.create({
                openTime: "09:00",
                closeTime: "20:00",
                closedDays: ["Sunday"],
                holidays: [
                    {
                        date: dateFromToday(20),
                        reason: "Staff training day"
                    }
                ]
            });

        }


        // ---------- COUPONS ----------

        const coupons = [
            { code: "WELCOME10", discountPercent: 10, expiryDate: dateFromToday(90), active: true },
            { code: "FESTIVE20", discountPercent: 20, expiryDate: dateFromToday(30), active: true },
            // These two must be REJECTED when paying
            { code: "EXPIRED50", discountPercent: 50, expiryDate: dateFromToday(-10), active: true },
            { code: "OFF15", discountPercent: 15, expiryDate: dateFromToday(60), active: false }
        ];

        for (const item of coupons) {

            const coupon = await Coupon.findOne({ code: item.code });

            if (!coupon) {
                await Coupon.create(item);
            }

        }


        // ---------- APPOINTMENTS, HISTORY, FEEDBACK, COMPLAINTS ----------
        // Only added the first time, so running the seed again does not duplicate them

        if (alreadySeeded) {

            console.log("Appointments were seeded before, skipping them.");

        } else {

            const [priya, arjun, sneha] = customerDocs;
            const [anjali, rahul, meera] = stylistDocs;

            // One row = one appointment
            const appointments = [
                // ----- PAST -----
                { customer: priya, stylist: anjali, service: "Hair Cut", day: -14, time: "10:00", status: "completed", paid: true, notes: "Prefers layered cut, medium length.", rating: 5, review: "Loved the haircut. Anjali is wonderful." },
                { customer: priya, stylist: rahul, service: "Classic Facial", day: -7, time: "11:00", status: "completed", paid: true, notes: "Sensitive skin, avoid strong scrubs.", rating: 4, review: "Very relaxing facial." },
                // Completed, no feedback yet: use it to test giving feedback and paying
                { customer: priya, stylist: meera, service: "Manicure", day: -2, time: "15:00", status: "completed", paid: false },
                { customer: arjun, stylist: rahul, service: "Hair Cut", day: -10, time: "12:00", status: "completed", paid: true, rating: 3, review: "Good, but I had to wait a little." },
                { customer: arjun, stylist: anjali, service: "Head Massage", day: -3, time: "16:00", status: "completed", paid: false },
                { customer: sneha, stylist: meera, service: "Party Makeup", day: -5, time: "14:00", status: "no-show", paid: false },
                { customer: sneha, stylist: anjali, service: "Hair Spa", day: -4, time: "13:00", status: "cancelled", paid: false },
                { customer: arjun, stylist: meera, service: "Pedicure", day: -6, time: "10:00", status: "rejected", paid: false },

                // ----- TODAY AND UPCOMING -----
                // Approved + unpaid: use these to test payment, complete and no-show
                { customer: priya, stylist: anjali, service: "Hair Colouring", day: 0, time: "14:00", status: "approved", paid: false },
                { customer: arjun, stylist: rahul, service: "Clean Up", day: 1, time: "11:00", status: "approved", paid: false },
                { customer: sneha, stylist: meera, service: "Manicure", day: 2, time: "12:00", status: "approved", paid: true },
                // Pending: use these to test approve / reject / cancel / reschedule
                { customer: priya, stylist: meera, service: "Party Makeup", day: 3, time: "10:00", status: "pending", paid: false },
                { customer: arjun, stylist: anjali, service: "Hair Cut", day: 1, time: "15:00", status: "pending", paid: false },
                { customer: sneha, stylist: rahul, service: "Classic Facial", day: 4, time: "16:00", status: "pending", paid: false },
                { customer: sneha, stylist: anjali, service: "Hair Spa", day: 9, time: "11:00", status: "pending", paid: false }
            ];

            for (const item of appointments) {

                const service = serviceDocs[item.service];
                const date = dateFromToday(item.day);

                const appointment = await Appointment.create({
                    customer: item.customer._id,
                    stylist: item.stylist._id,
                    service: service._id,
                    date: date,
                    startTime: item.time,
                    endTime: addMinutes(item.time, service.duration),
                    status: item.status,
                    paymentStatus: item.paid ? "paid" : "unpaid",
                    paymentMethod: item.paid ? "cash" : undefined,
                    amount: item.paid ? service.price : undefined
                });

                // Completed appointments also get a service history record
                if (item.status === "completed") {

                    await ServiceHistory.create({
                        appointment: appointment._id,
                        customer: item.customer._id,
                        stylist: item.stylist._id,
                        service: service._id,
                        serviceDate: date,
                        notes: item.notes
                    });

                }

                if (item.rating) {

                    await Feedback.create({
                        customer: item.customer._id,
                        appointment: appointment._id,
                        rating: item.rating,
                        review: item.review
                    });

                }

            }


            // ---------- COMPLAINTS ----------

            await Complaint.create([
                {
                    customer: arjun._id,
                    subject: "Long waiting time",
                    description: "I had to wait 20 minutes after my appointment time.",
                    status: "pending"
                },
                {
                    customer: priya._id,
                    subject: "Wrong amount charged",
                    description: "I was charged for a hair spa that I did not take.",
                    status: "in-progress",
                    adminResponse: "We are checking the bill with the stylist."
                },
                {
                    customer: sneha._id,
                    subject: "Product allergy",
                    description: "The face pack caused some redness.",
                    status: "resolved",
                    adminResponse: "We are sorry. We have noted your allergy and refunded the service."
                }
            ]);


            // ---------- NOTIFICATIONS ----------

            await Notification.create([
                { recipient: priya._id, title: "Appointment Approved", message: "Your Hair Colouring appointment has been approved.", type: "approval" },
                { recipient: priya._id, title: "Festive Offer", message: "Use code FESTIVE20 for 20% off this month.", type: "promotion" },
                { recipient: arjun._id, title: "Appointment Approved", message: "Your Clean Up appointment has been approved.", type: "approval" },
                { recipient: sneha._id, title: "Appointment Cancelled", message: "Your Hair Spa appointment was cancelled.", type: "cancellation", isRead: true },
                { recipient: anjali.user, title: "New Appointment Request", message: "Arjun Das requested a Hair Cut.", type: "booking" },
                { recipient: rahul.user, title: "New Appointment Request", message: "Sneha Pillai requested a Classic Facial.", type: "booking" },
                { recipient: meera.user, title: "New Appointment Request", message: "Priya Sharma requested Party Makeup.", type: "booking" }
            ]);

        }


        // ---------- SUMMARY ----------

        console.log("");
        console.log("Seed finished. Everything in the database now:");
        console.log("  Services     :", await Service.countDocuments());
        console.log("  Stylists     :", await Stylist.countDocuments());
        console.log("  Customers    :", await User.countDocuments({ role: "customer" }));
        console.log("  Appointments :", await Appointment.countDocuments());
        console.log("  History      :", await ServiceHistory.countDocuments());
        console.log("  Feedback     :", await Feedback.countDocuments());
        console.log("  Complaints   :", await Complaint.countDocuments());
        console.log("  Coupons      :", await Coupon.countDocuments());
        console.log("");
        console.log("Test logins (password for all: " + PASSWORD + ")");

        for (const item of stylists) {
            console.log("  stylist  :", item.email);
        }

        for (const item of customers) {
            console.log("  customer :", item.email, "(" + item.membership + ")");
        }

        await mongoose.disconnect();

        process.exit();

    } catch (error) {

        console.error("Seed failed:", error);
        process.exit(1);

    }

};

seed();
