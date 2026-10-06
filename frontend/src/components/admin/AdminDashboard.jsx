import AdminStats from "./AdminStats";
import AdminStylists from "./AdminStylists";
import AdminServices from "./AdminServices";
import AdminCustomers from "./AdminCustomers";
import AdminAppointments from "./AdminAppointments";
import AdminFeedback from "./AdminFeedback";
import AdminComplaints from "./AdminComplaints";
import AdminSettings from "./AdminSettings";
import AdminCoupons from "./AdminCoupons";
import AdminNotify from "./AdminNotify";

function AdminDashboard() {

    return (
        <div className="min-h-screen bg-[#f7efe5] text-[#321d1d]">

            {/* ================= NAVBAR ================= */}

            <nav className="min-h-20 px-6 md:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-5 border-b border-[#d8c6b6]">

                <h1 className="text-3xl font-normal tracking-[5px] text-[#5a182b]">
                    BEAUTÉ
                </h1>

                <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-[#6e5545]">

                    <a
                        href="#overview"
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        Overview
                    </a>

                    <a
                        href="#stylists"
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        Stylists
                    </a>

                    <a
                        href="#services"
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        Services
                    </a>

                    <a
                        href="#customers"
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        Customers
                    </a>

                    <a
                        href="#appointments"
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        Appointments
                    </a>

                    <a
                        href="#feedback"
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        Feedback
                    </a>

                    <a
                        href="#complaints"
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        Complaints
                    </a>

                    <a
                        href="#settings"
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        Settings
                    </a>

                    <a
                        href="#coupons"
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        Coupons
                    </a>

                    <a
                        href="#notify"
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        Notify
                    </a>

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


            {/* ================= OVERVIEW ================= */}

            <AdminStats />


            {/* ================= STYLISTS ================= */}

            <AdminStylists />


            {/* ================= SERVICES ================= */}

            <AdminServices />


            {/* ================= CUSTOMERS ================= */}

            <AdminCustomers />


            {/* ================= APPOINTMENTS ================= */}

            <AdminAppointments />


            {/* ================= FEEDBACK ================= */}

            <AdminFeedback />


            {/* ================= COMPLAINTS ================= */}

            <AdminComplaints />


            {/* ================= SALON SETTINGS ================= */}

            <AdminSettings />


            {/* ================= COUPONS ================= */}

            <AdminCoupons />


            {/* ================= NOTIFY CUSTOMERS ================= */}

            <AdminNotify />

        </div>
    );
}

export default AdminDashboard;
