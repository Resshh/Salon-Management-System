import { useEffect, useState } from "react";
import axios from "axios";
import Message from "../Message";

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


    // ================= CHOOSE PHOTO =================

    // Runs when the stylist picks a file.
    // A phone photo is several MB, far too big to save in the database,
    // so the browser first shrinks it to a 300 x 300 square.
    const choosePhoto = (e) => {

        const file = e.target.files[0];

        if (!file) {
            return;
        }

        const image = new Image();

        // Runs once the browser has finished reading the picture
        image.onload = () => {

            // A canvas is an invisible drawing board
            const canvas = document.createElement("canvas");

            canvas.width = 300;
            canvas.height = 300;

            // Cut the biggest square out of the middle of the picture
            const side = Math.min(image.width, image.height);
            const left = (image.width - side) / 2;
            const top = (image.height - side) / 2;

            // Draw that square onto the canvas, scaled down to 300 x 300
            canvas
                .getContext("2d")
                .drawImage(image, left, top, side, side, 0, 0, 300, 300);

            // Turn the drawing into text: "data:image/jpeg;base64,..."
            setPhoto(canvas.toDataURL("image/jpeg", 0.8));

            // Free the memory of the temporary address
            URL.revokeObjectURL(image.src);

        };

        // Runs when the file is not a picture
        image.onerror = () => {
            setMessage({
                type: "error",
                text: "Please choose an image file."
            });
        };

        // Give the file a temporary address so the browser can read it
        image.src = URL.createObjectURL(file);

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

            await axios.put(
                "http://localhost:5000/api/stylist/profile",
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
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

                <div className="mt-8 border border-[#c9aa91] bg-[#f7efe5] p-8">

                    {/* Round picture: the photo, or the first letter of the name */}

                    {profile.photo ? (

                        <img
                            src={profile.photo}
                            alt={profile.user?.name}
                            className="mb-5 h-28 w-28 rounded-full object-cover"
                        />

                    ) : (

                        <div className="mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-[#d8c6b6] text-5xl text-[#5a182b]">
                            {profile.user?.name?.charAt(0).toUpperCase()}
                        </div>

                    )}

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
                                    className="h-20 w-20 rounded-full object-cover"
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