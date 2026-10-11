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

                            // One card per stylist: a big photo on top, details under it.
                            // "group" lets the photo react when the mouse is anywhere on the card.
                            // "overflow-hidden" cuts the photo to the card's round corners.
                            <div
                                key={stylist._id}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-[#d8c6b6] bg-[#f7efe5]"
                            >

                                {/* ---------- The photo ----------
                                    "aspect-4/5" keeps the box 4 wide by 5 tall on every screen,
                                    so the page does not jump when the photo arrives. */}

                                <div className="relative aspect-4/5 overflow-hidden bg-linear-to-br from-[#5a182b] to-[#9a7b62]">

                                    {/* The photo if we have one,
                                        otherwise the first letter of the name on the coloured box. */}

                                    {stylist.photo || stylistPhotos[stylist.user?.name] ? (

                                        <img
                                            src={stylist.photo || stylistPhotos[stylist.user?.name]}
                                            alt={stylist.user?.name}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
                                        />

                                    ) : (

                                        <div className="flex h-full w-full items-center justify-center text-9xl text-[#f7efe5]/40">
                                            {stylist.user?.name?.charAt(0).toUpperCase()}
                                        </div>

                                    )}


                                    {/* A small line of text in the top left corner of the photo.
                                        The dark fade behind it keeps the white text easy to read. */}

                                    <p className="absolute inset-x-0 top-0 bg-linear-to-b from-black/55 to-transparent px-5 pt-4 pb-10 text-sm text-white">
                                        {stylist.specialization}
                                    </p>

                                </div>


                                {/* ---------- The details under the photo ---------- */}

                                <div className="flex flex-1 flex-col px-6 py-6">

                                    <h3 className="mb-3 text-3xl font-normal text-[#5a182b]">
                                        {stylist.user?.name}
                                    </h3>

                                    {/* Email */}

                                    <p className="flex items-center gap-3 text-sm break-all text-[#321d1d]">
                                        <MailIcon size={16} className="shrink-0 text-[#9a7b62]" />
                                        {stylist.user?.email}
                                    </p>


                                    {/* Phone */}

                                    <p className="mt-2 flex items-center gap-3 text-sm text-[#321d1d]">
                                        <PhoneIcon size={16} className="shrink-0 text-[#9a7b62]" />
                                        {stylist.user?.phone}
                                    </p>


                                    {/* Services, under a thin dividing line */}

                                    <div className="mt-5 border-t border-[#d8c6b6] pt-5">

                                        <p className="text-xs tracking-[2px] text-[#9a7b62]">
                                            SERVICES
                                        </p>

                                        {stylist.services?.length > 0 ? (

                                            <div className="mt-3 flex flex-wrap gap-2">

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