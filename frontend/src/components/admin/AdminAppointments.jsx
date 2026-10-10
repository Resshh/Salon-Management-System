import { useEffect, useState } from "react";
import api, { showError } from "../../api";
import Message from "../Message";
import Modal from "../Modal";
import ConfirmBox from "../ConfirmBox";

function AdminAppointments() {

    // Success / error message shown at the top right
    const [message, setMessage] = useState(null);

    // Appointment being rescheduled (null = box hidden)
    const [reschedulingAppointment, setReschedulingAppointment] = useState(null);
    const [newDate, setNewDate] = useState("");
    const [newStartTime, setNewStartTime] = useState("");

    // Yes / no question box (null = hidden)
    const [confirmBox, setConfirmBox] = useState(null);

    const [appointments, setAppointments] = useState([]);

    // "all" or one status
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        getAppointments();
    }, []);


    // ================= GET APPOINTMENTS =================

    const getAppointments = async () => {

        try {

            const response = await api.get(
                "/admin/appointments"
            );

            setAppointments(response.data.appointments || []);

        } catch (error) {

            showError(
                error.response?.data?.message ||
                "Failed to load appointments"
            );

        }

    };


    // ================= UPDATE APPOINTMENT =================

    // data can be { status } or { date, startTime, endTime }
    const updateAppointment = async (id, data) => {

        try {

            await api.put(
                `/admin/appointments/${id}`,
                data
            );

            getAppointments();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to update appointment"
            });

        }

    };


    // ================= CANCEL =================

    const cancelAppointment = (id) => {

        // Ask first. The real work happens only after the user clicks YES.
        setConfirmBox({
            text: "Cancel this appointment? The customer and stylist will be notified, and an online payment is refunded.",
            onYes: () => cancelAppointmentConfirmed(id)
        });

    };


    const cancelAppointmentConfirmed = (id) => {

        updateAppointment(id, {
            status: "cancelled"
        });

    };


    // ================= RESCHEDULE =================

    const rescheduleAppointment = (appointment) => {

        // Open the reschedule box with empty fields
        setNewDate("");
        setNewStartTime("");
        setReschedulingAppointment(appointment);

    };


    const saveReschedule = (e) => {

        e.preventDefault();

        if (!newDate || !newStartTime) {
            setMessage({
                type: "error",
                text: "Please choose a new date and start time."
            });
            return;
        }

        // End time = start time + service duration
        const [hours, minutes] = newStartTime.split(":").map(Number);

        const duration = reschedulingAppointment.service?.duration || 45;

        const totalMinutes = hours * 60 + minutes + duration;

        const endHours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
        const endMinutes = String(totalMinutes % 60).padStart(2, "0");

        updateAppointment(reschedulingAppointment._id, {
            date: newDate,
            startTime: newStartTime,
            endTime: `${endHours}:${endMinutes}`
        });

        setReschedulingAppointment(null);

    };


    // ================= PAID IN CASH AT THE SALON =================

    const markCashPaid = (appointment) => {

        // Ask first. The real work happens only after the user clicks YES.
        setConfirmBox({
            text: `Mark this appointment as paid in cash (₹${appointment.service?.price})?`,
            onYes: () => markCashPaidConfirmed(appointment._id)
        });

    };


    const markCashPaidConfirmed = async (id) => {

        try {

            await api.put(
                `/payment/${id}/cash`,
                {}
            );

            setMessage({
                type: "success",
                text: "Marked as paid in cash."
            });

            getAppointments();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to mark cash payment"
            });

        }

    };


    // ================= PAYMENT TEXT =================

    const getPaymentText = (appointment) => {

        if (appointment.paymentStatus === "paid") {
            return `Paid ₹${appointment.amount} (${appointment.paymentMethod || "online"})`;
        }

        if (appointment.paymentStatus === "refunded") {
            return `Refunded ₹${appointment.amount}`;
        }

        return "Unpaid";

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

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <h2 className="text-4xl font-normal text-[#5a182b]">
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
                                        {getPaymentText(appointment)}
                                    </td>
                                    <td className="p-4">

                                        {(appointment.status === "approved" ||
                                            appointment.status === "completed") &&
                                            appointment.paymentStatus === "unpaid" && (
                                                <button
                                                    onClick={() =>
                                                        markCashPaid(
                                                            appointment
                                                        )
                                                    }
                                                    className="mr-3 text-[#5a182b] underline"
                                                >
                                                    Paid in cash
                                                </button>
                                            )}

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

            {/* ================= RESCHEDULE BOX ================= */}

            {reschedulingAppointment && (

                <Modal
                    title="Reschedule appointment"
                    onClose={() => setReschedulingAppointment(null)}
                >

                    <form onSubmit={saveReschedule}>

                        <p className="text-sm text-[#6e5545]">
                            {reschedulingAppointment.service?.name}
                            {" · "}
                            {reschedulingAppointment.customer?.name}
                        </p>

                        <label className="mt-4 block text-sm text-[#6e5545]">
                            New date
                        </label>

                        <input
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                        />

                        <label className="mt-4 block text-sm text-[#6e5545]">
                            New start time
                        </label>

                        <input
                            type="time"
                            value={newStartTime}
                            onChange={(e) => setNewStartTime(e.target.value)}
                            className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                        />

                        <button
                            type="submit"
                            className="mt-6 bg-[#5a182b] px-6 py-3 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                        >
                            SAVE NEW TIME
                        </button>

                    </form>

                </Modal>

            )}

            <Message
                message={message}
                onClose={() => setMessage(null)}
            />

            <ConfirmBox
                confirmBox={confirmBox}
                onClose={() => setConfirmBox(null)}
            />

        </section>
    );

}

export default AdminAppointments;
