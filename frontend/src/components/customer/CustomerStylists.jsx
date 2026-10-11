import { useEffect, useState } from "react";
import api, { showError } from "../../api";
import priyaPhoto from "../../assets/priya.png";
import SkeletonCards from "../Skeleton";
import { MailIcon, PhoneIcon } from "lucide-react";

// Spare photos, found by the stylist's name.
// Used only while a stylist has not uploaded a photo from their profile page.
// A stylist with no photo at all gets the first letter of their name instead.
const stylistPhotos = {
    Priya: priyaPhoto
};

function CustomerStylists() {

    const [stylists, setStylists] = useState([]);

    // true until the first answer comes back from the server
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getStylists();
    }, []);

    const getStylists = async () => {

        try {

            const response = await api.get(
                "/stylist/"
            );

            setStylists(response.data);

        } catch (error) {

            showError(
                error.response?.data?.message ||
                "Failed to load stylists"
            );

        } finally {

            setLoading(false);

        }

    };

    return (
        <section
            id="stylists"
            className="px-6 md:px-20 py-16 md:py-20"
        >

            {/* ================= HEADING ================= */}

            <h2 className="text-4xl font-normal text-[#5a182b]">
                Our Stylists
            </h2>


            {/* ================= STYLIST LIST ================= */}

            <div className="mt-10">

                {loading ? (

                    <SkeletonCards className="" />

                ) : stylists.length > 0 ? (

                    // A grid of cards: 1 in a row on a phone, 2 on a tablet, 3 on a wide screen
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

                        {stylists.map((stylist) => (

                            // One tall card per stylist.
                            // "overflow-hidden" cuts the coloured band to the card's round corners.
                            <div
                                key={stylist._id}
                                className="flex flex-col overflow-hidden rounded-2xl border border-[#d8c6b6] bg-[#f7efe5]"
                            >

                                {/* Coloured band across the top of the card */}

                                <div className="h-24 bg-linear-to-r from-[#5a182b] to-[#9a7b62]" />


                                {/* Everything under the band, centred.
                                    "-mt-14" pulls the picture up so it sits half on the band. */}

                                <div className="-mt-14 flex flex-1 flex-col items-center px-6 pb-7 text-center">

                                    {/* Round picture: the photo if we have one,
                                        otherwise the first letter of the name. */}

                                    {stylist.photo || stylistPhotos[stylist.user?.name] ? (

                                        <img
                                            src={stylist.photo || stylistPhotos[stylist.user?.name]}
                                            alt={stylist.user?.name}
                                            className="h-28 w-28 rounded-full object-cover shadow-md ring-4 ring-white"
                                        />

                                    ) : (

                                        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#d8c6b6] text-5xl text-[#5a182b] shadow-md ring-4 ring-white">
                                            {stylist.user?.name?.charAt(0).toUpperCase()}
                                        </div>

                                    )}


                                    {/* Stylist Name */}

                                    <h3 className="mt-4 text-2xl font-normal text-[#5a182b]">
                                        {stylist.user?.name}
                                    </h3>


                                    {/* Specialization, as a small pill */}

                                    <p className="mt-2 rounded-full bg-[#5a182b]/10 px-4 py-1 text-xs uppercase tracking-[1.5px] text-[#5a182b]">
                                        {stylist.specialization}
                                    </p>


                                    {/* Email */}

                                    <p className="mt-5 flex items-center gap-2 text-sm break-all text-[#321d1d]">
                                        <MailIcon size={15} className="shrink-0 text-[#9a7b62]" />
                                        {stylist.user?.email}
                                    </p>


                                    {/* Phone */}

                                    <p className="mt-2 flex items-center gap-2 text-sm text-[#321d1d]">
                                        <PhoneIcon size={15} className="shrink-0 text-[#9a7b62]" />
                                        {stylist.user?.phone}
                                    </p>


                                    {/* Services, under a thin dividing line */}

                                    <div className="mt-6 w-full border-t border-[#d8c6b6] pt-5">

                                        <p className="text-xs tracking-[2px] text-[#9a7b62]">
                                            SERVICES
                                        </p>

                                        {stylist.services?.length > 0 ? (

                                            <div className="mt-3 flex flex-wrap justify-center gap-2">

                                                {stylist.services.map((service) => (

                                                    <span
                                                        key={service._id}
                                                        className="rounded-full border border-[#d8c6b6] bg-white/70 px-3 py-1 text-xs text-[#5a182b]"
                                                    >
                                                        {service.name}
                                                    </span>

                                                ))}

                                            </div>

                                        ) : (

                                            <p className="mt-3 text-sm text-[#6e5545]">
                                                No services listed
                                            </p>

                                        )}

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

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