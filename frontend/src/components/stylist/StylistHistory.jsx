import { useEffect, useState } from "react";
import axios from "axios";

function StylistHistory() {

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        getHistory();
    }, []);


    // ================= GET HISTORY =================

    const getHistory = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/history/stylist",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setHistory(response.data.history || []);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load service history"
            );

        } finally {

            setLoading(false);

        }

    };


    // ================= ADD / EDIT NOTES =================

    const editNotes = async (item) => {

        const notes = window.prompt(
            "Enter notes for this service:",
            item.notes || ""
        );

        // prompt gives null when the user clicks Cancel
        if (notes === null) {
            return;
        }

        try {

            await axios.put(
                `http://localhost:5000/api/history/${item._id}/notes`,
                {
                    notes: notes
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            getHistory();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to save notes"
            );

        }

    };


    // ================= EARNINGS =================

    // Add up the price of every completed service
    let earnings = 0;

    for (const item of history) {
        earnings = earnings + (item.service?.price || 0);
    }


    return (
        <section
            id="history"
            className="px-6 md:px-20 py-16 md:py-20"
        >

            {/* ================= HEADING ================= */}

            <p className="text-xs tracking-[4px] text-[#9a7b62]">
                COMPLETED WORK
            </p>

            <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                Service History
            </h2>

            <p className="mt-4 max-w-xl text-[#6e5545]">
                Services you have completed. Add notes so you remember each customer's preferences.
            </p>


            {loading ? (

                <p className="mt-8 text-[#6e5545]">
                    Loading service history...
                </p>

            ) : history.length === 0 ? (

                <div className="mt-8 border border-[#c9aa91] bg-[#efe2d5] p-8">
                    <p className="text-[#6e5545]">
                        No completed services yet.
                    </p>
                </div>

            ) : (

                <div>

                <p className="mt-6 text-[#5a182b]">
                    Completed appointments: {history.length}
                    {" · "}
                    Total earnings: ₹{earnings}
                </p>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {history.map((item) => (

                        <div
                            key={item._id}
                            className="border border-[#c9aa91] bg-[#efe2d5] p-6"
                        >

                            <h3 className="text-2xl font-normal text-[#5a182b]">
                                {item.service?.name || "Service"}
                            </h3>

                            <p className="mt-4 text-[#6e5545]">
                                <span className="text-[#9a7b62]">
                                    Customer:
                                </span>{" "}
                                {item.customer?.name || "Customer"}
                            </p>

                            <p className="mt-1 text-sm text-[#6e5545]">
                                <span className="text-[#9a7b62]">
                                    Phone:
                                </span>{" "}
                                {item.customer?.phone || "Not available"}
                            </p>

                            <p className="mt-1 text-[#6e5545]">
                                <span className="text-[#9a7b62]">
                                    Date:
                                </span>{" "}
                                {new Date(
                                    item.serviceDate
                                ).toLocaleDateString()}
                            </p>

                            <div className="mt-5 border-l-2 border-[#b88952] pl-4">

                                <p className="text-xs tracking-[2px] text-[#9a7b62]">
                                    NOTES
                                </p>

                                <p className="mt-2 text-sm leading-6 text-[#6e5545]">
                                    {item.notes || "No notes added."}
                                </p>

                            </div>

                            <button
                                onClick={() => editNotes(item)}
                                className="mt-5 border border-[#5a182b] px-5 py-3 text-sm tracking-[1px] text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                            >
                                {item.notes ? "EDIT NOTES" : "ADD NOTES"}
                            </button>

                        </div>

                    ))}

                </div>

                </div>

            )}

        </section>
    );

}

export default StylistHistory;
