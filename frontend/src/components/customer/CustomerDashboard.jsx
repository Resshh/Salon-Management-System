import CustomerServices from "./CustomerServices";
import CustomerStylists from "./CustomerStylists";
import CustomerAppointments from "./CustomerAppointments";
import NotificationBell from "../NotificationBell";
import CustomerHistory from "./CustomerHistory";
import CustomerFeedback from "./CustomerFeedback";
import CustomerComplaints from "./CustomerComplaints";
import CustomerMembership from "./CustomerMembership";

function CustomerDashboard() {

    return (
        <div className="min-h-screen bg-[#f7efe5] text-[#321d1d]">

            {/* ================= NAVBAR ================= */}

            <nav className="min-h-20 px-6 md:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-5 border-b border-[#d8c6b6]">

                <h1 className="text-3xl font-normal tracking-[5px] text-[#5a182b]">
                    BEAUTÉ
                </h1>

                <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-[#6e5545]">

                    <a
                        href="#home"
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        Home
                    </a>

                    <a
                        href="#services"
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        Services
                    </a>

                    <a
                        href="#stylists"
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        Stylists
                    </a>

                    <a
                        href="#appointments"
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        Appointments
                    </a>

                    <a
                        href="#history"
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        History
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

                    <NotificationBell />

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


            {/* ================= HERO ================= */}

            <section
                id="home"
                className="px-6 md:px-20 py-20 md:py-28"
            >

                <p className="text-xs tracking-[4px] text-[#9a7b62]">
                    WELCOME TO BEAUTÉ
                </p>

                <h2 className="mt-5 text-5xl md:text-7xl font-normal leading-none text-[#5a182b]">
                    Your Beauty,
                    <br />
                    Your Style.
                </h2>

                <p className="mt-6 text-base md:text-lg leading-7 text-[#6e5545]">
                    Discover services crafted to make you
                    <br className="hidden md:block" />
                    look and feel your best.
                </p>

                <a
                    href="#services"
                    className="inline-block mt-7 bg-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                >
                    EXPLORE SERVICES
                </a>

            </section>


            {/* ================= MEMBERSHIP ================= */}

            <CustomerMembership />


            {/* ================= SERVICES ================= */}

            <CustomerServices />


            {/* ================= STYLISTS ================= */}

            <CustomerStylists />


            {/* ================= APPOINTMENTS ================= */}

            <CustomerAppointments />
            
            {/* ================= HISTORY ================= */}

            <CustomerHistory />


            {/* ================= FEEDBACK ================= */}

            <CustomerFeedback />


            {/* ================= COMPLAINTS ================= */}

            <CustomerComplaints />

        </div>
    );
}

export default CustomerDashboard;