import { useEffect, useState } from "react";
import axios from "axios";
import Message from "../Message";
import Modal from "../Modal";

function AdminComplaints() {

    // Success / error message shown at the top right
    const [message, setMessage] = useState(null);

    // Complaint being answered (null = box hidden)
    const [respondingComplaint, setRespondingComplaint] = useState(null);
    const [responseText, setResponseText] = useState("");

    const [complaints, setComplaints] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(() => {
        getComplaints();
    }, []);


    // ================= GET COMPLAINTS =================

    const getComplaints = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/admin/complaints",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setComplaints(response.data.complaints || []);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load complaints"
            );

        }

    };


    // ================= UPDATE COMPLAINT =================

    // data can be { status } or { adminResponse }
    const updateComplaint = async (id, data) => {

        try {

            await axios.put(
                `http://localhost:5000/api/complaint/${id}`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            getComplaints();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to update complaint"
            });

        }

    };


    // ================= WRITE RESPONSE =================

    const writeResponse = (complaint) => {

        // Open the response box with the current response filled in
        setResponseText(complaint.adminResponse || "");
        setRespondingComplaint(complaint);

    };


    const saveResponse = (e) => {

        e.preventDefault();

        updateComplaint(respondingComplaint._id, {
            adminResponse: responseText
        });

        setRespondingComplaint(null);

    };


    return (
        <section
            id="complaints"
            className="px-6 md:px-20 pt-10 pb-16 md:pb-20"
        >

            <h2 className="text-4xl font-normal text-[#5a182b]">
                Complaints
            </h2>

            {complaints.length > 0 ? (

                <div className="mt-8 space-y-5">

                    {complaints.map((complaint) => (

                        <div
                            key={complaint._id}
                            className="border border-[#c9aa91] bg-[#efe2d5] p-6"
                        >

                            <div className="flex flex-col md:flex-row md:justify-between gap-4">

                                <div>

                                    <h3 className="text-xl text-[#5a182b]">
                                        {complaint.subject}
                                    </h3>

                                    <p className="mt-2 text-sm text-[#6e5545]">
                                        {complaint.customer?.name || "Customer"}
                                        {" · "}
                                        {complaint.customer?.email}
                                        {" · "}
                                        {new Date(
                                            complaint.createdAt
                                        ).toLocaleDateString()}
                                    </p>

                                </div>


                                {/* STATUS */}

                                <select
                                    value={complaint.status}
                                    onChange={(e) =>
                                        updateComplaint(complaint._id, {
                                            status: e.target.value
                                        })
                                    }
                                    className="h-12 border border-[#c9aa91] bg-[#f7efe5] px-3 text-[#321d1d] outline-none"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In progress</option>
                                    <option value="resolved">Resolved</option>
                                </select>

                            </div>

                            <p className="mt-4 text-[#6e5545]">
                                {complaint.description}
                            </p>
                            {complaint.adminResponse && (

                                <div className="mt-4 border-l-2 border-[#b88952] pl-4">

                                    <p className="text-xs tracking-[2px] text-[#9a7b62]">
                                        YOUR RESPONSE
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-[#6e5545]">
                                        {complaint.adminResponse}
                                    </p>

                                </div>

                            )}

                            <button
                                onClick={() => writeResponse(complaint)}
                                className="mt-5 border border-[#5a182b] px-5 py-3 text-sm tracking-[1px] text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                            >
                                {complaint.adminResponse
                                    ? "EDIT RESPONSE"
                                    : "RESPOND"}
                            </button>

                        </div>

                    ))}

                </div>

            ) : (

                <p className="mt-8 text-[#6e5545]">
                    No complaints yet.
                </p>

            )}

            {/* ================= RESPONSE BOX ================= */}

            {respondingComplaint && (

                <Modal
                    title="Respond to complaint"
                    onClose={() => setRespondingComplaint(null)}
                >

                    <form onSubmit={saveResponse}>

                        <label className="text-sm text-[#6e5545]">
                            Your response to {respondingComplaint.customer?.name || "the customer"}
                        </label>

                        <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            rows="4"
                            className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                        />

                        <button
                            type="submit"
                            className="mt-6 bg-[#5a182b] px-6 py-3 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                        >
                            SAVE RESPONSE
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

export default AdminComplaints;
