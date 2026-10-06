import { useEffect, useState } from "react";
import axios from "axios";

function AdminAppointments() {

    const [appointments, setAppointments] = useState([]);

    // "all" or one status
    const [statusFilter, setStatusFilter] = useState("all");

    const token = localStorage.getItem("token");

    useEffect(() => {
        getAppointments();
    }, []);


    // ================= GET APPOINTMENTS =================

    const getAppointments = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/admin/appointments",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setAppointments(response.data.appointments || []);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load appointments"
            );

        }

    };


    // ================= UPDATE APPOINTMENT =================

    // data can be { status } or { date, startTime, endTime }
    const updateAppointment = async (id, data) => {

        try {

            await axios.put(
                `http://localhost:5000/api/admin/appointments/${id}`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            getAppointments();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to update appointment"
            );

        }

    };


    // ================= CANCEL =================

    const cancelAppointment = (id) => {

        const confirmCancel = window.confirm(
            "Cancel this appointment? The customer and stylist will be notified."
        );

        if (!confirmCancel) {
            return;
        }

        updateAppointment(id, {
            status: "cancelled"
        });

    };


    // ================= RESCHEDULE =================

    const rescheduleAppointment = (appointment) => {

        const date = window.prompt(
            "Enter new date (YYYY-MM-DD):"
        );

        if (!date) {
            return;
        }

        const startTime = window.prompt(
            "Enter new start time (HH:MM):"
        );

        if (!startTime) {
            return;
        }

        // End time = start time + service duration
        const [hours, minutes] = startTime.split(":").map(Number);

        const duration = appointment.service?.duration || 45;

        const totalMinutes = hours * 60 + minutes + duration;

        const endHours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
        const endMinutes = String(totalMinutes % 60).padStart(2, "0");

        updateAppointment(appointment._id, {
            date: date,
            startTime: startTime,
            endTime: `${endHours}:${endMinutes}`
        });

    };


    // Appointments to show after applying the filter
    let visibleAppointments = appointments;

    if (statusFilter !== "all") {

        visibleAppointments = appointments.filter(
            (appointment) => appointment.status === statusFilter
        );

    }


    return (
        <section
            id="appointments"
            className="px-6 md:px-20 py-16 md:py-20"
        >

            <p className="text-xs tracking-[4px] text-[#9a7b62]">
                ALL BOOKINGS
            </p>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                    Appointments
                </h2>

                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value)
                    }
                    className="border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                >
                    <option value="all">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                    <option value="no-show">No-show</option>
                </select>

            </div>

            {visibleAppointments.length > 0 ? (

                <div className="mt-8 overflow-x-auto border border-[#c9aa91] bg-[#efe2d5]">

                    <table className="w-full text-left text-sm">

                        <thead>
                            <tr className="border-b border-[#c9aa91] text-xs tracking-[2px] text-[#9a7b62]">
                                <th className="p-4 font-normal">DATE</th>
                                <th className="p-4 font-normal">TIME</th>
                                <th className="p-4 font-normal">CUSTOMER</th>
                                <th className="p-4 font-normal">STYLIST</th>
                                <th className="p-4 font-normal">SERVICE</th>
                                <th className="p-4 font-normal">STATUS</th>
                                <th className="p-4 font-normal">PAYMENT</th>
                                <th className="p-4 font-normal">ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody>

                            {visibleAppointments.map((appointment) => (

                                <tr
                                    key={appointment._id}
                                    className="border-b border-[#d8c6b6] text-[#6e5545]"
                                >
                                    <td className="p-4">
                                        {new Date(
                                            appointment.date
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        {appointment.startTime} -{" "}
                                        {appointment.endTime}
                                    </td>
                                    <td className="p-4 text-[#321d1d]">
                                        {appointment.customer?.name || "N/A"}
                                    </td>
                                    <td className="p-4">
                                        {appointment.stylist?.user?.name || "N/A"}
                                    </td>
                                    <td className="p-4">
                                        {appointment.service?.name || "N/A"}
                                    </td>
                                    <td className="p-4 uppercase tracking-[1px] text-[#5a182b]">
                                        {appointment.status}
                                    </td>
                                    <td className="p-4">
                                        {appointment.paymentStatus === "paid"
                                            ? `Paid ₹${appointment.amount}`
                                            : "Unpaid"}
                                    </td>
                                    <td className="p-4">

                                        {appointment.status === "pending" && (
                                            <button
                                                onClick={() =>
                                                    updateAppointment(
                                                        appointment._id,
                                                        { status: "approved" }
                                                    )
                                                }
                                                className="mr-3 text-[#5a182b] underline"
                                            >
                                                Approve
                                            </button>
                                        )}

                                        {(appointment.status === "pending" ||
                                            appointment.status === "approved") && (
                                                <span>
                                                    <button
                                                        onClick={() =>
                                                            rescheduleAppointment(
                                                                appointment
                                                            )
                                                        }
                                                        className="mr-3 text-[#5a182b] underline"
                                                    >
                                                        Reschedule
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            cancelAppointment(
                                                                appointment._id
                                                            )
                                                        }
                                                        className="text-[#5a182b] underline"
                                                    >
                                                        Cancel
                                                    </button>
                                                </span>
                                            )}

                                    </td>
                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            ) : (

                <p className="mt-8 text-[#6e5545]">
                    No appointments found.
                </p>

            )}

        </section>
    );

}

export default AdminAppointments;
