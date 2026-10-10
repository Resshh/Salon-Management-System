import { useEffect, useState } from "react";
import api, { showError } from "../../api";
import SkeletonCards from "../Skeleton";

// Admin overview: numbers that show how the business is doing.
// The server works everything out (backend/controllers/dashboardController.js);
// this component only shows it.

function AdminStats() {

    const [stats, setStats] = useState(null);

    // Which period to look at: "7", "30", "90" or "all"
    const [days, setDays] = useState("30");

    // Load again whenever the period changes
    useEffect(() => {
        getStats();
    }, [days]);


    // ================= GET STATISTICS =================

    const getStats = async () => {

        try {

            const response = await api.get(
                "/dashboard/",
                {
                    params: {
                        days: days
                    }
                }
            );

            setStats(response.data.statistics);

        } catch (error) {

            showError(
                error.response?.data?.message ||
                "Failed to load statistics"
            );

        }

    };


    // ================= SMALL HELPERS =================

    // 135 -> "2 h 15 min",  3000 -> "2 d 2 h",  null -> "No data yet"
    const formatMinutes = (minutes) => {

        if (minutes === null || minutes === undefined) {
            return "No data yet";
        }

        if (minutes < 60) {
            return `${minutes} min`;
        }

        if (minutes < 1440) {
            return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
        }

        const daysPart = Math.floor(minutes / 1440);
        const hoursPart = Math.floor((minutes % 1440) / 60);

        return `${daysPart} d ${hoursPart} h`;

    };

    // Colour for a waiting time: the longer the wait, the more urgent
    const waitingClass = (minutes) => {

        if (minutes >= 720) {
            return "text-red-700";
        }

        if (minutes >= 120) {
            return "text-amber-700";
        }

        return "text-[#321d1d]";

    };


    if (!stats) {

        return (
            <section
                id="overview"
                className="px-6 md:px-20 py-16 md:py-20"
            >
                <SkeletonCards />
            </section>
        );

    }


    // The headline cards: a label, a big value and a short explanation
    const cards = [
        {
            label: "REVENUE COLLECTED",
            value: `₹${stats.money.collected}`,
            note: `Average bill ₹${stats.money.averageBill}`
        },
        {
            label: "WAITING TO BE PAID",
            value: `₹${stats.money.outstanding}`,
            note: "Approved or completed, not paid yet"
        },
        {
            label: "AVERAGE RESPONSE TIME",
            value: formatMinutes(stats.response.averageMinutes),
            note: "From request to approve or reject"
        },
        {
            label: "REQUESTS WAITING NOW",
            value: stats.response.waitingNow,
            note: "Nobody has answered these yet"
        },
        {
            label: "COMPLETION RATE",
            value: `${stats.bookings.completionRate}%`,
            note: `${stats.bookings.counts.completed} completed · ${stats.bookings.total} requests in total`
        },
        {
            label: "CANCELLED BY CUSTOMERS",
            value: `${stats.bookings.cancellationRate}%`,
            note: `${stats.bookings.counts.cancelled} cancelled · ₹${stats.money.refunded} refunded`
        },
        {
            label: "REJECTED BY STYLISTS",
            value: `${stats.bookings.rejectionRate}%`,
            note: `${stats.bookings.counts.rejected} requests turned away`
        },
        {
            label: "NO-SHOWS",
            value: `${stats.bookings.noShowRate}%`,
            note: `${stats.bookings.counts["no-show"]} customers did not come`
        },
        {
            label: "NEW CUSTOMERS",
            value: stats.customers.newCustomers,
            note: "Registered in this period"
        },
        {
            label: "CUSTOMERS WHO CAME BACK",
            value: `${stats.customers.repeatRate}%`,
            note: `${stats.customers.repeatCustomers} of ${stats.customers.served} served customers`
        },
        {
            label: "AVERAGE RATING",
            value: stats.quality.averageRating === null
                ? "No data yet"
                : `${stats.quality.averageRating} / 5`,
            note: `${stats.quality.reviews} reviews`
        },
        {
            label: "OPEN COMPLAINTS",
            value: stats.quality.openComplaints,
            note: "Not resolved yet"
        }
    ];


    return (
        <section
            id="overview"
            className="px-6 md:px-20 py-16 md:py-20"
        >

            {/* ================= HEADING AND PERIOD ================= */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <h2 className="text-4xl font-normal text-[#5a182b]">
                    Business Overview
                </h2>

                <select
                    value={days}
                    onChange={(e) =>
                        setDays(e.target.value)
                    }
                    aria-label="Period"
                    className="border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="all">All time</option>
                </select>

            </div>


            {/* ================= HEADLINE NUMBERS ================= */}

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                {cards.map((card) => (

                    <div
                        key={card.label}
                        className="border border-[#c9aa91] bg-[#efe2d5] p-6"
                    >

                        <p className="text-xs tracking-[2px] text-[#9a7b62]">
                            {card.label}
                        </p>

                        <p className="mt-3 text-3xl text-[#5a182b]">
                            {card.value}
                        </p>

                        <p className="mt-2 text-sm text-[#6e5545]">
                            {card.note}
                        </p>

                    </div>

                ))}

            </div>


            {/* ================= REQUESTS LEFT WAITING ================= */}

            <h3 className="mt-14 text-2xl text-[#5a182b]">
                Requests waiting for an answer
            </h3>

            <p className="mt-2 text-[#6e5545]">
                Customers who asked for an appointment and have not been approved or rejected. Longest wait first.
            </p>

            {stats.response.waitingRequests.length > 0 ? (

                <div className="mt-5 overflow-x-auto border border-[#c9aa91] bg-[#efe2d5]">

                    <table className="w-full text-left text-sm">

                        <thead>
                            <tr className="border-b border-[#c9aa91] text-xs tracking-[2px] text-[#9a7b62]">
                                <th className="p-4 font-normal">WAITING FOR</th>
                                <th className="p-4 font-normal">WAITING ON</th>
                                <th className="p-4 font-normal">CUSTOMER</th>
                                <th className="p-4 font-normal">SERVICE</th>
                                <th className="p-4 font-normal">APPOINTMENT</th>
                            </tr>
                        </thead>

                        <tbody>

                            {stats.response.waitingRequests.map((request) => (

                                <tr
                                    key={request.appointmentId}
                                    className="border-b border-[#d8c6b6] text-[#6e5545]"
                                >
                                    <td className={`p-4 ${waitingClass(request.waitingMinutes)}`}>
                                        {formatMinutes(request.waitingMinutes)}
                                    </td>
                                    <td className="p-4 text-[#321d1d]">
                                        {request.stylist}
                                    </td>
                                    <td className="p-4">
                                        {request.customer}
                                    </td>
                                    <td className="p-4">
                                        {request.service}
                                    </td>
                                    <td className="p-4">
                                        {new Date(
                                            request.date
                                        ).toLocaleDateString()}
                                        {" · "}
                                        {request.startTime}
                                    </td>
                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            ) : (

                <p className="mt-5 text-[#6e5545]">
                    No request is waiting. Every customer has an answer.
                </p>

            )}


            {/* ================= STYLIST PERFORMANCE ================= */}

            <h3 className="mt-14 text-2xl text-[#5a182b]">
                Stylist performance
            </h3>

            <p className="mt-2 text-[#6e5545]">
                Idle time is the time a stylist was clocked in but not on a service. Utilisation is the share of clocked-in time spent on customers.
            </p>

            {stats.stylists.length > 0 ? (

                <div className="mt-5 overflow-x-auto border border-[#c9aa91] bg-[#efe2d5]">

                    <table className="w-full text-left text-sm">

                        <thead>
                            <tr className="border-b border-[#c9aa91] text-xs tracking-[2px] text-[#9a7b62]">
                                <th className="p-4 font-normal">STYLIST</th>
                                <th className="p-4 font-normal">CLOCKED IN</th>
                                <th className="p-4 font-normal">ON SERVICES</th>
                                <th className="p-4 font-normal">IDLE</th>
                                <th className="p-4 font-normal">UTILISATION</th>
                                <th className="p-4 font-normal">RESPONSE TIME</th>
                                <th className="p-4 font-normal">COMPLETED</th>
                                <th className="p-4 font-normal">REVENUE</th>
                                <th className="p-4 font-normal">RATING</th>
                                <th className="p-4 font-normal">WAITING NOW</th>
                            </tr>
                        </thead>

                        <tbody>

                            {stats.stylists.map((stylist) => (

                                <tr
                                    key={stylist.stylistId}
                                    className="border-b border-[#d8c6b6] text-[#6e5545]"
                                >
                                    <td className="p-4 text-[#321d1d]">
                                        {stylist.name}
                                    </td>
                                    <td className="p-4">
                                        {stylist.clockedMinutes > 0
                                            ? formatMinutes(stylist.clockedMinutes)
                                            : "Not clocked in"}
                                    </td>
                                    <td className="p-4">
                                        {formatMinutes(stylist.serviceMinutes)}
                                    </td>
                                    <td className="p-4">
                                        {stylist.clockedMinutes > 0
                                            ? formatMinutes(stylist.idleMinutes)
                                            : "—"}
                                    </td>
                                    <td className="p-4">
                                        {stylist.clockedMinutes > 0
                                            ? `${stylist.utilisation}%`
                                            : "—"}
                                    </td>
                                    <td className="p-4">
                                        {formatMinutes(stylist.averageResponseMinutes)}
                                    </td>
                                    <td className="p-4">
                                        {stylist.completed}
                                        {stylist.noShows > 0
                                            ? ` (+${stylist.noShows} no-show)`
                                            : ""}
                                    </td>
                                    <td className="p-4 text-[#321d1d]">
                                        ₹{stylist.revenue}
                                    </td>
                                    <td className="p-4">
                                        {stylist.averageRating === null
                                            ? "—"
                                            : `${stylist.averageRating} / 5 (${stylist.reviews})`}
                                    </td>
                                    <td className={`p-4 ${stylist.pendingNow > 0 ? "text-amber-700" : ""}`}>
                                        {stylist.pendingNow}
                                    </td>
                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            ) : (

                <p className="mt-5 text-[#6e5545]">
                    No stylists yet.
                </p>

            )}


            {/* ================= TOP SERVICES ================= */}

            <h3 className="mt-14 text-2xl text-[#5a182b]">
                Top services
            </h3>

            {stats.topServices.length > 0 ? (

                <div className="mt-5 overflow-x-auto border border-[#c9aa91] bg-[#efe2d5]">

                    <table className="w-full text-left text-sm">

                        <thead>
                            <tr className="border-b border-[#c9aa91] text-xs tracking-[2px] text-[#9a7b62]">
                                <th className="p-4 font-normal">SERVICE</th>
                                <th className="p-4 font-normal">REQUESTS</th>
                                <th className="p-4 font-normal">REVENUE</th>
                            </tr>
                        </thead>

                        <tbody>

                            {stats.topServices.map((service) => (

                                <tr
                                    key={service.name}
                                    className="border-b border-[#d8c6b6] text-[#6e5545]"
                                >
                                    <td className="p-4 text-[#321d1d]">
                                        {service.name}
                                    </td>
                                    <td className="p-4">
                                        {service.bookings}
                                    </td>
                                    <td className="p-4">
                                        ₹{service.revenue}
                                    </td>
                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            ) : (

                <p className="mt-5 text-[#6e5545]">
                    No bookings in this period.
                </p>

            )}

        </section>
    );

}

export default AdminStats;
