import { useEffect, useState } from "react";
import axios from "axios";
import Message from "../Message";
import ConfirmBox from "../ConfirmBox";

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

    const token = localStorage.getItem("token");

    useEffect(() => {
        getServices();
    }, []);


    // ================= GET SERVICES =================

    const getServices = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/admin/services",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setServices(response.data.services || []);

        } catch (error) {

            console.log(
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

        try {

            if (editingId) {

                await axios.put(
                    `http://localhost:5000/api/service/${editingId}`,
                    serviceData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

            } else {

                await axios.post(
                    "http://localhost:5000/api/service/",
                    serviceData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

            }

            clearForm();

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

            await axios.put(
                `http://localhost:5000/api/service/${service._id}`,
                {
                    availability: !service.availability
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
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

            await axios.delete(
                `http://localhost:5000/api/service/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
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

            <p className="text-xs tracking-[4px] text-[#9a7b62]">
                WHAT WE OFFER
            </p>

            <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
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

                <div className="mt-6 flex gap-3">

                    <button
                        type="submit"
                        className="bg-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                    >
                        {editingId ? "UPDATE SERVICE" : "ADD SERVICE"}
                    </button>

                    {editingId && (

                        <button
                            type="button"
                            onClick={clearForm}
                            className="border border-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                        >
                            CANCEL
                        </button>

                    )}

                </div>

            </form>


            {/* ================= SERVICE LIST ================= */}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">

                {services.length > 0 ? (

                    services.map((service) => (

                        <div
                            key={service._id}
                            className="border border-[#d8c6b6] bg-[#efe2d5] p-8"
                        >

                            <h3 className="text-2xl font-normal text-[#5a182b]">
                                {service.name}
                            </h3>

                            <p className="mt-4 text-[#6e5545]">
                                {service.description}
                            </p>

                            <p className="mt-4 text-[#5a182b]">
                                ₹{service.price}
                            </p>

                            <p className="mt-2 text-sm text-[#8b6d57]">
                                {service.duration} minutes
                            </p>

                            <p className="mt-2 text-sm text-[#8b6d57]">
                                {service.availability
                                    ? "Available"
                                    : "Not available"}
                            </p>

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
