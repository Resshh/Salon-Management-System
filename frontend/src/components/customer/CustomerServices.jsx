import { useEffect, useState } from "react";
import api, { showError } from "../../api";
import { SparklesIcon } from "lucide-react";
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

            <div className="mt-10">

                {loading ? (

                    <SkeletonCards className="" />

                ) : services.length > 0 ? (

                    // A grid of cards (same design as the Stylists page):
                    // 1 in a row on a phone, 2 on a tablet, 3 on a wide screen
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

                        {services.map((service) => (

                            // One card per service: a big picture on top, details under it.
                            // "group" lets the picture react when the mouse is anywhere on the card.
                            <div
                                key={service._id}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-[#d8c6b6] bg-[#f7efe5]"
                            >

                                {/* ---------- The picture ----------
                                    "aspect-4/3" keeps the box 4 wide by 3 tall on every screen. */}

                                <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-[#5a182b] to-[#9a7b62]">

                                    {/* The picture if the admin added one,
                                        otherwise a big icon on the coloured box. */}

                                    {service.image ? (

                                        <img
                                            src={service.image}
                                            alt={service.name}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
                                        />

                                    ) : (

                                        <div className="flex h-full w-full items-center justify-center text-[#f7efe5]/40">
                                            <SparklesIcon size={96} strokeWidth={1} />
                                        </div>

                                    )}


                                    {/* A small line of text in the top left corner of the picture.
                                        The dark fade behind it keeps the white text easy to read. */}

                                    <p className="absolute inset-x-0 top-0 bg-linear-to-b from-black/55 to-transparent px-5 pt-4 pb-10 text-sm text-white">
                                        {service.duration} minutes
                                    </p>

                                </div>


                                {/* ---------- The details under the picture ---------- */}

                                <div className="flex flex-1 flex-col px-6 py-6">

                                    <h3 className="mb-3 text-3xl font-normal text-[#5a182b]">
                                        {service.name}
                                    </h3>

                                    {/* "flex-1" lets the description take the free space,
                                        so the price sits at the bottom of every card. */}

                                    <p className="flex-1 text-[#6e5545]">
                                        {service.description}
                                    </p>


                                    {/* Price, above a thin dividing line
                                        (the duration is already shown on the picture) */}

                                    <p className="mt-5 border-t border-[#d8c6b6] pt-5 text-3xl text-[#5a182b]">
                                        ₹{service.price}
                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>

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