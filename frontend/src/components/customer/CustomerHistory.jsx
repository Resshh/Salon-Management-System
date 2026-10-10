import { useEffect, useState } from "react";
import api from "../../api";
import { CalendarIcon, ClockIcon, ScissorsIcon, TimerIcon } from "lucide-react";
import SkeletonCards from "../Skeleton";

function CustomerHistory() {

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getHistory();
    }, []);

    const getHistory = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/history/customer"
            );

            setHistory(response.data.history || []);

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to load service history"
            );

        } finally {

            setLoading(false);

        }

    };


    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    };


    if (loading) {

        return (
            <section
                id="history"
                className="bg-[#f7efe5] px-6 md:px-20 py-16 md:py-20"
            >
                <h2 className="text-4xl font-normal text-[#5a182b]">
                    Service History
                </h2>

                <SkeletonCards />
            </section>
        );

    }


    return (

        <section
            id="history"
            className="bg-[#f7efe5] px-6 md:px-20 py-16 md:py-20"
        >

            {/* HEADING */}

            <h2 className="text-4xl font-normal text-[#5a182b]">
                Service History
            </h2>

            <p className="mt-4 max-w-xl text-[#6e5545]">
                View your previous salon services and appointment details.
            </p>


            {/* ERROR */}

            {error && (

                <div className="mt-8 border border-[#c9aa91] bg-[#efe2d5] p-5">

                    <p className="text-[#5a182b]">
                        {error}
                    </p>

                    <button
                        onClick={getHistory}
                        className="mt-4 bg-[#5a182b] px-5 py-3 text-sm tracking-[1px] text-[#f7efe5] hover:bg-[#321d1d]"
                    >
                        TRY AGAIN
                    </button>

                </div>

            )}


            {/* NO HISTORY */}

            {!error && history.length === 0 && (

                <div className="mt-8 border border-[#c9aa91] bg-[#efe2d5] p-8">

                    <h3 className="text-xl text-[#5a182b]">
                        No service history yet
                    </h3>

                    <p className="mt-3 text-[#6e5545]">
                        Your completed salon services will appear here.
                    </p>

                </div>

            )}


            {/* HISTORY */}

            {!error && history.length > 0 && (

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {history.map((item) => (

                        <div
                            key={item._id}
                            className="border border-[#c9aa91] bg-[#efe2d5] p-6"
                        >

                            {/* SERVICE */}

                            <div className="flex items-start justify-between gap-4">

                                <div>

                                    <p className="text-xs tracking-[2px] text-[#9a7b62]">
                                        SERVICE
                                    </p>

                                    <h3 className="mt-2 text-2xl text-[#5a182b]">
                                        {item.service?.name || "Service"}
                                    </h3>

                                </div>

                                {item.service?.price !== undefined && (

                                    <p className="text-lg text-[#5a182b]">
                                        ₹{item.service.price}
                                    </p>

                                )}

                            </div>


                            {/* DETAILS */}

                            <div className="mt-6 space-y-3 text-sm text-[#6e5545]">

                                <div className="flex justify-between gap-4 border-b border-[#d8c6b6] pb-3">

                                    <span>
                                        <CalendarIcon size={14} className="card-icon" />Date
                                    </span>

                                    <span className="text-[#321d1d]">
                                        {formatDate(item.serviceDate)}
                                    </span>

                                </div>


                                <div className="flex justify-between gap-4 border-b border-[#d8c6b6] pb-3">

                                    <span>
                                        <ScissorsIcon size={14} className="card-icon" />Stylist
                                    </span>

                                    <span className="text-[#321d1d]">
                                        {item.stylist?.user?.name || "N/A"}
                                    </span>

                                </div>


                                {item.service?.duration && (

                                    <div className="flex justify-between gap-4 border-b border-[#d8c6b6] pb-3">

                                        <span>
                                            <TimerIcon size={14} className="card-icon" />Duration
                                        </span>

                                        <span className="text-[#321d1d]">
                                            {item.service.duration} minutes
                                        </span>

                                    </div>

                                )}

                                {item.appointment?.startTime && (

                                    <div className="flex justify-between gap-4 border-b border-[#d8c6b6] pb-3">

                                        <span>
                                            <ClockIcon size={14} className="card-icon" />Time
                                        </span>

                                        <span className="text-[#321d1d]">
                                            {item.appointment.startTime}
                                            {" - "}
                                            {item.appointment.endTime}
                                        </span>

                                    </div>

                                )}

                            </div>


                            {/* NOTES */}

                            {item.notes && (

                                <div className="mt-6 border-l-2 border-[#b88952] pl-4">

                                    <p className="text-xs tracking-[2px] text-[#9a7b62]">
                                        STYLIST NOTES
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-[#6e5545]">
                                        {item.notes}
                                    </p>

                                </div>

                            )}

                        </div>

                    ))}

                </div>

            )}

        </section>

    );

}

export default CustomerHistory;