import { useEffect, useState } from "react";
import api, { showError } from "../../api";
import Message from "../Message";
import SkeletonCards from "../Skeleton";
import shrinkImage from "../../shrinkImage";
import { MailIcon, PhoneIcon } from "lucide-react";

function StylistProfile() {

    // Success / error message shown at the top right
    const [message, setMessage] = useState(null);

    const [profile, setProfile] = useState(null);
    const [services, setServices] = useState([]);

    const [specialization, setSpecialization] = useState("");
    const [selectedServices, setSelectedServices] = useState([]);

    // Newly chosen photo, as text ("" = no new photo chosen)
    const [photo, setPhoto] = useState("");

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProfile();
        getServices();
    }, []);


    // ================= GET PROFILE =================

    const getProfile = async () => {

        try {

            const response = await api.get(
                "/stylist/profile"
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

            showError(
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

            const response = await api.get(
                "/service/"
            );

            setServices(
                response.data.services || []
            );

        } catch (error) {

            showError(
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


    // ================= CHOOSE PHOTO =================

    // Runs when the stylist picks a file.
    // shrinkImage (in src/shrinkImage.js) makes it 400 x 500, the shape of
    // the stylist cards, and gives it back as text.
    const choosePhoto = (e) => {

        const file = e.target.files[0];

        if (!file) {
            return;
        }

        shrinkImage(file, 400, 500, setPhoto, () => {
            setMessage({
                type: "error",
                text: "Please choose an image file."
            });
        });

    };


    // ================= UPDATE PROFILE =================

    const updateProfile = async (e) => {

        e.preventDefault();

        try {

            const data = {
                specialization,
                services: selectedServices
            };

            // Send the photo only when a new one was chosen
            if (photo) {
                data.photo = photo;
            }

            await api.put(
                "/stylist/profile",
                data
            );

            await getProfile();

            setMessage({
                type: "success",
                text: "Profile updated successfully."
            });

            setEditing(false);
            setPhoto("");

            getProfile();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to update profile"
            });

        }

    };


    // ================= LOADING =================

    if (loading) {

        return (
            <section
                id="profile"
                className="px-6 md:px-20 py-16 md:py-20"
            >
                <SkeletonCards />
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

                <h2 className="text-4xl font-normal text-[#5a182b]">
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

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <h2 className="text-4xl font-normal text-[#5a182b]">
                    Stylist Profile
                </h2>

                <button
                    onClick={() => {
                        // Opening or cancelling the form forgets an unsaved photo
                        setPhoto("");
                        setEditing(!editing);
                    }}
                    className="bg-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                >
                    {editing ? "CANCEL" : "EDIT PROFILE"}
                </button>

            </div>


            {/* ================= PROFILE DETAILS ================= */}

            {!editing ? (

                // Same design as the stylist cards on the customer and admin pages,
                // turned sideways on a wide screen: big photo on the left, details on the right.
                // "max-w-3xl" stops the card from stretching across the whole page.
                <div className="group mt-8 flex max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#c9aa91] bg-[#f7efe5] md:flex-row">

                    {/* ---------- The photo ----------
                        "aspect-4/5" keeps the box 4 wide by 5 tall.
                        On a wide screen it is 320px wide (md:w-80) and does not shrink. */}

                    <div className="relative aspect-4/5 shrink-0 overflow-hidden bg-linear-to-br from-[#5a182b] to-[#9a7b62] md:w-80">

                        {/* The photo, or the first letter of the name on the coloured box */}

                        {profile.photo ? (

                            <img
                                src={profile.photo}
                                alt={profile.user?.name}
                                className="warm-photo h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
                            />

                        ) : (

                            <div className="flex h-full w-full items-center justify-center text-9xl text-[#f7efe5]/40">
                                {profile.user?.name?.charAt(0).toUpperCase()}
                            </div>

                        )}


                        {/* A small line of text in the top left corner of the photo.
                            The dark fade behind it keeps the white text easy to read. */}

                        <p className="absolute inset-x-0 top-0 bg-linear-to-b from-black/55 to-transparent px-5 pt-4 pb-10 text-sm text-white">
                            {profile.specialization}
                        </p>

                    </div>


                    {/* ---------- The details beside the photo ---------- */}

                    <div className="flex flex-1 flex-col justify-center px-8 py-8">

                        <h3 className="mb-4 text-4xl font-normal text-[#5a182b]">
                            {profile.user?.name}
                        </h3>

                        <p className="flex items-center gap-3 text-sm break-all text-[#321d1d]">
                            <MailIcon size={16} className="shrink-0 text-[#9a7b62]" />
                            {profile.user?.email}
                        </p>

                        <p className="mt-2 flex items-center gap-3 text-sm text-[#321d1d]">
                            <PhoneIcon size={16} className="shrink-0 text-[#9a7b62]" />
                            {profile.user?.phone}
                        </p>

                        <p className="mt-6 border-t border-[#d8c6b6] pt-6 text-xs tracking-[2px] text-[#9a7b62]">
                            SERVICES
                        </p>

                        {profile.services?.length > 0 ? (

                            <div className="mt-3 flex flex-wrap gap-2">

                                {profile.services.map((service) => (

                                    <span
                                        key={service._id}
                                        className="rounded-full border border-[#d8c6b6] bg-white/70 px-3 py-1 text-xs text-[#5a182b]"
                                    >
                                        {service.name}
                                    </span>

                                ))}

                            </div>

                        ) : (

                            <p className="mt-2 text-sm text-[#6e5545]">
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

                    {/* PHOTO */}

                    <div className="mb-6">

                        <label className="text-sm text-[#6e5545]">
                            Profile photo
                        </label>

                        <div className="mt-2 flex items-center gap-5">

                            {/* Preview: the new photo if one was chosen, else the saved one */}

                            {(photo || profile.photo) && (

                                <img
                                    src={photo || profile.photo}
                                    alt="Profile preview"
                                    className="warm-photo h-28 aspect-4/5 rounded-lg object-cover"
                                />

                            )}

                            <input
                                type="file"
                                accept="image/*"
                                onChange={choosePhoto}
                                className="text-sm text-[#6e5545]"
                            />

                        </div>

                    </div>


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

            <Message
                message={message}
                onClose={() => setMessage(null)}
            />

        </section>
    );
}

export default StylistProfile;