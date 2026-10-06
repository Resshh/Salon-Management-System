import StylistProfile from "./StylistProfile";
import StylistAppointments from "./StylistAppointments";
import StylistSchedule from "./StylistSchedule";
import StylistHistory from "./StylistHistory";
import StylistRatings from "./StylistRatings";
import StylistNotification from "./StylistNotifications";

function StylistDashboard() {

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
                        href="#profile"
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        Profile
                    </a>

                    <a
                        href="#schedule"
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        Schedule
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
                        href="#notifications"
                        className="cursor-pointer hover:text-[#5a182b]"
                    >
                        Notifications
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


            {/* ================= HERO ================= */}

            <section
                id="home"
                className="px-6 md:px-20 py-20 md:py-28"
            >

                <p className="text-xs tracking-[4px] text-[#9a7b62]">
                    BEAUTÉ — STYLIST PORTAL
                </p>

                <h2 className="mt-5 text-5xl md:text-7xl font-normal leading-none text-[#5a182b]">
                    Create Beauty,
                    <br />
                    Define Style.
                </h2>

                <p className="mt-6 text-base md:text-lg leading-7 text-[#6e5545]">
                    Manage your profile, schedule and
                    <br className="hidden md:block" />
                    appointments with ease.
                </p>

            </section>


            {/* ================= PROFILE ================= */}

            <StylistProfile />


            {/* ================= SCHEDULE ================= */}

            <StylistSchedule />


            {/* ================= APPOINTMENTS ================= */}

            <StylistAppointments />


            {/* ================= HISTORY ================= */}

            <StylistHistory />


            {/* ================= RATINGS ================= */}

            <StylistRatings />


            {/* ================= NOTIFICATIONS ================= */}

            <StylistNotification />

        </div>
    );
}

export default StylistDashboard;