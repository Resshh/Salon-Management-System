import { useEffect, useState } from "react";
import axios from "axios";

function AdminComplaints() {

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

            alert(
                error.response?.data?.message ||
                "Failed to update complaint"
            );

        }

    };


    // ================= WRITE RESPONSE =================

    const writeResponse = (complaint) => {

        const adminResponse = window.prompt(
            "Enter your response to the customer:",
            complaint.adminResponse || ""
        );

        // prompt gives null when the user clicks Cancel
        if (adminResponse === null) {
            return;
        }

        updateComplaint(complaint._id, {
            adminResponse: adminResponse
        });

    };


    return (
        <section
            id="complaints"
            className="px-6 md:px-20 py-16 md:py-20"
        >

            <p className="text-xs tracking-[4px] text-[#9a7b62]">
                CUSTOMER ISSUES
            </p>

            <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
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

        </section>
    );

}

export default AdminComplaints;
