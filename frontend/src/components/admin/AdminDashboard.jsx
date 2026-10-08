import { useEffect } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";

import AdminStats from "./AdminStats";
import AdminStylists from "./AdminStylists";
import AdminServices from "./AdminServices";
import AdminCustomers from "./AdminCustomers";
import AdminAppointments from "./AdminAppointments";
import AdminFeedbackComplaints from "./AdminFeedbackComplaints";
import AdminSettings from "./AdminSettings";
import AdminCoupons from "./AdminCoupons";
import AdminNotify from "./AdminNotify";

// The admin area. The navbar stays the same on every page;
// only the part below it changes with the URL:
//   /admin            -> Overview
//   /admin/stylists   -> Stylists   ...and so on

// The navbar links: where each one goes and what it says
const links = [
    { to: "/admin", label: "Overview" },
    { to: "/admin/stylists", label: "Stylists" },
    { to: "/admin/services", label: "Services" },
    { to: "/admin/customers", label: "Customers" },
    { to: "/admin/appointments", label: "Appointments" },
    { to: "/admin/feedback", label: "Feedback & Complaints" },
    { to: "/admin/settings", label: "Settings" },
    { to: "/admin/coupons", label: "Coupons" },
    { to: "/admin/notify", label: "Notify" }
];

function AdminDashboard() {

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

                <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-[#6e5545]">

                    {/* NavLink adds the class "active" to the link of the current page.
                        "end" means: only active on exactly this URL. */}

                    {links.map((link) => (

                        <NavLink
                            key={link.to}
                            to={link.to}
                            end
                            className="nav-link"
                        >
                            {link.label}
                        </NavLink>

                    ))}

                    <span
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("role");
                            window.location.href = "/login";
                        }}
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        Logout
                    </span>

                </div>

            </nav>


            {/* ================= THE PAGE ================= */}

            <main>

                <Routes>

                    <Route index element={<AdminStats />} />
                    <Route path="stylists" element={<AdminStylists />} />
                    <Route path="services" element={<AdminServices />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="appointments" element={<AdminAppointments />} />
                    <Route path="feedback" element={<AdminFeedbackComplaints />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="notify" element={<AdminNotify />} />

                    {/* Any other URL under /admin shows the overview */}
                    <Route path="*" element={<AdminStats />} />

                </Routes>

            </main>

        </div>
    );
}

export default AdminDashboard;
