import { useEffect, useState } from "react";
import axios from "axios";

function AdminFeedback() {

    const [feedback, setFeedback] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(() => {
        getFeedback();
    }, []);


    // ================= GET FEEDBACK =================

    const getFeedback = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/admin/feedback",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setFeedback(response.data.feedback || []);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load feedback"
            );

        }

    };


    return (
        <section
            id="feedback"
            className="bg-[#efe2d5] px-6 md:px-20 pt-10 pb-16 md:pb-20"
        >

            <p className="text-xs tracking-[4px] text-[#9a7b62]">
                WHAT CUSTOMERS SAY
            </p>

            <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                Feedback
            </h2>

            {feedback.length > 0 ? (

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

                            <p className="mt-4 text-sm text-[#6e5545]">
                                <span className="text-[#9a7b62]">
                                    Customer:
                                </span>{" "}
                                {item.customer?.name || "N/A"}
                            </p>

                            <p className="mt-1 text-sm text-[#6e5545]">
                                <span className="text-[#9a7b62]">
                                    Stylist:
                                </span>{" "}
                                {item.appointment?.stylist?.user?.name || "N/A"}
                            </p>

                            <p className="mt-1 text-sm text-[#9a7b62]">
                                {new Date(
                                    item.createdAt
                                ).toLocaleDateString()}
                            </p>

                        </div>

                    ))}

                </div>

            ) : (

                <p className="mt-8 text-[#6e5545]">
                    No feedback yet.
                </p>

            )}

        </section>
    );

}

export default AdminFeedback;
