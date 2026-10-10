import { useEffect, useState } from "react";
import api, { showError } from "../../api";
import { Link } from "react-router-dom";
import { CalendarIcon, ClockIcon } from "lucide-react";

// A card in the welcome area that shows the customer's nearest upcoming appointment.

function CustomerNextAppointment() {

    // The nearest upcoming appointment (null = there is none)
    const [nextAppointment, setNextAppointment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getNextAppointment();
    }, []);


    // ================= FIND THE NEXT APPOINTMENT =================

    const getNextAppointment = async () => {

        try {

            const response = await api.get(
                "/appointment/my"
            );

            // Today's date as "YYYY-MM-DD", the same shape the API uses
            const now = new Date();

            const today =
                now.getFullYear() + "-" +
                String(now.getMonth() + 1).padStart(2, "0") + "-" +
                String(now.getDate()).padStart(2, "0");

            // Keep only appointments that are still going to happen
            const upcoming = response.data.appointments.filter(
                (appointment) =>
                    (appointment.status === "pending" ||
                        appointment.status === "approved") &&
                    appointment.date.slice(0, 10) >= today
            );

            // The API already sorts by date and time, so the first one is the nearest
            setNextAppointment(upcoming[0] || null);

        } catch (error) {

            showError(
                error.response?.data?.message ||
                "Failed to load next appointment"
            );

        } finally {

            setLoading(false);

        }

    };


    if (loading) {
        return null;
    }


    return (
        <div className="border border-[#c9aa91] bg-[#f7efe5] p-8">

            <p className="text-xs tracking-[3px] text-[#9a7b62]">
                YOUR NEXT APPOINTMENT
            </p>

            {nextAppointment ? (

                <div>

                    <p className="mt-4 text-3xl text-[#5a182b]">
                        {nextAppointment.service?.name || "Service"}
                    </p>

                    <p className="mt-2 text-[#6e5545]">
                        with {nextAppointment.stylist?.user?.name || "your stylist"}
                    </p>

                    <div className="mt-6 space-y-3 text-sm text-[#6e5545]">

                        <div className="flex justify-between gap-4 border-b border-[#d8c6b6] pb-3">
                            <span><CalendarIcon size={14} className="card-icon" />Date</span>
                            <span className="text-[#321d1d]">
                                {new Date(
                                    nextAppointment.date
                                ).toLocaleDateString("en-IN", {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                })}
                            </span>
                        </div>

                        <div className="flex justify-between gap-4 border-b border-[#d8c6b6] pb-3">
                            <span><ClockIcon size={14} className="card-icon" />Time</span>
                            <span className="text-[#321d1d]">
                                {nextAppointment.startTime} - {nextAppointment.endTime}
                            </span>
                        </div>

                        <div className="flex justify-between gap-4">
                            <span>Status</span>
                            <span className="uppercase tracking-[1px] text-[#5a182b]">
                                {nextAppointment.status === "approved"
                                    ? "Approved"
                                    : "Waiting for stylist"}
                            </span>
                        </div>

                    </div>

                    <Link
                        to="/customer/appointments"
                        className="inline-block mt-7 border border-[#5a182b] px-6 py-3 text-sm tracking-[2px] text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                    >
                        VIEW APPOINTMENTS
                    </Link>

                </div>

            ) : (

                <div>

                    <p className="mt-4 text-2xl text-[#5a182b]">
                        Nothing booked yet
                    </p>

                    <p className="mt-2 text-[#6e5545]">
                        Choose a stylist and a time that suits you.
                    </p>

                    <Link
                        to="/customer/appointments"
                        className="inline-block mt-7 bg-[#5a182b] px-6 py-3 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                    >
                        BOOK AN APPOINTMENT
                    </Link>

                </div>

            )}

        </div>
    );

}

export default CustomerNextAppointment;
