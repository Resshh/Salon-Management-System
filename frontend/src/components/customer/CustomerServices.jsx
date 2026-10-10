import { useEffect, useState } from "react";
import api, { showError } from "../../api";
import { ClockIcon, SparklesIcon } from "lucide-react";
import SkeletonCards from "../Skeleton";

function CustomerServices() {

    const [services, setServices] = useState([]);

    // true until the first answer comes back from the server
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getServices();
    }, []);

    const getServices = async () => {
        try {
            const response = await api.get(
                "/service/"
            );

            setServices(response.data.services);

        } catch (error) {
            showError(
                error.response?.data?.message ||
                "Failed to load services"
            );
        } finally {

            setLoading(false);

        }
    };

    return (
        <section
            id="services"
            className="px-6 md:px-20 py-16 md:py-20"
        >

            {/* Heading */}

            <h2 className="text-4xl font-normal text-[#5a182b]">
                Our Services
            </h2>


            {/* Services */}

            <div className="mt-10 space-y-6">

                {loading ? (

                    <SkeletonCards className="" />

                ) : services.length > 0 ? (

                    services.map((service) => (

                        // One wide card per service (same layout as the Stylists page):
                        // name on the left, price and duration on the right
                        <div
                            key={service._id}
                            className="flex flex-col md:flex-row md:items-center gap-8 rounded-2xl border border-[#d8c6b6] bg-[#f7efe5] p-8"
                        >

                            {/* Left half: round icon + name + description */}

                            <div className="flex flex-1 items-center gap-6">

                                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-[#d8c6b6] text-[#5a182b]">
                                    <SparklesIcon size={44} strokeWidth={1.25} />
                                </div>

                                <div>

                                    <h3 className="text-3xl font-normal text-[#5a182b]">
                                        {service.name}
                                    </h3>

                                    <p className="mt-1 text-[#9a7b62]">
                                        {service.description}
                                    </p>

                                </div>

                            </div>


                            {/* Right half: price and duration.
                                The border is the dividing line: on top on a phone, on the left on a wide screen. */}

                            <div className="flex-1 border-t border-[#9a7b62] pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">

                                <p className="text-xs tracking-[2px] text-[#9a7b62]">
                                    PRICE
                                </p>

                                <div className="mt-3 flex flex-wrap items-center gap-4">

                                    <p className="text-3xl text-[#5a182b]">
                                        ₹{service.price}
                                    </p>

                                    <span className="inline-flex items-center gap-2 rounded-full bg-[#d8c6b6] px-4 py-2 text-sm text-[#5a182b]">
                                        <ClockIcon size={14} />
                                        {service.duration} minutes
                                    </span>

                                </div>

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