const User = require("../models/userModel");
const Stylist = require("../models/stylistModel");
const Appointment = require("../models/appointmentModel");
const Feedback = require("../models/feedbackModel");
const Complaint = require("../models/complaintModel");
const Attendance = require("../models/attendanceModel");

const { toMinutes } = require("../utils/salonHours");
const { closeForgottenRecords } = require("./attendanceController");

// ======================================================
// ADMIN DASHBOARD: BUSINESS NUMBERS (KPIs)
// GET /api/dashboard?days=7      (7, 30, 90 or "all")
//
// Everything is worked out with plain loops so each number is easy to follow.
// "In the period" means: requests that were MADE in the last N days.
// ======================================================

// Two Date values -> minutes between them
const minutesBetweenDates = (from, to) => {
    return Math.round((new Date(to) - new Date(from)) / 60000);
};

// 7 out of 20 -> 35 (percent). Avoids dividing by zero.
const percent = (part, total) => {

    if (total === 0) {
        return 0;
    }

    return Math.round((part / total) * 100);

};

const average = (numbers) => {

    if (numbers.length === 0) {
        return null;
    }

    let total = 0;

    for (const number of numbers) {
        total = total + number;
    }

    return Math.round(total / numbers.length);

};


const getDashboardStats = async (req, res) => {
    try {

        // ---------- THE PERIOD ----------

        // Only these values are accepted; anything else means 30 days
        const allowedDays = ["7", "30", "90", "all"];

        const days = allowedDays.includes(req.query.days)
            ? req.query.days
            : "30";

        // "since" = the first moment of the period (very old date for "all")
        let since = new Date(0);

        if (days !== "all") {
            since = new Date();
            since.setDate(since.getDate() - Number(days));
        }

        const now = new Date();


        // A stylist who forgot to clock out must not count as working for days
        await closeForgottenRecords();


        // ---------- LOAD THE DATA ----------

        const appointments = await Appointment.find({
            createdAt: { $gte: since }
        })
            .populate("customer", "name")
            .populate("service", "name price");

        // Work actually DONE in the period: completed appointments whose
        // appointment date is in the period. (The list above is by the date the
        // request was made, which can be earlier.) Hours on services are taken
        // from this list so they cover the same days as the clocked-in hours.
        const completedWork = await Appointment.find({
            status: "completed",
            date: { $gte: since }
        });

        const stylists = await Stylist.find()
            .populate("user", "name");

        const attendance = await Attendance.find({
            clockIn: { $gte: since }
        });

        const feedback = await Feedback.find({
            createdAt: { $gte: since }
        }).populate("appointment", "stylist");

        const newCustomers = await User.countDocuments({
            role: "customer",
            createdAt: { $gte: since }
        });

        const openComplaints = await Complaint.countDocuments({
            status: { $ne: "resolved" }
        });


        // ---------- ONE ROW PER STYLIST ----------

        // rows["<stylist id>"] = the numbers of that stylist
        const rows = {};

        for (const stylist of stylists) {

            // Skip profiles whose user account was deleted
            if (!stylist.user) {
                continue;
            }

            rows[stylist._id.toString()] = {
                stylistId: stylist._id,
                name: stylist.user.name,
                clockedMinutes: 0,
                serviceMinutes: 0,
                completed: 0,
                noShows: 0,
                rejected: 0,
                pendingNow: 0,
                revenue: 0,
                responseTimes: [],
                ratings: []
            };

        }


        // ---------- GO THROUGH EVERY APPOINTMENT ----------

        const counts = {
            pending: 0,
            approved: 0,
            completed: 0,
            cancelled: 0,
            rejected: 0,
            "no-show": 0
        };

        let revenueCollected = 0;
        let revenueOutstanding = 0;
        let revenueRefunded = 0;
        let paidCount = 0;

        const allResponseTimes = [];

        // Requests that nobody has answered yet
        const waitingRequests = [];

        // services["Hair Cut"] = { name, bookings, revenue }
        const services = {};

        // completedByCustomer["<customer id>"] = number of completed visits
        const completedByCustomer = {};

        for (const appointment of appointments) {

            counts[appointment.status] = counts[appointment.status] + 1;

            const row = rows[appointment.stylist.toString()];

            const price = appointment.service
                ? appointment.service.price
                : 0;

            // The moment the customer asked (a reschedule counts as a new ask)
            const askedAt =
                appointment.requestedAt || appointment.createdAt;


            // ----- money -----

            if (appointment.paymentStatus === "paid") {

                revenueCollected = revenueCollected + appointment.amount;
                paidCount = paidCount + 1;

                if (row) {
                    row.revenue = row.revenue + appointment.amount;
                }

            }

            if (appointment.paymentStatus === "refunded") {
                revenueRefunded = revenueRefunded + (appointment.amount || 0);
            }

            // approved or completed, but the customer has not paid yet
            if (
                appointment.paymentStatus === "unpaid" &&
                (appointment.status === "approved" ||
                    appointment.status === "completed")
            ) {
                revenueOutstanding = revenueOutstanding + price;
            }


            // ----- how fast the stylist answered -----

            if (appointment.respondedAt) {

                const minutes = minutesBetweenDates(
                    askedAt,
                    appointment.respondedAt
                );

                allResponseTimes.push(minutes);

                if (row) {
                    row.responseTimes.push(minutes);
                }

            }


            // ----- still waiting for an answer -----

            if (appointment.status === "pending") {

                waitingRequests.push({
                    appointmentId: appointment._id,
                    customer: appointment.customer
                        ? appointment.customer.name
                        : "Deleted customer",
                    service: appointment.service
                        ? appointment.service.name
                        : "Deleted service",
                    stylist: row ? row.name : "Deleted stylist",
                    date: appointment.date,
                    startTime: appointment.startTime,
                    waitingMinutes: minutesBetweenDates(askedAt, now)
                });

                if (row) {
                    row.pendingNow = row.pendingNow + 1;
                }

            }


            // ----- work done -----

            if (appointment.status === "completed") {

                if (row) {
                    row.completed = row.completed + 1;
                }

                const customerId = appointment.customer
                    ? appointment.customer._id.toString()
                    : "deleted";

                completedByCustomer[customerId] =
                    (completedByCustomer[customerId] || 0) + 1;

            }

            if (appointment.status === "no-show" && row) {
                row.noShows = row.noShows + 1;
            }

            if (appointment.status === "rejected" && row) {
                row.rejected = row.rejected + 1;
            }


            // ----- which services sell -----

            if (appointment.service) {

                const name = appointment.service.name;

                if (!services[name]) {
                    services[name] = {
                        name: name,
                        bookings: 0,
                        revenue: 0
                    };
                }

                services[name].bookings = services[name].bookings + 1;

                if (appointment.paymentStatus === "paid") {
                    services[name].revenue =
                        services[name].revenue + appointment.amount;
                }

            }

        }


        // ---------- HOURS ON SERVICES ----------

        for (const appointment of completedWork) {

            const row = rows[appointment.stylist.toString()];

            if (row) {

                row.serviceMinutes =
                    row.serviceMinutes +
                    toMinutes(appointment.endTime) -
                    toMinutes(appointment.startTime);

            }

        }


        // ---------- HOURS CLOCKED IN ----------

        for (const record of attendance) {

            const row = rows[record.stylist.toString()];

            if (!row) {
                continue;
            }

            // Still working: count up to this moment
            const end = record.clockOut || now;

            row.clockedMinutes =
                row.clockedMinutes +
                minutesBetweenDates(record.clockIn, end);

        }


        // ---------- RATINGS ----------

        const allRatings = [];

        for (const item of feedback) {

            allRatings.push(item.rating);

            if (item.appointment) {

                const row = rows[item.appointment.stylist.toString()];

                if (row) {
                    row.ratings.push(item.rating);
                }

            }

        }


        // ---------- FINISH EACH STYLIST ROW ----------

        const stylistRows = [];

        for (const id in rows) {

            const row = rows[id];

            // Idle = clocked in but not on a service. Never below zero.
            const idleMinutes = Math.max(
                row.clockedMinutes - row.serviceMinutes,
                0
            );

            const ratingTotal = row.ratings.reduce(
                (sum, rating) => sum + rating,
                0
            );

            stylistRows.push({
                stylistId: row.stylistId,
                name: row.name,
                clockedMinutes: row.clockedMinutes,
                serviceMinutes: row.serviceMinutes,
                idleMinutes: idleMinutes,

                // share of clocked-in time spent on customers (never above 100%:
                // a stylist may have served someone without being clocked in)
                utilisation: Math.min(
                    percent(row.serviceMinutes, row.clockedMinutes),
                    100
                ),

                completed: row.completed,
                noShows: row.noShows,
                rejected: row.rejected,
                pendingNow: row.pendingNow,
                revenue: row.revenue,
                averageResponseMinutes: average(row.responseTimes),

                averageRating: row.ratings.length > 0
                    ? Number((ratingTotal / row.ratings.length).toFixed(1))
                    : null,

                reviews: row.ratings.length
            });

        }

        // Highest revenue first
        stylistRows.sort((a, b) => b.revenue - a.revenue);

        // Longest wait first
        waitingRequests.sort(
            (a, b) => b.waitingMinutes - a.waitingMinutes
        );

        const topServices = Object.values(services)
            .sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings)
            .slice(0, 5);


        // ---------- CUSTOMERS WHO CAME BACK ----------

        const customerIds = Object.keys(completedByCustomer);

        const repeatCustomers = customerIds.filter(
            (id) => completedByCustomer[id] >= 2
        ).length;


        // ---------- RATES ----------

        const totalRequests = appointments.length;

        // Requests that reached an end (so pending and approved do not distort the rates)
        const finished =
            counts.completed +
            counts.cancelled +
            counts.rejected +
            counts["no-show"];

        const ratingSum = allRatings.reduce(
            (sum, rating) => sum + rating,
            0
        );


        res.status(200).json({
            message: "Dashboard statistics fetched successfully",

            statistics: {
                days: days,

                money: {
                    collected: revenueCollected,
                    outstanding: revenueOutstanding,
                    refunded: revenueRefunded,
                    averageBill: paidCount > 0
                        ? Math.round(revenueCollected / paidCount)
                        : 0
                },

                bookings: {
                    total: totalRequests,
                    counts: counts,
                    completionRate: percent(counts.completed, finished),
                    cancellationRate: percent(counts.cancelled, finished),
                    rejectionRate: percent(counts.rejected, finished),
                    noShowRate: percent(counts["no-show"], finished)
                },

                response: {
                    averageMinutes: average(allResponseTimes),
                    waitingNow: waitingRequests.length,
                    waitingRequests: waitingRequests
                },

                customers: {
                    newCustomers: newCustomers,
                    served: customerIds.length,
                    repeatCustomers: repeatCustomers,
                    repeatRate: percent(repeatCustomers, customerIds.length)
                },

                quality: {
                    averageRating: allRatings.length > 0
                        ? Number((ratingSum / allRatings.length).toFixed(1))
                        : null,
                    reviews: allRatings.length,
                    openComplaints: openComplaints
                },

                stylists: stylistRows,

                topServices: topServices
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch dashboard statistics"
        });
    }
};

module.exports = {
    getDashboardStats
};
