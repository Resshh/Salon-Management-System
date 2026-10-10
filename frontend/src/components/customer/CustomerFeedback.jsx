import { useEffect, useState } from "react";
import api, { showError } from "../../api";
import Message from "../Message";
import { StarIcon } from "lucide-react";

function CustomerFeedback() {

    // Success / error message shown at the top right
    const [message, setMessage] = useState(null);

    const [appointments, setAppointments] = useState([]);
    const [feedback, setFeedback] = useState([]);

    const [selectedAppointment, setSelectedAppointment] = useState("");
    const [rating, setRating] = useState("5");

    // Star under the mouse (0 = the mouse is not over the stars)
    const [hoverRating, setHoverRating] = useState(0);

    // Stars to fill: the hovered star, otherwise the chosen rating
    const shownRating = hoverRating || Number(rating);

    // The word shown next to the stars (position 0 is not used)
    const ratingWords = ["", "Very poor", "Poor", "Average", "Good", "Excellent"];
    const [review, setReview] = useState("");

    useEffect(() => {
        getAppointments();
        getFeedback();
    }, []);


    // ================= COMPLETED APPOINTMENTS =================

    const getAppointments = async () => {

        try {

            const response = await api.get(
                "/appointment/my"
            );

            // Feedback is only allowed for completed appointments
            const completed = response.data.appointments.filter(
                (appointment) => appointment.status === "completed"
            );

            setAppointments(completed);

        } catch (error) {

            showError(
                error.response?.data?.message ||
                "Failed to load appointments"
            );

        }

    };


    // ================= MY FEEDBACK =================

    const getFeedback = async () => {

        try {

            const response = await api.get(
                "/feedback/my"
            );

            setFeedback(response.data.feedback || []);

        } catch (error) {

            showError(
                error.response?.data?.message ||
                "Failed to load feedback"
            );

        }

    };


    // ================= SUBMIT FEEDBACK =================

    const submitFeedback = async (e) => {

        e.preventDefault();

        if (!selectedAppointment) {
            setMessage({
                type: "error",
                text: "Please select an appointment."
            });
            return;
        }

        try {

            await api.post(
                "/feedback/",
                {
                    appointment: selectedAppointment,
                    rating: Number(rating),
                    review: review
                }
            );

            setMessage({
                type: "success",
                text: "Thank you for your feedback."
            });

            setSelectedAppointment("");
            setRating("5");
            setReview("");

            getFeedback();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to submit feedback"
            });

        }

    };


    // Ids of appointments that already have feedback
    const reviewedIds = feedback.map(
        (item) => item.appointment?._id
    );

    // Completed appointments that still need feedback
    const pendingAppointments = appointments.filter(
        (appointment) => !reviewedIds.includes(appointment._id)
    );


    return (
        <section
            id="feedback"
            className="bg-[#efe2d5] px-6 md:px-20 pt-10 pb-16 md:pb-20"
        >

            {/* ================= HEADING ================= */}

            <h2 className="text-4xl font-normal text-[#5a182b]">
                Feedback
            </h2>


            {/* ================= FEEDBACK FORM ================= */}

            {pendingAppointments.length > 0 ? (

                <form
                    onSubmit={submitFeedback}
                    className="mt-8 border border-[#c9aa91] bg-[#f7efe5] p-8"
                >

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* APPOINTMENT */}

                        <div>

                            <label className="text-sm text-[#6e5545]">
                                Appointment
                            </label>

                            <select
                                value={selectedAppointment}
                                onChange={(e) =>
                                    setSelectedAppointment(e.target.value)
                                }
                                className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                            >

                                <option value="">
                                    Select completed appointment
                                </option>

                                {pendingAppointments.map((appointment) => (

                                    <option
                                        key={appointment._id}
                                        value={appointment._id}
                                    >
                                        {appointment.service?.name} -{" "}
                                        {new Date(
                                            appointment.date
                                        ).toLocaleDateString()}
                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* RATING */}

                        <div>

                            <label className="text-sm text-[#6e5545]">
                                Rating
                            </label>

                            {/* 5 stars. "shown" is the star under the mouse,
                                or the chosen rating when the mouse is away. */}

                            <div
                                className="mt-2 flex items-center gap-1"
                                onMouseLeave={() => setHoverRating(0)}
                            >

                                {[1, 2, 3, 4, 5].map((star) => (

                                    <button
                                        key={star}
                                        type="button"
                                        aria-label={`${star} out of 5`}
                                        aria-pressed={Number(rating) === star}
                                        onClick={() => setRating(String(star))}
                                        onMouseEnter={() => setHoverRating(star)}
                                        className="star-button"
                                    >
                                        <StarIcon
                                            size={30}
                                            color="#b88952"
                                            fill={star <= shownRating ? "#b88952" : "none"}
                                        />
                                    </button>

                                ))}

                                <span className="ml-3 text-sm text-[#6e5545]">
                                    {ratingWords[shownRating]}
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* REVIEW */}

                    <div className="mt-5">

                        <label className="text-sm text-[#6e5545]">
                            Review
                        </label>

                        <textarea
                            value={review}
                            onChange={(e) =>
                                setReview(e.target.value)
                            }
                            rows="3"
                            placeholder="Tell us about your experience"
                            className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                        />

                    </div>

                    <button
                        type="submit"
                        className="mt-6 bg-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                    >
                        SUBMIT FEEDBACK
                    </button>

                </form>

            ) : (

                <p className="mt-6 text-[#6e5545]">
                    You can give feedback after an appointment is completed.
                </p>

            )}


            {/* ================= MY FEEDBACK ================= */}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                {feedback.map((item) => (

                    <div
                        key={item._id}
                        className="border border-[#c9aa91] bg-[#f7efe5] p-6"
                    >

                        <div className="flex justify-between gap-4">

                            <h3 className="text-xl text-[#5a182b]">
                                {item.appointment?.service?.name || "Service"}
                            </h3>

                            <p className="text-[#5a182b]">
                                {item.rating} / 5
                            </p>

                        </div>

                        <p className="mt-3 text-[#6e5545]">
                            {item.review || "No review written."}
                        </p>

                        <p className="mt-3 text-sm text-[#9a7b62]">
                            {new Date(
                                item.createdAt
                            ).toLocaleDateString()}
                        </p>

                    </div>

                ))}

            </div>

            <Message
                message={message}
                onClose={() => setMessage(null)}
            />

        </section>
    );

}

export default CustomerFeedback;
