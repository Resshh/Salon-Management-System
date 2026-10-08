import { useEffect, useState } from "react";
import axios from "axios";

function CustomerServices() {

    const [services, setServices] = useState([]);

    useEffect(() => {
        getServices();
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

    return (
        <section
            id="services"
            className="bg-[#efe2d5] px-6 md:px-20 py-16 md:py-20"
        >

            {/* Heading */}

            <p className="text-xs tracking-[4px] text-[#9a7b62]">
                WHAT WE OFFER
            </p>

            <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                Our Services
            </h2>


            {/* Services */}

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">

                {services.length > 0 ? (

                    services.map((service) => (

                        <div
                            key={service._id}
                            className="dark-card border border-[#d8c6b6] bg-[#f7efe5] p-8"
                        >

                            <h3 className="text-2xl font-normal text-[#5a182b]">
                                {service.name}
                            </h3>

                            <p className="mt-4 text-[#6e5545]">
                                {service.description}
                            </p>

                            {/* price on the left, duration on the right */}

                            <div className="mt-6 flex items-baseline justify-between gap-4">

                                <p className="text-3xl text-[#5a182b]">
                                    ₹{service.price}
                                </p>

                                <p className="text-sm text-[#8b6d57]">
                                    {service.duration} minutes
                                </p>

                            </div>

                        </div>

                    ))

                ) : (

                    <p className="text-[#6e5545]">
                        No services available.
                    </p>

                )}

            </div>

        </section>
    );
}

export default CustomerServices;