import { useEffect, useState } from "react";
import api, { showError } from "../../api";
import { ScissorsIcon, UserIcon } from "lucide-react";
import SkeletonCards from "../Skeleton";

function AdminFeedback() {

    const [feedback, setFeedback] = useState([]);

    // true until the first answer comes back from the server
    const [loading, setLoading] = useState(true);

    // Stylist chosen in the filter ("" = all stylists)
    const [stylistId, setStylistId] = useState("");

    useEffect(() => {
        getFeedback();
    }, []);


    // ================= GET FEEDBACK =================

    const getFeedback = async () => {

        try {

            const response = await api.get(
                "/admin/feedback"
            );

            setFeedback(response.data.feedback || []);

        } catch (error) {

            showError(
                error.response?.data?.message ||
                "Failed to load feedback"
            );

        } finally {

            setLoading(false);

        }

    };


    // ================= STYLIST FILTER =================

    // Every stylist that has feedback, once each (for the dropdown)
    const stylists = [];

    for (const item of feedback) {

        const stylist = item.appointment?.stylist;

        if (stylist && !stylists.some((s) => s._id === stylist._id)) {
            stylists.push(stylist);
        }

    }

    // Feedback shown on the page
    const shownFeedback = stylistId
        ? feedback.filter(
            (item) => item.appointment?.stylist?._id === stylistId
        )
        : feedback;


    return (
        <section
            id="feedback"
            className="bg-[#efe2d5] px-6 md:px-20 pt-10 pb-16 md:pb-20"
        >

            <div className="flex flex-wrap items-center justify-between gap-4">

                <h2 className="text-4xl font-normal text-[#5a182b]">
                    Feedback
                </h2>

                <select
                    value={stylistId}
                    onChange={(e) =>
                        setStylistId(e.target.value)
                    }
                    aria-label="Stylist"
                    className="border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                >
                    <option value="">All stylists</option>

                    {stylists.map((stylist) => (
                        <option key={stylist._id} value={stylist._id}>
                            {stylist.user?.name || "N/A"}
                        </option>
                    ))}
                </select>

            </div>

            {loading ? (

                <SkeletonCards />

            ) : shownFeedback.length > 0 ? (

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {shownFeedback.map((item) => (

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
                                    <UserIcon size={14} className="card-icon" />Customer:
                                </span>{" "}
                                {item.customer?.name || "N/A"}
                            </p>

                            <p className="mt-1 text-sm text-[#6e5545]">
                                <span className="text-[#9a7b62]">
                                    <ScissorsIcon size={14} className="card-icon" />Stylist:
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
