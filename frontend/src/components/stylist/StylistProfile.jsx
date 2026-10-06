import { useEffect, useState } from "react";
import axios from "axios";

function StylistProfile() {

    const [profile, setProfile] = useState(null);
    const [services, setServices] = useState([]);

    const [specialization, setSpecialization] = useState("");
    const [selectedServices, setSelectedServices] = useState([]);

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        getProfile();
        getServices();
    }, []);


    // ================= GET PROFILE =================

    const getProfile = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/stylist/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // The API sends { message, stylist }
            const stylist = response.data.stylist;

            setProfile(stylist);

            setSpecialization(
                stylist.specialization || ""
            );

            const serviceIds =
                stylist.services?.map(
                    (service) => service._id
                ) || [];

            setSelectedServices(serviceIds);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load profile"
            );

        } finally {

            setLoading(false);

        }

    };


    // ================= GET SERVICES =================

    const getServices = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/service/"
            );

            setServices(
                response.data.services || []
            );

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load services"
            );

        }

    };


    // ================= SELECT SERVICES =================

    const handleServiceChange = (serviceId) => {

        if (selectedServices.includes(serviceId)) {

            setSelectedServices(
                selectedServices.filter(
                    (id) => id !== serviceId
                )
            );

        } else {

            setSelectedServices([
                ...selectedServices,
                serviceId
            ]);

        }

    };


    // ================= UPDATE PROFILE =================

    const updateProfile = async (e) => {

        e.preventDefault();

        try {

            await axios.put(
                "http://localhost:5000/api/stylist/profile",
                {
                    specialization,
                    services: selectedServices
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            await getProfile();

            alert("Profile updated successfully.");

            setEditing(false);

            getProfile();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to update profile"
            );

        }

    };


    // ================= LOADING =================

    if (loading) {

        return (
            <section
                id="profile"
                className="px-6 md:px-20 py-16 md:py-20"
            >
                <p className="text-[#6e5545]">
                    Loading profile...
                </p>
            </section>
        );

    }


    // ================= PROFILE NOT CREATED =================

    if (!profile) {

        return (
            <section
                id="profile"
                className="px-6 md:px-20 py-16 md:py-20"
            >

                <p className="text-xs tracking-[4px] text-[#9a7b62]">
                    YOUR PROFILE
                </p>

                <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                    Stylist Profile
                </h2>

                <div className="mt-8 border border-[#c9aa91] bg-[#f7efe5] p-8">

                    <p className="text-[#6e5545]">
                        Your stylist profile has not been created yet.
                    </p>

                </div>

            </section>
        );

    }


    return (
        <section
            id="profile"
            className="bg-[#efe2d5] px-6 md:px-20 py-16 md:py-20"
        >

            {/* ================= HEADING ================= */}

            <p className="text-xs tracking-[4px] text-[#9a7b62]">
                YOUR PROFILE
            </p>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                    Stylist Profile
                </h2>

                <button
                    onClick={() => setEditing(!editing)}
                    className="bg-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                >
                    {editing ? "CANCEL" : "EDIT PROFILE"}
                </button>

            </div>


            {/* ================= PROFILE DETAILS ================= */}

            {!editing ? (

                <div className="mt-8 border border-[#c9aa91] bg-[#f7efe5] p-8">

                    <h3 className="text-3xl font-normal text-[#5a182b]">
                        {profile.user?.name}
                    </h3>

                    <p className="mt-3 text-[#9a7b62]">
                        {profile.specialization}
                    </p>


                    <div className="mt-6">

                        <p className="text-xs tracking-[2px] text-[#9a7b62]">
                            EMAIL
                        </p>

                        <p className="mt-1 text-[#6e5545]">
                            {profile.user?.email}
                        </p>

                    </div>


                    <div className="mt-5">

                        <p className="text-xs tracking-[2px] text-[#9a7b62]">
                            PHONE
                        </p>

                        <p className="mt-1 text-[#6e5545]">
                            {profile.user?.phone}
                        </p>

                    </div>


                    <div className="mt-6">

                        <p className="text-xs tracking-[2px] text-[#9a7b62]">
                            SERVICES
                        </p>

                        {profile.services?.length > 0 ? (

                            <div className="mt-2 space-y-1">

                                {profile.services.map(
                                    (service) => (

                                        <p
                                            key={service._id}
                                            className="text-[#6e5545]"
                                        >
                                            {service.name}
                                        </p>

                                    )
                                )}

                            </div>

                        ) : (

                            <p className="mt-2 text-[#6e5545]">
                                No services selected
                            </p>

                        )}

                    </div>

                </div>

            ) : (

                /* ================= EDIT FORM ================= */

                <form
                    onSubmit={updateProfile}
                    className="mt-8 border border-[#c9aa91] bg-[#f7efe5] p-8"
                >

                    {/* SPECIALIZATION */}

                    <div>

                        <label className="text-sm text-[#6e5545]">
                            Specialization
                        </label>

                        <input
                            type="text"
                            value={specialization}
                            onChange={(e) =>
                                setSpecialization(e.target.value)
                            }
                            className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                            placeholder="Enter your specialization"
                        />

                    </div>


                    {/* SERVICES */}

                    <div className="mt-6">

                        <label className="text-sm text-[#6e5545]">
                            Services
                        </label>

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">

                            {services.map((service) => (

                                <label
                                    key={service._id}
                                    className="flex items-center gap-3 border border-[#d8c6b6] bg-[#efe2d5] p-4 cursor-pointer"
                                >

                                    <input
                                        type="checkbox"
                                        checked={selectedServices.includes(
                                            service._id
                                        )}
                                        onChange={() =>
                                            handleServiceChange(
                                                service._id
                                            )
                                        }
                                    />

                                    <span className="text-[#6e5545]">
                                        {service.name}
                                    </span>

                                </label>

                            ))}

                        </div>

                    </div>


                    {/* SAVE */}

                    <button
                        type="submit"
                        className="mt-7 bg-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                    >
                        SAVE CHANGES
                    </button>

                </form>

            )}

        </section>
    );
}

export default StylistProfile;