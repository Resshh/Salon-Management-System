import { useEffect, useState } from "react";
import api, { showError } from "../../api";
import SkeletonCards from "../Skeleton";

function StylistRatings() {

    const [feedback, setFeedback] = useState([]);

    // true until the first answer comes back from the server
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFeedback();
    }, []);


    // ================= GET MY RATINGS =================

    const getFeedback = async () => {

        try {

            const response = await api.get(
                "/feedback/stylist"
            );

            setFeedback(response.data.feedback || []);

        } catch (error) {

            showError(
                error.response?.data?.message ||
                "Failed to load ratings"
            );

        } finally {

            setLoading(false);

        }

    };


    // ================= AVERAGE RATING =================

    let average = 0;

    if (feedback.length > 0) {

        let total = 0;

        for (const item of feedback) {
            total = total + item.rating;
        }

        // toFixed(1) keeps one decimal place, example 4.3
        average = (total / feedback.length).toFixed(1);

    }


    return (
        <section
            id="ratings"
            className="bg-[#efe2d5] px-6 md:px-20 py-16 md:py-20"
        >

            <h2 className="text-4xl font-normal text-[#5a182b]">
                Ratings &amp; Feedback
            </h2>

            {loading ? (

                <SkeletonCards />

            ) : feedback.length > 0 ? (

                <div>

                    <p className="mt-4 text-[#6e5545]">
                        Average rating: {average} / 5 from {feedback.length} reviews
                    </p>

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
                                    {item.customer?.name || "Customer"}
                                    {" · "}
                                    {new Date(
                                        item.createdAt
                                    ).toLocaleDateString()}
                                </p>

                            </div>

                        ))}

                    </div>

                </div>

            ) : (

                <p className="mt-8 text-[#6e5545]">
                    No ratings yet.
                </p>

            )}

        </section>
    );

}

export default StylistRatings;
