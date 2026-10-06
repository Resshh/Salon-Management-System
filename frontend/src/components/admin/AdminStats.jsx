import { useEffect, useState } from "react";
import axios from "axios";

function AdminStats() {

    const [stats, setStats] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        getStats();
    }, []);


    // ================= GET STATISTICS =================

    const getStats = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/dashboard/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setStats(response.data.statistics);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load statistics"
            );

        }

    };


    // Each card on the page: a label and a number
    let cards = [];

    if (stats) {

        cards = [
            { label: "CUSTOMERS", value: stats.totalCustomers },
            { label: "STYLISTS", value: stats.totalStylists },
            { label: "SERVICES", value: stats.totalServices },
            { label: "APPOINTMENTS", value: stats.totalAppointments },
            { label: "PENDING", value: stats.appointments.pending },
            { label: "APPROVED", value: stats.appointments.approved },
            { label: "COMPLETED", value: stats.appointments.completed },
            { label: "CANCELLED", value: stats.appointments.cancelled },
            { label: "REJECTED", value: stats.appointments.rejected },
            { label: "FEEDBACK", value: stats.totalFeedback },
            { label: "COMPLAINTS", value: stats.totalComplaints },
            { label: "OPEN COMPLAINTS", value: stats.pendingComplaints }
        ];

    }


    return (
        <section
            id="overview"
            className="px-6 md:px-20 py-16 md:py-20"
        >

            <p className="text-xs tracking-[4px] text-[#9a7b62]">
                BEAUTÉ — ADMIN PORTAL
            </p>

            <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                Overview
            </h2>

            {stats ? (

                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-5">

                    {cards.map((card) => (

                        <div
                            key={card.label}
                            className="border border-[#c9aa91] bg-[#efe2d5] p-6"
                        >

                            <p className="text-xs tracking-[2px] text-[#9a7b62]">
                                {card.label}
                            </p>

                            <p className="mt-3 text-4xl text-[#5a182b]">
                                {card.value}
                            </p>

                        </div>

                    ))}

                </div>

            ) : (

                <p className="mt-8 text-[#6e5545]">
                    Loading statistics...
                </p>

            )}

        </section>
    );

}

export default AdminStats;
