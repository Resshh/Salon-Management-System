import { useEffect, useState } from "react";
import axios from "axios";

function CustomerNotifications() {

    const [notifications, setNotifications] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(() => {
        getNotifications();
    }, []);

    const getNotifications = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/notification/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setNotifications(response.data.notifications || response.data);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load notifications"
            );

        }

    };


    const markAsRead = async (id) => {

        try {

            await axios.put(
                `http://localhost:5000/api/notification/${id}/read`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            getNotifications();

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to mark notification as read"
            );

        }

    };


    return (
        <section
            id="notifications"
            className="px-6 md:px-20 py-16 md:py-20"
        >

            <p className="text-xs tracking-[4px] text-[#9a7b62]">
                STAY UPDATED
            </p>

            <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                Notifications
            </h2>


            <div className="mt-8 space-y-4">

                {notifications.length > 0 ? (

                    notifications.map((notification) => (

                        <div
                            key={notification._id}
                            className={`border p-6 ${notification.isRead
                                    ? "border-[#d8c6b6] bg-[#f7efe5]"
                                    : "border-[#c9aa91] bg-[#efe2d5]"
                                }`}
                        >

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                <div>

                                    <p className="text-[#321d1d]">
                                        {notification.message}
                                    </p>

                                    <p className="mt-2 text-xs text-[#9a7b62]">
                                        {new Date(
                                            notification.createdAt
                                        ).toLocaleString()}
                                    </p>

                                </div>


                                {!notification.isRead && (

                                    <button
                                        onClick={() =>
                                            markAsRead(
                                                notification._id
                                            )
                                        }
                                        className="border border-[#5a182b] px-4 py-2 text-sm text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                                    >
                                        MARK AS READ
                                    </button>

                                )}

                            </div>

                        </div>

                    ))

                ) : (

                    <div className="border border-[#d8c6b6] bg-[#f7efe5] p-8">

                        <p className="text-[#6e5545]">
                            No notifications.
                        </p>

                    </div>

                )}

            </div>

        </section>
    );
}

export default CustomerNotifications;