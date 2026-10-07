import { useState } from "react";
import axios from "axios";
import Message from "../Message";
import ConfirmBox from "../ConfirmBox";

function AdminNotify() {

    // Success / error message shown at the top right
    const [message, setMessage] = useState(null);

    // Yes / no question box (null = hidden)
    const [confirmBox, setConfirmBox] = useState(null);

    // The notification the admin is writing
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    const [sending, setSending] = useState(false);

    const token = localStorage.getItem("token");


    // ================= CHECK THE FORM, THEN ASK =================

    const sendNotification = (e) => {

        e.preventDefault();

        if (!title.trim() || !body.trim()) {
            setMessage({
                type: "error",
                text: "Please enter a title and a message."
            });
            return;
        }

        // Ask first. The real work happens only after the user clicks YES.
        setConfirmBox({
            text: "Send this notification and email to ALL customers?",
            onYes: () => sendNotificationConfirmed()
        });

    };


    // ================= SEND TO ALL CUSTOMERS =================

    const sendNotificationConfirmed = async () => {

        try {

            setSending(true);

            const response = await axios.post(
                "http://localhost:5000/api/admin/notify",
                {
                    title: title,
                    message: body
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage({
                type: "success",
                text: response.data.message
            });

            setTitle("");
            setBody("");

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to send notification"
            });

        } finally {

            setSending(false);

        }

    };


    return (
        <section
            id="notify"
            className="bg-[#efe2d5] px-6 md:px-20 py-16 md:py-20"
        >

            <p className="text-xs tracking-[4px] text-[#9a7b62]">
                PROMOTIONS
            </p>

            <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                Notify Customers
            </h2>

            <p className="mt-4 max-w-xl text-[#6e5545]">
                Every customer gets this as an in-app notification and as an email.
            </p>

            <form
                onSubmit={sendNotification}
                className="mt-8 border border-[#c9aa91] bg-[#f7efe5] p-8"
            >

                <label className="text-sm text-[#6e5545]">
                    Title
                </label>

                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Example: Festive offer"
                    className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                />

                <label className="mt-5 block text-sm text-[#6e5545]">
                    Message
                </label>

                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows="4"
                    placeholder="Example: Use code FESTIVE20 for 20% off this week."
                    className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                />

                <button
                    type="submit"
                    disabled={sending}
                    className="mt-6 bg-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                >
                    {sending ? "SENDING..." : "SEND TO ALL CUSTOMERS"}
                </button>

            </form>

            <Message
                message={message}
                onClose={() => setMessage(null)}
            />

            <ConfirmBox
                confirmBox={confirmBox}
                onClose={() => setConfirmBox(null)}
            />

        </section>
    );

}

export default AdminNotify;
