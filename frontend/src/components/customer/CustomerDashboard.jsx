import { useEffect, useState } from "react";
import axios from "axios";

function CustomerDashboard() {

    const [services, setServices] = useState([]);
    const [stylists, setStylists] = useState([]);

    useEffect(() => {
        getServices();
        getStylists();
    }, []);

    const getServices = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/service/"
            );

            setServices(response.data.services);
        } catch (error) {
            console.log(
                error.response?.data?.message ||
                "Failed to load services"
            );
        }
    };

    const getStylists = async () => {
    try {
        const response = await axios.get(
            "http://localhost:5000/api/stylist/profile"
        );

        setStylists(response.data);

    } catch (error) {
        console.log(
            error.response?.data?.message ||
            "Failed to load stylists"
        );
    }
};

    return (
        <div className="min-h-screen bg-[#f7efe5] text-[#321d1d]">

            {/* Navbar */}
            <nav className="min-h-20 px-6 md:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-5 border-b border-[#d8c6b6]">

                <h1 className="text-3xl font-normal tracking-[5px] text-[#5a182b]">
                    BEAUTÉ
                </h1>

                <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-[#6e5545]">

                    <span className="cursor-pointer hover:text-[#5a182b]">
                        Home
                    </span>

                    <span className="cursor-pointer hover:text-[#5a182b]">
                        Services
                    </span>

                    <span className="cursor-pointer hover:text-[#5a182b]">
                        Stylists
                    </span>

                    <span className="cursor-pointer hover:text-[#5a182b]">
                        Appointments
                    </span>

                    <span className="cursor-pointer hover:text-[#5a182b]">
                        Notifications
                    </span>

                    <span className="cursor-pointer hover:text-[#5a182b]">
                        Logout
                    </span>

                </div>

            </nav>


            {/* Hero Section */}
            <section className="px-6 md:px-20 py-20 md:py-28">

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

                <button className="mt-7 bg-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]">
                    EXPLORE SERVICES
                </button>

            </section>


            {/* Services Section */}
            <section className="bg-[#efe2d5] px-6 md:px-20 py-16 md:py-20">

                <p className="text-xs tracking-[4px] text-[#9a7b62]">
                    WHAT WE OFFER
                </p>

                <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                    Our Services
                </h2>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">

                    {services.map((service) => (

                        <div
                            key={service._id}
                            className="border border-[#d8c6b6] bg-[#f7efe5] p-8"
                        >

                            <h3 className="text-2xl font-normal text-[#5a182b]">
                                {service.name}
                            </h3>

                            <p className="mt-4 text-[#6e5545]">
                                {service.description}
                            </p>

                            <p className="mt-4 text-[#5a182b]">
                                ₹{service.price}
                            </p>

                            <p className="mt-2 text-sm text-[#8b6d57]">
                                {service.duration} minutes
                            </p>

                        </div>

                    ))}

                </div>

            </section>


            {/* Appointment Section */}
            <section className="px-6 md:px-20 py-16 md:py-20">

                <p className="text-xs tracking-[4px] text-[#9a7b62]">
                    YOUR APPOINTMENT
                </p>

                <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                    Upcoming Appointment
                </h2>

                <div className="mt-8 border border-[#c9aa91] bg-[#f7efe5] p-8">

                    <p className="text-[#6e5545]">
                        No upcoming appointments
                    </p>

                    <button className="mt-5 bg-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]">
                        BOOK APPOINTMENT
                    </button>

                </div>

            </section>

        </div>
    );
}

export default CustomerDashboard;