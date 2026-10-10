import { useEffect } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";

import StylistProfile from "./StylistProfile";
import StylistAppointments from "./StylistAppointments";
import StylistSchedule from "./StylistSchedule";
import StylistHistory from "./StylistHistory";
import StylistRatings from "./StylistRatings";
import NotificationBell from "../NotificationBell";
import { CalendarIcon, ClockIcon, HistoryIcon, LogOutIcon, StarIcon, UserIcon } from "lucide-react";
import { logout } from "../../api";

// The stylist area. The navbar stays the same on every page;
// only the part below it changes with the URL:
//   /stylist               -> Schedule (clock in / out and working time slots)
//   /stylist/appointments  -> Appointments   ...and so on

// The navbar links: where each one goes and what it says
const links = [
    { to: "/stylist", label: "Schedule", icon: ClockIcon },
    { to: "/stylist/appointments", label: "Appointments", icon: CalendarIcon },
    { to: "/stylist/history", label: "History", icon: HistoryIcon },
    { to: "/stylist/ratings", label: "Ratings", icon: StarIcon },
    { to: "/stylist/profile", label: "Profile", icon: UserIcon }
];

function StylistDashboard() {

    // The current URL. When it changes, start the new page from the top.
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);


    return (
        <div className="soft-theme min-h-screen bg-[#f7efe5] text-[#321d1d]">

            {/* ================= NAVBAR ================= */}

            <nav className="sticky-nav min-h-20 px-6 md:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-5 border-b border-[#d8c6b6]">

                <h1 className="text-3xl font-normal tracking-[5px] text-[#5a182b]">
                    BEAUTÉ
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-[#6e5545]">

                    {/* NavLink adds the class "active" to the link of the current page.
                        "end" means: only active on exactly this URL. */}

                    {links.map((link) => (

                        <NavLink
                            key={link.to}
                            to={link.to}
                            end
                            className="nav-link"
                        >
                            <link.icon size={16} />
                            {link.label}
                        </NavLink>

                    ))}

                    <NotificationBell />

                    <button
                        type="button"
                        onClick={logout}
                        className="nav-logout"
                    >
                        <LogOutIcon size={16} />
                        Logout
                    </button>

                </div>

            </nav>


            {/* ================= THE PAGE ================= */}

            <main>

                <Routes>

                    <Route index element={<StylistSchedule />} />
                    <Route path="appointments" element={<StylistAppointments />} />
                    <Route path="history" element={<StylistHistory />} />
                    <Route path="ratings" element={<StylistRatings />} />
                    <Route path="profile" element={<StylistProfile />} />

                    {/* Any other URL under /stylist shows the schedule page */}
                    <Route path="*" element={<StylistSchedule />} />

                </Routes>

            </main>

        </div>
    );
}

export default StylistDashboard;
