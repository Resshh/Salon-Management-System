import { useEffect, useState } from "react";
import axios from "axios";

function CustomerAppointments() {

    const [services, setServices] = useState([]);
    const [stylists, setStylists] = useState([]);
    const [appointments, setAppointments] = useState([]);

    const [selectedService, setSelectedService] = useState("");
    const [selectedStylist, setSelectedStylist] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [startTime, setStartTime] = useState("");

    // Free time slots for the chosen service, stylist and date
    const [slots, setSlots] = useState([]);

    const [showBooking, setShowBooking] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        getServices();
        getStylists();
        getAppointments();
    }, []);

    // Load the free slots again whenever service, stylist or date changes
    useEffect(() => {
        getSlots();
    }, [selectedService, selectedStylist, appointmentDate]);


    // ================= AVAILABLE SLOTS =================

    const getSlots = async () => {

        setStartTime("");

        if (!selectedService || !selectedStylist || !appointmentDate) {
            setSlots([]);
            return;
        }

        try {

            const response = await axios.get(
                "http://localhost:5000/api/appointment/slots",
                {
                    params: {
                        stylist: selectedStylist,
                        service: selectedService,
                        date: appointmentDate
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSlots(response.data.slots || []);

        } catch (error) {

            setSlots([]);

            console.log(
                error.response?.data?.message ||
                "Failed to load slots"
            );

        }

    };


    // ================= PAY WITH RAZORPAY =================

    const payAppointment = async (appointment) => {

        const couponCode = window.prompt(
            "Enter a coupon code (leave empty if you do not have one):",
            ""
        );

        // prompt gives null when the user clicks Cancel
        if (couponCode === null) {
            return;
        }

        try {

            // Step 1: our backend creates an order on Razorpay
            const response = await axios.post(
                "http://localhost:5000/api/payment/order",
                {
                    appointment: appointment._id,
                    couponCode: couponCode.trim()
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Step 2: open the Razorpay payment window
            const options = {
                key: response.data.key,
                amount: response.data.amount,
                currency: response.data.currency,
                order_id: response.data.orderId,
                name: "BEAUTÉ Salon",
                description: appointment.service?.name || "Salon service",

                // Step 3: Razorpay calls this after a successful payment
                handler: async (paymentResult) => {

                    try {

                        // Step 4: our backend checks the payment is genuine
                        await axios.post(
                            "http://localhost:5000/api/payment/verify",
                            paymentResult,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        );

                        alert("Payment successful.");

                        getAppointments();

                    } catch (error) {

                        alert(
                            error.response?.data?.message ||
                            "Payment verification failed"
                        );

                    }

                }
            };

            const paymentWindow = new window.Razorpay(options);

            paymentWindow.open();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to start payment"
            );

        }

    };


    // ================= SERVICES =================

    const getServices = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/service/"
            );

            setServices(response.data.services);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load services"
            );

        }

    };


    // ================= STYLISTS =================

    const getStylists = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/stylist/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setStylists(response.data);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load stylists"
            );

        }

    };


    // ================= APPOINTMENTS =================

    const getAppointments = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/appointment/my",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setAppointments(response.data.appointments || response.data);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load appointments"
            );

        }

    };


    // ================= CALCULATE END TIME =================

    const calculateEndTime = (start, duration) => {

        if (!start) {
            return "";
        }

        const [hours, minutes] = start.split(":").map(Number);

        const date = new Date();

        date.setHours(hours);
        date.setMinutes(minutes + Number(duration));

        const endHours = String(date.getHours()).padStart(2, "0");
        const endMinutes = String(date.getMinutes()).padStart(2, "0");

        return `${endHours}:${endMinutes}`;
    };


    // ================= BOOK APPOINTMENT =================

    const bookAppointment = async (e) => {

        e.preventDefault();

        if (
            !selectedService ||
            !selectedStylist ||
            !appointmentDate ||
            !startTime
        ) {

            alert("Please fill all appointment details.");
            return;

        }

        try {

            const selectedServiceData = services.find(
                (service) => service._id === selectedService
            );

            const endTime = calculateEndTime(
                startTime,
                selectedServiceData.duration
            );

            await axios.post(
                "http://localhost:5000/api/appointment/",
                {
                    stylist: selectedStylist,
                    service: selectedService,
                    date: appointmentDate,
                    startTime: startTime,
                    endTime: endTime
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Appointment request sent successfully.");

            setSelectedService("");
            setSelectedStylist("");
            setAppointmentDate("");
            setStartTime("");

            setShowBooking(false);

            getAppointments();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to book appointment"
            );

        }

    };


    // ================= CANCEL =================

    const cancelAppointment = async (id) => {

        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this appointment?"
        );

        if (!confirmCancel) {
            return;
        }

        try {

            await axios.put(
                `http://localhost:5000/api/appointment/${id}/cancel`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Appointment cancelled.");

            getAppointments();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to cancel appointment"
            );

        }

    };


    // ================= RESCHEDULE =================

    const rescheduleAppointment = async (appointment) => {

        const newDate = window.prompt(
            "Enter new date (YYYY-MM-DD):"
        );

        if (!newDate) {
            return;
        }

        const newStartTime = window.prompt(
            "Enter new start time (HH:MM):"
        );

        if (!newStartTime) {
            return;
        }

        try {

            let duration = 45;

            if (
                appointment.service &&
                typeof appointment.service === "object"
            ) {
                duration = appointment.service.duration || 45;
            }

            const newEndTime = calculateEndTime(
                newStartTime,
                duration
            );

            await axios.put(
                `http://localhost:5000/api/appointment/${appointment._id}/reschedule`,
                {
                    date: newDate,
                    startTime: newStartTime,
                    endTime: newEndTime
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Appointment rescheduled.");

            getAppointments();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to reschedule appointment"
            );

        }

    };


    return (
        <section
            id="appointments"
            className="bg-[#efe2d5] px-6 md:px-20 py-16 md:py-20"
        >

            {/* ================= HEADING ================= */}

            <p className="text-xs tracking-[4px] text-[#9a7b62]">
                YOUR APPOINTMENTS
            </p>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                    My Appointments
                </h2>

                <button
                    onClick={() => setShowBooking(!showBooking)}
                    className="bg-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                >
                    {showBooking
                        ? "CLOSE"
                        : "BOOK APPOINTMENT"}
                </button>

            </div>


            {/* ================= BOOKING FORM ================= */}

            {showBooking && (

                <form
                    onSubmit={bookAppointment}
                    className="mt-8 border border-[#c9aa91] bg-[#f7efe5] p-8"
                >

                    <h3 className="text-2xl text-[#5a182b]">
                        Book an Appointment
                    </h3>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* SERVICE */}

                        <div>

                            <label className="text-sm text-[#6e5545]">
                                Service
                            </label>

                            <select
                                value={selectedService}
                                onChange={(e) =>
                                    setSelectedService(e.target.value)
                                }
                                className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                            >

                                <option value="">
                                    Select service
                                </option>

                                {services.map((service) => (

                                    <option
                                        key={service._id}
                                        value={service._id}
                                    >
                                        {service.name} - ₹{service.price}
                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* STYLIST */}

                        <div>

                            <label className="text-sm text-[#6e5545]">
                                Stylist
                            </label>

                            <select
                                value={selectedStylist}
                                onChange={(e) =>
                                    setSelectedStylist(e.target.value)
                                }
                                className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                            >

                                <option value="">
                                    Select stylist
                                </option>

                                {stylists.map((stylist) => (

                                    <option
                                        key={stylist._id}
                                        value={stylist._id}
                                    >
                                        {stylist.user?.name}
                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* DATE */}

                        <div>

                            <label className="text-sm text-[#6e5545]">
                                Date
                            </label>

                            <input
                                type="date"
                                value={appointmentDate}
                                onChange={(e) =>
                                    setAppointmentDate(e.target.value)
                                }
                                className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                            />

                        </div>


                        {/* TIME */}

                        <div>

                            <label className="text-sm text-[#6e5545]">
                                Available Time Slot
                            </label>

                            <select
                                value={startTime}
                                onChange={(e) =>
                                    setStartTime(e.target.value)
                                }
                                className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                            >

                                <option value="">
                                    {slots.length > 0
                                        ? "Select time slot"
                                        : "No slots (choose service, stylist and date)"}
                                </option>

                                {slots.map((slot) => (

                                    <option
                                        key={slot.startTime}
                                        value={slot.startTime}
                                    >
                                        {slot.startTime} - {slot.endTime}
                                    </option>

                                ))}

                            </select>

                        </div>

                    </div>


                    <button
                        type="submit"
                        className="mt-6 bg-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                    >
                        CONFIRM BOOKING
                    </button>

                </form>

            )}


            {/* ================= APPOINTMENT LIST ================= */}

            <div className="mt-8 space-y-5">

                {appointments.length > 0 ? (

                    appointments.map((appointment) => (

                        <div
                            key={appointment._id}
                            className="border border-[#c9aa91] bg-[#f7efe5] p-7"
                        >

                            <div className="flex flex-col md:flex-row md:justify-between gap-5">

                                <div>

                                    <h3 className="text-xl text-[#5a182b]">
                                        {appointment.service?.name ||
                                            "Service"}
                                    </h3>

                                    <p className="mt-2 text-[#6e5545]">
                                        Stylist:{" "}
                                        {appointment.stylist?.user?.name ||
                                            "Stylist"}
                                    </p>

                                    <p className="mt-1 text-[#6e5545]">
                                        Date:{" "}
                                        {new Date(
                                            appointment.date
                                        ).toLocaleDateString()}
                                    </p>

                                    <p className="mt-1 text-[#6e5545]">
                                        Time:{" "}
                                        {appointment.startTime} -{" "}
                                        {appointment.endTime}
                                    </p>

                                </div>


                                <div>

                                    <p className="text-sm tracking-[2px] uppercase text-[#5a182b]">
                                        {appointment.status}
                                    </p>

                                    {/* PAYMENT */}

                                    {appointment.paymentStatus === "paid" && (

                                        <p className="mt-2 text-sm text-green-700">
                                            PAID ₹{appointment.amount}
                                        </p>

                                    )}

                                    {(appointment.status === "approved" ||
                                        appointment.status === "completed") &&
                                        appointment.paymentStatus !== "paid" && (

                                            <button
                                                onClick={() =>
                                                    payAppointment(
                                                        appointment
                                                    )
                                                }
                                                className="mt-4 bg-[#5a182b] px-4 py-2 text-sm text-[#f7efe5] hover:bg-[#321d1d]"
                                            >
                                                PAY ₹{appointment.service?.price}
                                            </button>

                                        )}

                                    {(appointment.status === "pending" ||
                                        appointment.status === "approved") && (

                                            <div className="mt-4 flex gap-3">

                                                <button
                                                    onClick={() =>
                                                        rescheduleAppointment(
                                                            appointment
                                                        )
                                                    }
                                                    className="border border-[#5a182b] px-4 py-2 text-sm text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                                                >
                                                    RESCHEDULE
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        cancelAppointment(
                                                            appointment._id
                                                        )
                                                    }
                                                    className="border border-[#5a182b] px-4 py-2 text-sm text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                                                >
                                                    CANCEL
                                                </button>

                                            </div>

                                        )}

                                </div>

                            </div>

                        </div>

                    ))

                ) : (

                    <div className="border border-[#c9aa91] bg-[#f7efe5] p-8">

                        <p className="text-[#6e5545]">
                            No appointments yet.
                        </p>

                    </div>

                )}

            </div>

        </section>
    );
}

export default CustomerAppointments;