import { useEffect, useState } from "react";
import axios from "axios";
import Message from "../Message";
import ConfirmBox from "../ConfirmBox";

function StylistAppointments() {

    // Success / error message shown at the top right
    const [message, setMessage] = useState(null);

    // Yes / no question box (null = hidden)
    const [confirmBox, setConfirmBox] = useState(null);

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // "all", "today", "week" or "upcoming"
    const [filter, setFilter] = useState("all");

    // Previous services of one customer (null = panel is closed)
    const [customerHistory, setCustomerHistory] = useState(null);
    const [historyCustomerName, setHistoryCustomerName] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        getAppointments();
    }, []);

    // ================= GET APPOINTMENTS =================

    const getAppointments = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/appointment/stylist",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setAppointments(
                response.data.appointments || []
            );

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load appointments"
            );

        } finally {

            setLoading(false);

        }

    };


    // ================= APPROVE =================

    const approveAppointment = async (id) => {

        try {

            await axios.put(
                `http://localhost:5000/api/appointment/${id}/approve`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage({
                type: "success",
                text: "Appointment approved."
            });

            getAppointments();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to approve appointment"
            });

        }

    };


    // ================= REJECT =================

    const rejectAppointment = (id) => {

        // Ask first. The real work happens only after the user clicks YES.
        setConfirmBox({
            text: "Are you sure you want to reject this appointment?",
            onYes: () => rejectAppointmentConfirmed(id)
        });

    };


    const rejectAppointmentConfirmed = async (id) => {

        try {

            await axios.put(
                `http://localhost:5000/api/appointment/${id}/reject`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage({
                type: "success",
                text: "Appointment rejected."
            });

            getAppointments();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to reject appointment"
            });

        }

    };


    // ================= COMPLETE =================

    const completeAppointment = (id) => {

        // Ask first. The real work happens only after the user clicks YES.
        setConfirmBox({
            text: "Mark this appointment as completed?",
            onYes: () => completeAppointmentConfirmed(id)
        });

    };


    const completeAppointmentConfirmed = async (id) => {

        try {

            await axios.put(
                `http://localhost:5000/api/appointment/${id}/complete`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage({
                type: "success",
                text: "Appointment completed."
            });

            getAppointments();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to complete appointment"
            });

        }

    };


    // ================= NO-SHOW =================

    const markNoShow = (id) => {

        // Ask first. The real work happens only after the user clicks YES.
        setConfirmBox({
            text: "Mark this appointment as no-show (customer did not come)?",
            onYes: () => markNoShowConfirmed(id)
        });

    };


    const markNoShowConfirmed = async (id) => {

        try {

            await axios.put(
                `http://localhost:5000/api/appointment/${id}/no-show`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            getAppointments();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to mark no-show"
            });

        }

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

            await axios.put(
                `http://localhost:5000/api/payment/${id}/cash`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
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


    // ================= CUSTOMER HISTORY =================

    const viewCustomerHistory = async (customer) => {

        try {

            const response = await axios.get(
                `http://localhost:5000/api/history/customer/${customer._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setHistoryCustomerName(customer.name);
            setCustomerHistory(response.data.history || []);

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to load customer history"
            });

        }

    };


    // ================= FILTER =================

    // Date object -> "YYYY-MM-DD"
    const toDateString = (date) => {

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;

    };

    const today = new Date();

    const weekEnd = new Date();
    weekEnd.setDate(today.getDate() + 6);

    const todayString = toDateString(today);
    const weekEndString = toDateString(weekEnd);

    const visibleAppointments = appointments.filter((appointment) => {

        // The API sends the date like "2026-10-06T00:00:00.000Z"
        const dateString = appointment.date.slice(0, 10);

        if (filter === "today") {
            return dateString === todayString;
        }

        if (filter === "week") {
            return dateString >= todayString && dateString <= weekEndString;
        }

        if (filter === "upcoming") {
            return (
                dateString >= todayString &&
                (appointment.status === "pending" ||
                    appointment.status === "approved")
            );
        }

        return true;

    });


    // ================= STATUS STYLE =================

    const getStatusClass = (status) => {

        if (status === "approved") {
            return "text-green-700";
        }

        if (status === "rejected") {
            return "text-red-700";
        }

        if (status === "no-show") {
            return "text-red-700";
        }

        if (status === "cancelled") {
            return "text-red-700";
        }

        if (status === "completed") {
            return "text-blue-700";
        }

        return "text-[#9a7b62]";

    };


    return (
        <section
            id="appointments"
            className="bg-[#efe2d5] px-6 md:px-20 py-16 md:py-20"
        >

            {/* ================= HEADING ================= */}

            <p className="text-xs tracking-[4px] text-[#9a7b62]">
                YOUR BOOKINGS
            </p>

            <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                Appointments
            </h2>


            {/* ================= FILTER ================= */}

            <select
                value={filter}
                onChange={(e) =>
                    setFilter(e.target.value)
                }
                className="mt-6 border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
            >
                <option value="all">All appointments</option>
                <option value="today">Today</option>
                <option value="week">Next 7 days</option>
                <option value="upcoming">Upcoming</option>
            </select>


            {/* ================= CUSTOMER HISTORY ================= */}

            {customerHistory && (

                <div className="mt-8 border border-[#5a182b] bg-[#f7efe5] p-7">

                    <div className="flex justify-between gap-4">

                        <h3 className="text-xl text-[#5a182b]">
                            Service history of {historyCustomerName}
                        </h3>

                        <button
                            onClick={() => setCustomerHistory(null)}
                            className="text-sm text-[#5a182b] underline"
                        >
                            CLOSE
                        </button>

                    </div>

                    {customerHistory.length > 0 ? (

                        customerHistory.map((item) => (

                            <p
                                key={item._id}
                                className="mt-3 text-sm text-[#6e5545]"
                            >
                                {new Date(
                                    item.serviceDate
                                ).toLocaleDateString()}
                                {" · "}
                                {item.service?.name}
                                {" · "}
                                {item.stylist?.user?.name}
                                {item.notes ? ` · Notes: ${item.notes}` : ""}
                            </p>

                        ))

                    ) : (

                        <p className="mt-3 text-sm text-[#6e5545]">
                            No previous services.
                        </p>

                    )}

                </div>

            )}


            {/* ================= LOADING ================= */}

            {loading ? (

                <div className="mt-8 border border-[#c9aa91] bg-[#f7efe5] p-8">

                    <p className="text-[#6e5545]">
                        Loading appointments...
                    </p>

                </div>

            ) : (


                /* ================= APPOINTMENTS ================= */

                <div className="mt-8 space-y-5">

                    {visibleAppointments.length > 0 ? (

                        visibleAppointments.map((appointment) => (

                            <div
                                key={appointment._id}
                                className="border border-[#c9aa91] bg-[#f7efe5] p-7"
                            >

                                <div className="flex flex-col lg:flex-row lg:justify-between gap-6">

                                    {/* ================= DETAILS ================= */}

                                    <div>

                                        <h3 className="text-2xl font-normal text-[#5a182b]">
                                            {appointment.service?.name ||
                                                "Service"}
                                        </h3>


                                        {/* Customer */}

                                        <p className="mt-4 text-[#6e5545]">

                                            <span className="text-[#9a7b62]">
                                                Customer:
                                            </span>{" "}

                                            {appointment.customer?.name ||
                                                "Customer"}

                                        </p>


                                        {/* Email */}

                                        <p className="mt-1 text-sm text-[#6e5545]">

                                            <span className="text-[#9a7b62]">
                                                Email:
                                            </span>{" "}

                                            {appointment.customer?.email ||
                                                "Not available"}

                                        </p>


                                        {/* Phone */}

                                        <p className="mt-1 text-sm text-[#6e5545]">

                                            <span className="text-[#9a7b62]">
                                                Phone:
                                            </span>{" "}

                                            {appointment.customer?.phone ||
                                                "Not available"}

                                        </p>


                                        {/* Date */}

                                        <p className="mt-4 text-[#6e5545]">

                                            <span className="text-[#9a7b62]">
                                                Date:
                                            </span>{" "}

                                            {new Date(
                                                appointment.date
                                            ).toLocaleDateString()}

                                        </p>


                                        {/* Time */}

                                        <p className="mt-1 text-[#6e5545]">

                                            <span className="text-[#9a7b62]">
                                                Time:
                                            </span>{" "}

                                            {appointment.startTime} -{" "}
                                            {appointment.endTime}

                                        </p>
                                        {/* Payment */}

                                        <p className="mt-1 text-[#6e5545]">

                                            <span className="text-[#9a7b62]">
                                                Payment:
                                            </span>{" "}

                                            {getPaymentText(appointment)}

                                        </p>


                                        {/* Price */}

                                        {appointment.service?.price && (

                                            <p className="mt-1 text-[#6e5545]">

                                                <span className="text-[#9a7b62]">
                                                    Price:
                                                </span>{" "}

                                                ₹{appointment.service.price}

                                            </p>

                                        )}

                                    </div>


                                    {/* ================= STATUS & ACTIONS ================= */}

                                    <div className="lg:min-w-48">

                                        <p
                                            className={`text-sm tracking-[2px] uppercase ${getStatusClass(
                                                appointment.status
                                            )}`}
                                        >
                                            {appointment.status}
                                        </p>


                                        {/* PENDING */}

                                        {appointment.status === "pending" && (

                                            <div className="mt-5 flex flex-wrap gap-3">

                                                <button
                                                    onClick={() =>
                                                        approveAppointment(
                                                            appointment._id
                                                        )
                                                    }
                                                    className="bg-[#5a182b] px-5 py-3 text-sm tracking-[1px] text-[#f7efe5] hover:bg-[#321d1d]"
                                                >
                                                    APPROVE
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        rejectAppointment(
                                                            appointment._id
                                                        )
                                                    }
                                                    className="border border-[#5a182b] px-5 py-3 text-sm tracking-[1px] text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                                                >
                                                    REJECT
                                                </button>

                                            </div>

                                        )}


                                        {/* APPROVED */}

                                        {appointment.status === "approved" && (

                                            <button
                                                onClick={() =>
                                                    completeAppointment(
                                                        appointment._id
                                                    )
                                                }
                                                className="mt-5 bg-[#5a182b] px-5 py-3 text-sm tracking-[1px] text-[#f7efe5] hover:bg-[#321d1d]"
                                            >
                                                MARK COMPLETED
                                            </button>

                                        )}

                                        {appointment.status === "approved" && (

                                            <button
                                                onClick={() =>
                                                    markNoShow(
                                                        appointment._id
                                                    )
                                                }
                                                className="mt-3 block border border-[#5a182b] px-5 py-3 text-sm tracking-[1px] text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                                            >
                                                NO-SHOW
                                            </button>

                                        )}

                                        {(appointment.status === "approved" ||
                                            appointment.status === "completed") &&
                                            appointment.paymentStatus === "unpaid" && (

                                                <button
                                                    onClick={() =>
                                                        markCashPaid(
                                                            appointment
                                                        )
                                                    }
                                                    className="mt-3 block border border-[#5a182b] px-5 py-3 text-sm tracking-[1px] text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                                                >
                                                    PAID IN CASH
                                                </button>

                                            )}

                                        {appointment.customer && (

                                            <button
                                                onClick={() =>
                                                    viewCustomerHistory(
                                                        appointment.customer
                                                    )
                                                }
                                                className="mt-3 block text-sm text-[#5a182b] underline"
                                            >
                                                Customer history
                                            </button>

                                        )}

                                    </div>

                                </div>

                            </div>

                        ))

                    ) : (

                        <div className="border border-[#c9aa91] bg-[#f7efe5] p-8">

                            <p className="text-[#6e5545]">
                                No appointments found.
                            </p>

                        </div>

                    )}

                </div>

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

export default StylistAppointments;