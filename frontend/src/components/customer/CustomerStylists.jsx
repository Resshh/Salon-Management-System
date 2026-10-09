import { useEffect, useState } from "react";
import axios from "axios";
import priyaPhoto from "../../assets/priya.png";

// Spare photos, found by the stylist's name.
// Used only while a stylist has not uploaded a photo from their profile page.
// A stylist with no photo at all gets the first letter of their name instead.
const stylistPhotos = {
    Priya: priyaPhoto
};

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

            <h2 className="text-4xl font-normal text-[#5a182b]">
                Our Stylists
            </h2>


            {/* ================= STYLIST LIST ================= */}

            <div className="mt-10 space-y-6">

                {stylists.length > 0 ? (

                    stylists.map((stylist) => (

                        // One wide card per stylist: details on the left, services on the right
                        <div
                            key={stylist._id}
                            className="flex flex-col md:flex-row md:items-center gap-8 rounded-2xl border border-[#d8c6b6] bg-[#f7efe5] p-8"
                        >

                            {/* Left half: picture + details */}

                            <div className="flex flex-1 items-center gap-6">

                                {/* Round picture: the photo if we have one,
                                    otherwise the first letter of the name. */}

                                {stylist.photo || stylistPhotos[stylist.user?.name] ? (

                                    <img
                                        src={stylist.photo || stylistPhotos[stylist.user?.name]}
                                        alt={stylist.user?.name}
                                        className="h-28 w-28 shrink-0 rounded-full object-cover"
                                    />

                                ) : (

                                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-[#d8c6b6] text-5xl text-[#5a182b]">
                                        {stylist.user?.name?.charAt(0).toUpperCase()}
                                    </div>

                                )}

                                <div>

                                    {/* Stylist Name */}

                                    <h3 className="text-3xl font-normal text-[#5a182b]">
                                        {stylist.user?.name}
                                    </h3>


                                    {/* Specialization */}

                                    <p className="mt-1 text-[#9a7b62]">
                                        {stylist.specialization}
                                    </p>


                                    {/* Email */}

                                    <p className="mt-4 text-sm text-[#321d1d]">
                                        <span className="mr-3 text-[#5a182b]">✉</span>
                                        {stylist.user?.email}
                                    </p>


                                    {/* Phone */}

                                    <p className="mt-2 text-sm text-[#321d1d]">
                                        <span className="mr-3 text-[#5a182b]">☎</span>
                                        {stylist.user?.phone}
                                    </p>

                                </div>

                            </div>


                            {/* Right half: services.
                                The border is the dividing line: on top on a phone, on the left on a wide screen. */}

                            <div className="flex-1 border-t border-[#9a7b62] pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">

                                <p className="text-xs tracking-[2px] text-[#9a7b62]">
                                    SERVICES
                                </p>

                                {stylist.services?.length > 0 ? (

                                    <div className="mt-3 flex flex-wrap gap-3">

                                        {stylist.services.map((service) => (

                                            <span
                                                key={service._id}
                                                className="rounded-full bg-[#d8c6b6] px-4 py-2 text-sm text-[#5a182b]"
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