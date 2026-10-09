import { useEffect, useState } from "react";
import axios from "axios";
import Message from "../Message";
import Modal from "../Modal";

function StylistHistory() {

    // Success / error message shown at the top right
    const [message, setMessage] = useState(null);

    // History item whose notes are being edited (null = box hidden)
    const [editingItem, setEditingItem] = useState(null);
    const [notesText, setNotesText] = useState("");

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

    const editNotes = (item) => {

        // Open the notes box with the current notes filled in
        setNotesText(item.notes || "");
        setEditingItem(item);

    };


    const saveNotes = async (e) => {

        e.preventDefault();

        try {

            await axios.put(
                `http://localhost:5000/api/history/${editingItem._id}/notes`,
                {
                    notes: notesText
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setEditingItem(null);

            setMessage({
                type: "success",
                text: "Notes saved."
            });

            getHistory();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to save notes"
            });

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

            <h2 className="text-4xl font-normal text-[#5a182b]">
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

            {/* ================= NOTES BOX ================= */}

            {editingItem && (

                <Modal
                    title="Service notes"
                    onClose={() => setEditingItem(null)}
                >

                    <form onSubmit={saveNotes}>

                        <label className="text-sm text-[#6e5545]">
                            Notes for {editingItem.customer?.name || "this customer"}
                        </label>

                        <textarea
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            rows="4"
                            className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                        />

                        <button
                            type="submit"
                            className="mt-6 bg-[#5a182b] px-6 py-3 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                        >
                            SAVE NOTES
                        </button>

                    </form>

                </Modal>

            )}

            <Message
                message={message}
                onClose={() => setMessage(null)}
            />

        </section>
    );

}

export default StylistHistory;
