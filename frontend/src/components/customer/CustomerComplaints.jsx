import { useEffect, useState } from "react";
import axios from "axios";

function CustomerComplaints() {

    const [complaints, setComplaints] = useState([]);

    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        getComplaints();
    }, []);


    // ================= MY COMPLAINTS =================

    const getComplaints = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/complaint/my",
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


    // ================= SUBMIT COMPLAINT =================

    const submitComplaint = async (e) => {

        e.preventDefault();

        if (!subject.trim() || !description.trim()) {
            alert("Please enter a subject and a description.");
            return;
        }

        try {

            await axios.post(
                "http://localhost:5000/api/complaint/",
                {
                    subject: subject,
                    description: description
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Complaint submitted.");

            setSubject("");
            setDescription("");

            getComplaints();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to submit complaint"
            );

        }

    };


    return (
        <section
            id="complaints"
            className="px-6 md:px-20 py-16 md:py-20"
        >

            {/* ================= HEADING ================= */}

            <p className="text-xs tracking-[4px] text-[#9a7b62]">
                NEED HELP?
            </p>

            <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                Complaints
            </h2>


            {/* ================= COMPLAINT FORM ================= */}

            <form
                onSubmit={submitComplaint}
                className="mt-8 border border-[#c9aa91] bg-[#efe2d5] p-8"
            >

                <div>

                    <label className="text-sm text-[#6e5545]">
                        Subject
                    </label>

                    <input
                        type="text"
                        value={subject}
                        onChange={(e) =>
                            setSubject(e.target.value)
                        }
                        placeholder="What is the complaint about?"
                        className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                    />

                </div>

                <div className="mt-5">

                    <label className="text-sm text-[#6e5545]">
                        Description
                    </label>

                    <textarea
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                        rows="4"
                        placeholder="Describe the problem"
                        className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                    />

                </div>

                <button
                    type="submit"
                    className="mt-6 bg-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                >
                    SUBMIT COMPLAINT
                </button>

            </form>


            {/* ================= MY COMPLAINTS ================= */}

            <div className="mt-8 space-y-5">

                {complaints.map((complaint) => (

                    <div
                        key={complaint._id}
                        className="border border-[#c9aa91] bg-[#efe2d5] p-6"
                    >

                        <div className="flex flex-col md:flex-row md:justify-between gap-3">

                            <h3 className="text-xl text-[#5a182b]">
                                {complaint.subject}
                            </h3>

                            <p className="text-sm tracking-[2px] uppercase text-[#5a182b]">
                                {complaint.status}
                            </p>

                        </div>

                        <p className="mt-3 text-[#6e5545]">
                            {complaint.description}
                        </p>

                        <p className="mt-3 text-sm text-[#9a7b62]">
                            {new Date(
                                complaint.createdAt
                            ).toLocaleDateString()}
                        </p>

                        {complaint.adminResponse && (

                            <div className="mt-4 border-l-2 border-[#b88952] pl-4">

                                <p className="text-xs tracking-[2px] text-[#9a7b62]">
                                    SALON RESPONSE
                                </p>

                                <p className="mt-2 text-sm leading-6 text-[#6e5545]">
                                    {complaint.adminResponse}
                                </p>

                            </div>

                        )}

                    </div>

                ))}

            </div>

        </section>
    );

}

export default CustomerComplaints;
