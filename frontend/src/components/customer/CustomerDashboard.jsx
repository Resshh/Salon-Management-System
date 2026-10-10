import { useEffect } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";

import CustomerHome from "./CustomerHome";
import CustomerServices from "./CustomerServices";
import CustomerStylists from "./CustomerStylists";
import CustomerAppointments from "./CustomerAppointments";
import CustomerHistory from "./CustomerHistory";
import CustomerFeedbackComplaints from "./CustomerFeedbackComplaints";
import NotificationBell from "../NotificationBell";
import { CalendarIcon, HistoryIcon, HomeIcon, LogOutIcon, MessageSquareIcon, ScissorsIcon, SparklesIcon } from "lucide-react";
import { logout } from "../../api";

// The customer area. The navbar and footer stay the same on every page;
// only the part in the middle changes with the URL:
//   /customer               -> Home
//   /customer/services      -> Services
//   /customer/appointments  -> Appointments   ...and so on

// The navbar links: where each one goes and what it says
const links = [
    { to: "/customer", label: "Home", icon: HomeIcon },
    { to: "/customer/services", label: "Services", icon: SparklesIcon },
    { to: "/customer/stylists", label: "Stylists", icon: ScissorsIcon },
    { to: "/customer/appointments", label: "Appointments", icon: CalendarIcon },
    { to: "/customer/history", label: "History", icon: HistoryIcon },
    { to: "/customer/feedback", label: "Feedback & Complaints", icon: MessageSquareIcon }
];

function CustomerDashboard() {

    // The current URL. When it changes, start the new page from the top.
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);


    return (
        <div className="soft-theme dash min-h-screen flex flex-col bg-[#f7efe5] text-[#321d1d]">

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

            <main className="flex-1">

                <Routes>

                    <Route index element={<CustomerHome />} />
                    <Route path="services" element={<CustomerServices />} />
                    <Route path="stylists" element={<CustomerStylists />} />
                    <Route path="appointments" element={<CustomerAppointments />} />
                    <Route path="history" element={<CustomerHistory />} />
                    <Route path="feedback" element={<CustomerFeedbackComplaints />} />

                    {/* Any other URL under /customer shows the home page */}
                    <Route path="*" element={<CustomerHome />} />

                </Routes>

            </main>


            {/* ================= FOOTER ================= */}

            <footer className="dash-footer">

                <div>
                    <p className="dash-footer-brand">
                        BEAUTÉ
                    </p>
                    <p className="dash-footer-tagline">
                        Beauty. Style. You.
                    </p>
                </div>

                <p className="dash-footer-note">
                    © 2026 BEAUTÉ Salon. All rights reserved.
                </p>

            </footer>

        </div>
    );
}

export default CustomerDashboard;
