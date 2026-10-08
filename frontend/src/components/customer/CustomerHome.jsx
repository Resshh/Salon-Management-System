import { Link } from "react-router-dom";
import CustomerNextAppointment from "./CustomerNextAppointment";
import CustomerMembership from "./CustomerMembership";

// The customer's home page: welcome text, next appointment, membership cards.

function CustomerHome() {

    return (
        <div>

            {/* ================= WELCOME ================= */}

            <section className="px-6 md:px-20 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* LEFT: welcome text */}

                <div>

                    <p className="text-xs tracking-[4px] text-[#9a7b62]">
                        WELCOME TO BEAUTÉ
                    </p>

                    <h2 className="mt-5 text-5xl md:text-7xl font-normal leading-none text-[#5a182b]">
                        Your Beauty,
                        <br />
                        <span className="text-[#9a7b62]">Your Style.</span>
                    </h2>

                    <p className="mt-6 text-base md:text-lg leading-7 text-[#6e5545]">
                        Discover services crafted to make you{" "}
                        <br className="hidden md:block" />
                        look and feel your best.
                    </p>

                    <Link
                        to="/customer/services"
                        className="inline-block mt-7 bg-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                    >
                        EXPLORE SERVICES
                    </Link>

                </div>


                {/* RIGHT: next appointment */}

                <CustomerNextAppointment />

            </section>


            {/* ================= MEMBERSHIP ================= */}

            <CustomerMembership />

        </div>
    );

}

export default CustomerHome;
