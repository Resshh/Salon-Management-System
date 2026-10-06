import { useEffect, useState } from "react";
import axios from "axios";

function StylistAppointments() {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

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

            alert("Appointment approved.");

            getAppointments();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to approve appointment"
            );

        }

    };


    // ================= REJECT =================

    const rejectAppointment = async (id) => {

        const confirmReject = window.confirm(
            "Are you sure you want to reject this appointment?"
        );

        if (!confirmReject) {
            return;
        }

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

            alert("Appointment rejected.");

            getAppointments();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to reject appointment"
            );

        }

    };


    // ================= COMPLETE =================

    const completeAppointment = async (id) => {

        const confirmComplete = window.confirm(
            "Mark this appointment as completed?"
        );

        if (!confirmComplete) {
            return;
        }

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

            alert("Appointment completed.");

            getAppointments();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to complete appointment"
            );

        }

    };


    // ================= STATUS STYLE =================

    const getStatusClass = (status) => {

        if (status === "approved") {
            return "text-green-700";
        }

        if (status === "rejected") {
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

                    {appointments.length > 0 ? (

                        appointments.map((appointment) => (

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

        </section>
    );
}

export default StylistAppointments;