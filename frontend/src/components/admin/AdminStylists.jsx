import { useEffect, useState } from "react";
import api, { showError } from "../../api";
import Message from "../Message";
import Modal from "../Modal";
import ConfirmBox from "../ConfirmBox";
import shrinkImage from "../../shrinkImage";
import { MailIcon, PhoneIcon } from "lucide-react";

function AdminStylists() {

    // Success / error message shown at the top right
    const [message, setMessage] = useState(null);

    // Stylist being edited (null = box hidden)
    const [editingStylist, setEditingStylist] = useState(null);
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editSpecialization, setEditSpecialization] = useState("");

    // New photo chosen in the edit box, as text ("" = keep the current photo)
    const [editPhoto, setEditPhoto] = useState("");

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

    // Photo chosen in the "add stylist" form, as text ("" = no photo)
    const [photo, setPhoto] = useState("");

    useEffect(() => {
        getStylists();
        getAttendance();
    }, []);


    // ================= TODAY'S ATTENDANCE =================

    const getAttendance = async () => {

        try {

            const response = await api.get(
                "/attendance/today"
            );

            setAttendance(response.data.records || []);

        } catch (error) {

            showError(
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

            const response = await api.get(
                "/admin/stylists"
            );

            setStylists(response.data.stylists || []);

        } catch (error) {

            showError(
                error.response?.data?.message ||
                "Failed to load stylists"
            );

        }

    };


    // ================= CHOOSE PHOTO =================

    // Runs when the admin picks a file, in the add form or in the edit box.
    // "savePhoto" is the function that keeps the result: setPhoto or setEditPhoto.
    // shrinkImage (in src/shrinkImage.js) makes it 400 x 500 and gives it back as text.
    const choosePhoto = (e, savePhoto) => {

        const file = e.target.files[0];

        if (!file) {
            return;
        }

        shrinkImage(file, 400, 500, savePhoto, () => {
            setMessage({
                type: "error",
                text: "Please choose an image file."
            });
        });

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

        const stylistData = {
            name,
            email,
            password,
            phone,
            gender,
            dateOfBirth,
            specialization
        };

        // Send the photo only when one was chosen
        if (photo) {
            stylistData.photo = photo;
        }

        try {

            await api.post(
                "/user/stylist",
                stylistData
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
            setPhoto("");

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
        setEditPhoto("");
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

        const stylistData = {
            name: editName,
            phone: editPhone,
            specialization: editSpecialization
        };

        // Send the photo only when a new one was chosen
        if (editPhoto) {
            stylistData.photo = editPhoto;
        }

        try {

            await api.put(
                `/admin/users/${editingStylist.user._id}`,
                stylistData
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

            await api.delete(
                `/admin/users/${stylist.user._id}`
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

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <h2 className="text-4xl font-normal text-[#5a182b]">
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

                    <div className="mt-5">

                        <label className="text-sm text-[#6e5545]">
                            Photo (optional)
                        </label>

                        <div className="mt-2 flex flex-wrap items-center gap-5">

                            {/* Preview of the chosen photo */}

                            {photo && (

                                <img
                                    src={photo}
                                    alt="Stylist preview"
                                    className="h-28 aspect-4/5 rounded-lg object-cover"
                                />

                            )}

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => choosePhoto(e, setPhoto)}
                                className="text-sm text-[#6e5545]"
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

            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

                {stylists.length > 0 ? (

                    stylists.map((stylist) => (

                        // One card per stylist (same design as the customer Stylists page):
                        // a big photo on top, details and buttons under it.
                        <div
                            key={stylist._id}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-[#d8c6b6] bg-[#f7efe5]"
                        >

                            {/* ---------- The photo ----------
                                "aspect-4/5" keeps the box 4 wide by 5 tall on every screen. */}

                            <div className="relative aspect-4/5 overflow-hidden bg-linear-to-br from-[#5a182b] to-[#9a7b62]">

                                {/* The photo if there is one,
                                    otherwise the first letter of the name on the coloured box. */}

                                {stylist.photo ? (

                                    <img
                                        src={stylist.photo}
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

                                <p className="flex items-center gap-3 text-sm break-all text-[#321d1d]">
                                    <MailIcon size={16} className="shrink-0 text-[#9a7b62]" />
                                    {stylist.user?.email}
                                </p>

                                <p className="mt-2 flex items-center gap-3 text-sm text-[#321d1d]">
                                    <PhoneIcon size={16} className="shrink-0 text-[#9a7b62]" />
                                    {stylist.user?.phone}
                                </p>

                                <p className="mt-5 border-t border-[#d8c6b6] pt-5 text-xs tracking-[2px] text-[#9a7b62]">
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

                                    <p className="mt-2 text-sm text-[#6e5545]">
                                        No services selected yet
                                    </p>

                                )}

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

                                {/* "flex-1" takes the free space, so the buttons sit at the bottom of every card */}

                                <p className="mt-2 flex-1 text-sm text-[#6e5545]">
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

                        <label className="mt-4 block text-sm text-[#6e5545]">
                            Photo (leave empty to keep the current one)
                        </label>

                        <div className="mt-2 flex flex-wrap items-center gap-5">

                            {/* Preview: the new photo if one was chosen, else the saved one */}

                            {(editPhoto || editingStylist.photo) && (

                                <img
                                    src={editPhoto || editingStylist.photo}
                                    alt="Stylist preview"
                                    className="h-28 aspect-4/5 rounded-lg object-cover"
                                />

                            )}

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => choosePhoto(e, setEditPhoto)}
                                className="text-sm text-[#6e5545]"
                            />

                        </div>

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
