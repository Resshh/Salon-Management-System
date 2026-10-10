import { useEffect, useState } from "react";
import api, { showError, API_URL } from "../api";
import { io } from "socket.io-client";
import { BellIcon } from "lucide-react";

// "Notifications" item for the navbar.
// The list opens when the mouse is over it (or when it has keyboard focus).
// New notifications arrive live through a WebSocket (Socket.IO),
// so the page never has to be refreshed.

function NotificationBell() {

    const [notifications, setNotifications] = useState([]);

    // true while the mouse is over the item
    const [open, setOpen] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {

        // 1. Load the notifications that already exist (normal API call)
        getNotifications();

        // 2. Open a live connection to the server.
        //    The server checks the token, the same one the API uses.
        const socket = io(API_URL, {
            auth: {
                token: token
            }
        });

        // 3. Whenever the server sends a "notification" event,
        //    put the new notification at the top of the list
        socket.on("notification", (notification) => {

            setNotifications((oldList) => [
                notification,
                ...oldList
            ]);

        });

        // 4. Close the connection when this component leaves the page
        return () => {
            socket.disconnect();
        };

    }, []);


    // ================= GET NOTIFICATIONS =================

    const getNotifications = async () => {

        try {

            const response = await api.get(
                "/notification/"
            );

            setNotifications(response.data.notifications || []);

        } catch (error) {

            showError(
                error.response?.data?.message ||
                "Failed to load notifications"
            );

        }

    };


    // ================= MARK AS READ =================

    const markAsRead = async (id) => {

        try {

            await api.put(
                `/notification/${id}/read`,
                {}
            );

            // Update only that one notification in the list
            setNotifications(
                notifications.map((notification) => {

                    if (notification._id === id) {
                        return {
                            ...notification,
                            isRead: true
                        };
                    }

                    return notification;

                })
            );

        } catch (error) {

            showError(
                error.response?.data?.message ||
                "Failed to mark notification as read"
            );

        }

    };


    // Number shown in the small badge
    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;


    return (
        <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={(e) => {
                // Close only when focus moves outside the whole component
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    setOpen(false);
                }
            }}
        >

            {/* ================= NAVBAR ITEM ================= */}

            <button
                type="button"
                aria-label={`Notifications, ${unreadCount} unread`}
                className="nav-link cursor-pointer"
            >

                <BellIcon size={18} />

                {unreadCount > 0 && (

                    <span className="ml-2 rounded-full bg-[#5a182b] px-2 py-0.5 text-xs text-[#f7efe5]">
                        {unreadCount}
                    </span>

                )}

            </button>


            {/* ================= LIST (ONLY WHILE HOVERING) ================= */}

            {open && (

                // pt-2 keeps the list touching the button,
                // so the mouse can move down into it without closing it
                <div className="absolute left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 top-full z-30 w-80 max-w-[90vw] pt-2">

                    <div className="max-h-96 overflow-y-auto border border-[#c9aa91] bg-[#f7efe5] text-left shadow-lg">

                        {notifications.length > 0 ? (

                            notifications.map((notification) => (

                                <div
                                    key={notification._id}
                                    className={`border-b border-[#d8c6b6] p-4 ${notification.isRead
                                            ? "bg-[#f7efe5]"
                                            : "bg-[#efe2d5]"
                                        }`}
                                >

                                    <p className="text-sm text-[#5a182b]">
                                        {notification.title}
                                    </p>

                                    <p className="mt-1 text-sm text-[#321d1d]">
                                        {notification.message}
                                    </p>

                                    <p className="mt-2 text-xs text-[#9a7b62]">
                                        {new Date(
                                            notification.createdAt
                                        ).toLocaleString()}
                                    </p>

                                    {!notification.isRead && (

                                        <button
                                            type="button"
                                            onClick={() =>
                                                markAsRead(
                                                    notification._id
                                                )
                                            }
                                            className="mt-2 text-xs text-[#5a182b] underline"
                                        >
                                            Mark as read
                                        </button>

                                    )}

                                </div>

                            ))

                        ) : (

                            <p className="p-4 text-sm text-[#6e5545]">
                                No notifications.
                            </p>

                        )}

                    </div>

                </div>

            )}

        </div>
    );

}

export default NotificationBell;
