import { useEffect, useState } from "react";
import api, { showError } from "../../api";
import Message from "../Message";
import ConfirmBox from "../ConfirmBox";
import shrinkImage from "../../shrinkImage";
import { ClockIcon, SparklesIcon } from "lucide-react";

function AdminServices() {

    // Success / error message shown at the top right
    const [message, setMessage] = useState(null);

    // Yes / no question box (null = hidden)
    const [confirmBox, setConfirmBox] = useState(null);

    const [services, setServices] = useState([]);

    // Service form. editingId is empty when adding a new service.
    const [editingId, setEditingId] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState("");
    const [price, setPrice] = useState("");

    // Newly chosen picture, as text ("" = no new picture chosen)
    const [image, setImage] = useState("");

    useEffect(() => {
        getServices();
    }, []);


    // ================= GET SERVICES =================

    const getServices = async () => {

        try {

            const response = await api.get(
                "/admin/services"
            );

            setServices(response.data.services || []);

        } catch (error) {

            showError(
                error.response?.data?.message ||
                "Failed to load services"
            );

        }

    };


    // ================= CLEAR SERVICE FORM =================

    const clearForm = () => {

        setEditingId("");
        setName("");
        setDescription("");
        setDuration("");
        setPrice("");
        setImage("");

    };


    // ================= CHOOSE PICTURE =================

    // Runs when the admin picks a file.
    // shrinkImage (in src/shrinkImage.js) makes it 480 x 360 and gives it back as text.
    const chooseImage = (e) => {

        const file = e.target.files[0];

        if (!file) {
            return;
        }

        shrinkImage(file, 480, 360, setImage, () => {
            setMessage({
                type: "error",
                text: "Please choose an image file."
            });
        });

    };


    // ================= ADD OR UPDATE SERVICE =================

    const saveService = async (e) => {

        e.preventDefault();

        if (!name || !description || !duration || !price) {
            setMessage({
                type: "error",
                text: "Please fill all service details."
            });
            return;
        }

        const serviceData = {
            name: name,
            description: description,
            duration: Number(duration),
            price: Number(price)
        };

        // Send the picture only when a new one was chosen
        if (image) {
            serviceData.image = image;
        }

        try {

            if (editingId) {

                await api.put(
                    `/service/${editingId}`,
                    serviceData
                );

            } else {

                await api.post(
                    "/service/",
                    serviceData
                );

            }

            clearForm();

            // Empties the "choose file" field. React does not control that one,
            // so the form itself has to clear it.
            e.target.reset();

            getServices();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to save service"
            });

        }

    };


    // ================= START EDITING =================

    const editService = (service) => {

        // Fill the form with the service that was clicked
        setEditingId(service._id);
        setName(service.name);
        setDescription(service.description);
        setDuration(service.duration);
        setPrice(service.price);

    };


    // ================= SHOW / HIDE SERVICE =================

    const toggleAvailability = async (service) => {

        try {

            await api.put(
                `/service/${service._id}`,
                {
                    availability: !service.availability
                }
            );

            getServices();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to update service"
            });

        }

    };


    // ================= DELETE SERVICE =================

    const deleteService = (id) => {

        // Ask first. The real work happens only after the user clicks YES.
        setConfirmBox({
            text: "Are you sure you want to delete this service?",
            onYes: () => deleteServiceConfirmed(id)
        });

    };


    const deleteServiceConfirmed = async (id) => {

        try {

            await api.delete(
                `/service/${id}`
            );

            getServices();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to delete service"
            });

        }

    };


    const inputClass =
        "mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none";


    return (
        <section
            id="services"
            className="px-6 md:px-20 py-16 md:py-20"
        >

            {/* ================= HEADING ================= */}

            <h2 className="text-4xl font-normal text-[#5a182b]">
                Services
            </h2>


            {/* ================= SERVICE FORM ================= */}

            <form
                onSubmit={saveService}
                className="mt-8 border border-[#c9aa91] bg-[#efe2d5] p-8"
            >

                <h3 className="text-2xl text-[#5a182b]">
                    {editingId ? "Edit Service" : "Add Service"}
                </h3>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">

                    <div>
                        <label className="text-sm text-[#6e5545]">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="text-sm text-[#6e5545]">
                            Duration (minutes)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="text-sm text-[#6e5545]">
                            Price (₹)
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                </div>

                <div className="mt-5">
                    <label className="text-sm text-[#6e5545]">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="3"
                        className={inputClass}
                    />
                </div>

                <div className="mt-5">

                    <label className="text-sm text-[#6e5545]">
                        Picture (optional)
                    </label>

                    <div className="mt-2 flex flex-wrap items-center gap-5">

                        {/* Preview of the newly chosen picture */}

                        {image && (

                            <img
                                src={image}
                                alt="Service preview"
                                className="h-24 aspect-4/3 rounded-lg object-cover"
                            />

                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={chooseImage}
                            className="text-sm text-[#6e5545]"
                        />

                    </div>

                    {editingId && (

                        <p className="mt-2 text-xs text-[#8b6d57]">
                            Leave this empty to keep the current picture.
                        </p>

                    )}

                </div>

                <div className="mt-6 flex gap-3">

                    <button
                        type="submit"
                        className="bg-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                    >
                        {editingId ? "UPDATE SERVICE" : "ADD SERVICE"}
                    </button>

                    {/* type="reset" also empties the "choose file" field */}

                    {editingId && (

                        <button
                            type="reset"
                            onClick={clearForm}
                            className="border border-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                        >
                            CANCEL
                        </button>

                    )}

                </div>

            </form>


            {/* ================= SERVICE LIST ================= */}

            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

                {services.length > 0 ? (

                    services.map((service) => (

                        // One card per service (same design as the customer Services page):
                        // a big picture on top, details and buttons under it.
                        <div
                            key={service._id}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-[#d8c6b6] bg-[#efe2d5]"
                        >

                            {/* ---------- The picture ---------- */}

                            <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-[#5a182b] to-[#9a7b62]">

                                {/* The picture if there is one, otherwise a big icon */}

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
                                    {service.availability ? "Available" : "Hidden"}
                                </p>

                            </div>


                            {/* ---------- The details under the picture ---------- */}

                            <div className="flex flex-1 flex-col px-6 py-6">

                                <h3 className="mb-3 text-3xl font-normal text-[#5a182b]">
                                    {service.name}
                                </h3>

                                <p className="flex-1 text-[#6e5545]">
                                    {service.description}
                                </p>

                                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#d8c6b6] pt-5">

                                    <p className="text-3xl text-[#5a182b]">
                                        ₹{service.price}
                                    </p>

                                    <span className="inline-flex items-center gap-2 rounded-full border border-[#d8c6b6] bg-white/70 px-3 py-1 text-sm text-[#5a182b]">
                                        <ClockIcon size={14} />
                                        {service.duration} minutes
                                    </span>

                                </div>

                                <div className="mt-5 flex flex-wrap gap-3">

                                    <button
                                        onClick={() => editService(service)}
                                        className="border border-[#5a182b] px-4 py-2 text-sm text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                                    >
                                        EDIT
                                    </button>

                                    <button
                                        onClick={() => toggleAvailability(service)}
                                        className="border border-[#5a182b] px-4 py-2 text-sm text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                                    >
                                        {service.availability ? "HIDE" : "SHOW"}
                                    </button>

                                    <button
                                        onClick={() => deleteService(service._id)}
                                        className="border border-[#5a182b] px-4 py-2 text-sm text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                                    >
                                        DELETE
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))

                ) : (

                    <p className="text-[#6e5545]">
                        No services yet.
                    </p>

                )}

            </div>

            <Message
                message={message}
                onClose={() => setMessage(null)}
            />

            <ConfirmBox
                confirmBox={confirmBox}
                onClose={() => setConfirmBox(null)}
            />

        </section>
    );

}

export default AdminServices;
