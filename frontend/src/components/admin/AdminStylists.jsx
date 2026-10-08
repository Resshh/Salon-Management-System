import { useEffect, useState } from "react";
import axios from "axios";
import Message from "../Message";
import Modal from "../Modal";
import ConfirmBox from "../ConfirmBox";

function AdminStylists() {

    // Success / error message shown at the top right
    const [message, setMessage] = useState(null);

    // Stylist being edited (null = box hidden)
    const [editingStylist, setEditingStylist] = useState(null);
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editSpecialization, setEditSpecialization] = useState("");

    // Yes / no question box (null = hidden)
    const [confirmBox, setConfirmBox] = useState(null);

    const [stylists, setStylists] = useState([]);

    // Today's clock in / clock out records of all stylists
    const [attendance, setAttendance] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [specialization, setSpecialization] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        getStylists();
        getAttendance();
    }, []);


    // ================= TODAY'S ATTENDANCE =================

    const getAttendance = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/attendance/today",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setAttendance(response.data.records || []);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load attendance"
            );

        }

    };


    // Text shown on a stylist card, for example "Clocked in at 10:05 am"
    const getAttendanceText = (stylistId) => {

        // All of today's records of this stylist, oldest first
        const records = attendance.filter(
            (record) => record.stylist === stylistId
        );

        if (records.length === 0) {
            return "Not clocked in today";
        }

        const last = records[records.length - 1];

        const time = (date) =>
            new Date(date).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit"
            });

        if (!last.clockOut) {
            return `Clocked in at ${time(last.clockIn)}`;
        }

        return `Clocked out at ${time(last.clockOut)}`;

    };


    // ================= GET STYLISTS =================

    const getStylists = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/admin/stylists",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setStylists(response.data.stylists || []);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load stylists"
            );

        }

    };


    // ================= ADD STYLIST =================

    const addStylist = async (e) => {

        e.preventDefault();

        if (
            !name ||
            !email ||
            !password ||
            !phone ||
            !gender ||
            !dateOfBirth ||
            !specialization
        ) {
            setMessage({
                type: "error",
                text: "Please fill all stylist details."
            });
            return;
        }

        try {

            await axios.post(
                "http://localhost:5000/api/user/stylist",
                {
                    name,
                    email,
                    password,
                    phone,
                    gender,
                    dateOfBirth,
                    specialization
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage({
                type: "success",
                text: "Stylist added. They can now log in with this email and password."
            });

            setName("");
            setEmail("");
            setPassword("");
            setPhone("");
            setGender("");
            setDateOfBirth("");
            setSpecialization("");

            setShowForm(false);

            getStylists();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to add stylist"
            });

        }

    };


    // ================= EDIT STYLIST =================

    const editStylist = (stylist) => {

        // Open the edit box with the current values filled in
        setEditName(stylist.user?.name || "");
        setEditPhone(stylist.user?.phone || "");
        setEditSpecialization(stylist.specialization || "");
        setEditingStylist(stylist);

    };


    const saveStylist = async (e) => {

        e.preventDefault();

        if (
            !editName.trim() ||
            !editPhone.trim() ||
            !editSpecialization.trim()
        ) {
            setMessage({
                type: "error",
                text: "Please fill name, phone and specialization."
            });
            return;
        }

        try {

            await axios.put(
                `http://localhost:5000/api/admin/users/${editingStylist.user._id}`,
                {
                    name: editName,
                    phone: editPhone,
                    specialization: editSpecialization
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setEditingStylist(null);

            setMessage({
                type: "success",
                text: "Stylist updated."
            });

            getStylists();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to update stylist"
            });

        }

    };


    // ================= DELETE STYLIST =================

    const deleteStylist = (stylist) => {

        // Ask first. The real work happens only after the user clicks YES.
        setConfirmBox({
            text: `Delete stylist ${stylist.user?.name}? This cannot be undone.`,
            onYes: () => deleteStylistConfirmed(stylist)
        });

    };


    const deleteStylistConfirmed = async (stylist) => {

        try {

            await axios.delete(
                `http://localhost:5000/api/admin/users/${stylist.user._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            getStylists();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to delete stylist"
            });

        }

    };


    const inputClass =
        "mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none";


    return (
        <section
            id="stylists"
            className="bg-[#efe2d5] px-6 md:px-20 py-16 md:py-20"
        >

            {/* ================= HEADING ================= */}

            <p className="text-xs tracking-[4px] text-[#9a7b62]">
                YOUR TEAM
            </p>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                    Stylists
                </h2>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                >
                    {showForm ? "CLOSE" : "ADD STYLIST"}
                </button>

            </div>


            {/* ================= ADD STYLIST FORM ================= */}

            {showForm && (

                <form
                    onSubmit={addStylist}
                    className="mt-8 border border-[#c9aa91] bg-[#f7efe5] p-8"
                >

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

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
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="text-sm text-[#6e5545]">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="text-sm text-[#6e5545]">
                                Phone
                            </label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="text-sm text-[#6e5545]">
                                Gender
                            </label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className={inputClass}
                            >
                                <option value="">Select gender</option>
                                <option value="Female">Female</option>
                                <option value="Male">Male</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm text-[#6e5545]">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="text-sm text-[#6e5545]">
                                Specialization
                            </label>
                            <input
                                type="text"
                                value={specialization}
                                onChange={(e) => setSpecialization(e.target.value)}
                                placeholder="Example: Hair colouring"
                                className={inputClass}
                            />
                        </div>

                    </div>

                    <button
                        type="submit"
                        className="mt-6 bg-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                    >
                        SAVE STYLIST
                    </button>

                </form>

            )}


            {/* ================= STYLIST LIST ================= */}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">

                {stylists.length > 0 ? (

                    stylists.map((stylist) => (

                        <div
                            key={stylist._id}
                            className="border border-[#d8c6b6] bg-[#f7efe5] p-8"
                        >

                            <h3 className="text-2xl font-normal text-[#5a182b]">
                                {stylist.user?.name}
                            </h3>

                            <p className="mt-3 text-[#9a7b62]">
                                {stylist.specialization}
                            </p>

                            <p className="mt-4 text-sm text-[#6e5545]">
                                {stylist.user?.email}
                            </p>

                            <p className="mt-1 text-sm text-[#6e5545]">
                                {stylist.user?.phone}
                            </p>

                            <p className="mt-5 text-xs tracking-[2px] text-[#9a7b62]">
                                SERVICES
                            </p>

                            <p className="mt-2 text-sm text-[#6e5545]">
                                {stylist.services?.length > 0
                                    ? stylist.services
                                        .map((service) => service.name)
                                        .join(", ")
                                    : "No services selected yet"}
                            </p>

                            <p className="mt-5 text-xs tracking-[2px] text-[#9a7b62]">
                                WORKING TIME SLOTS
                            </p>

                            {stylist.workingSchedule?.length > 0 ? (

                                stylist.workingSchedule.map((item, index) => (

                                    <p
                                        key={index}
                                        className="mt-1 text-sm text-[#6e5545]"
                                    >
                                        {item.day}: {item.startTime} - {item.endTime}
                                    </p>

                                ))

                            ) : (

                                <p className="mt-2 text-sm text-[#6e5545]">
                                    No schedule set yet
                                </p>

                            )}

                            <p className="mt-5 text-xs tracking-[2px] text-[#9a7b62]">
                                TODAY
                            </p>

                            <p className="mt-2 text-sm text-[#6e5545]">
                                {getAttendanceText(stylist._id)}
                            </p>

                            {stylist.user && (

                                <div className="mt-5 flex gap-3">

                                    <button
                                        onClick={() => editStylist(stylist)}
                                        className="border border-[#5a182b] px-4 py-2 text-sm text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                                    >
                                        EDIT
                                    </button>

                                    <button
                                        onClick={() => deleteStylist(stylist)}
                                        className="border border-[#5a182b] px-4 py-2 text-sm text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                                    >
                                        DELETE
                                    </button>

                                </div>

                            )}

                        </div>

                    ))

                ) : (

                    <p className="text-[#6e5545]">
                        No stylists yet.
                    </p>

                )}

            </div>

            {/* ================= EDIT BOX ================= */}

            {editingStylist && (

                <Modal
                    title="Edit stylist"
                    onClose={() => setEditingStylist(null)}
                >

                    <form onSubmit={saveStylist}>

                        <label className="text-sm text-[#6e5545]">
                            Name
                        </label>

                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                        />

                        <label className="mt-4 block text-sm text-[#6e5545]">
                            Phone
                        </label>

                        <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                        />

                        <label className="mt-4 block text-sm text-[#6e5545]">
                            Specialization
                        </label>

                        <input
                            type="text"
                            value={editSpecialization}
                            onChange={(e) => setEditSpecialization(e.target.value)}
                            className="mt-2 w-full border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none"
                        />

                        <button
                            type="submit"
                            className="mt-6 bg-[#5a182b] px-6 py-3 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                        >
                            SAVE STYLIST
                        </button>

                    </form>

                </Modal>

            )}

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

export default AdminStylists;
