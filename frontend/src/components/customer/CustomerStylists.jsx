import { useEffect, useState } from "react";
import axios from "axios";

function CustomerStylists() {

    const [stylists, setStylists] = useState([]);

    useEffect(() => {
        getStylists();
    }, []);

    const getStylists = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:5000/api/stylist/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
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
        <section
            id="stylists"
            className="px-6 md:px-20 py-16 md:py-20"
        >

            {/* ================= HEADING ================= */}

            <p className="text-xs tracking-[4px] text-[#9a7b62]">
                OUR TEAM
            </p>

            <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                Our Stylists
            </h2>


            {/* ================= STYLIST LIST ================= */}

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">

                {stylists.length > 0 ? (

                    stylists.map((stylist) => (

                        <div
                            key={stylist._id}
                            className="border border-[#d8c6b6] bg-[#f7efe5] p-8"
                        >

                            {/* Stylist Name */}

                            <h3 className="text-2xl font-normal text-[#5a182b]">
                                {stylist.user?.name}
                            </h3>


                            {/* Specialization */}

                            <p className="mt-3 text-[#9a7b62]">
                                {stylist.specialization}
                            </p>


                            {/* Email */}

                            <p className="mt-4 text-sm text-[#6e5545]">
                                {stylist.user?.email}
                            </p>


                            {/* Phone */}

                            <p className="mt-1 text-sm text-[#6e5545]">
                                {stylist.user?.phone}
                            </p>


                            {/* Services */}

                            <div className="mt-5">

                                <p className="text-xs tracking-[2px] text-[#9a7b62]">
                                    SERVICES
                                </p>

                                {stylist.services?.length > 0 ? (

                                    <div className="mt-2 space-y-1">

                                        {stylist.services.map((service) => (

                                            <p
                                                key={service._id}
                                                className="text-sm text-[#6e5545]"
                                            >
                                                {service.name}
                                            </p>

                                        ))}

                                    </div>

                                ) : (

                                    <p className="mt-2 text-sm text-[#6e5545]">
                                        No services listed
                                    </p>

                                )}

                            </div>

                        </div>

                    ))

                ) : (

                    <p className="text-[#6e5545]">
                        No stylists available.
                    </p>

                )}

            </div>

        </section>
    );
}

export default CustomerStylists;