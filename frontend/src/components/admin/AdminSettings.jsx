import { useEffect, useState } from "react";
import axios from "axios";
import Message from "../Message";

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

function AdminSettings() {

    // Success / error message shown at the top right
    const [message, setMessage] = useState(null);

    const [openTime, setOpenTime] = useState("09:00");
    const [closeTime, setCloseTime] = useState("20:00");
    const [closedDays, setClosedDays] = useState([]);
    const [holidays, setHolidays] = useState([]);

    // New holiday form
    const [holidayDate, setHolidayDate] = useState("");
    const [holidayReason, setHolidayReason] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        getSettings();
    }, []);


    // ================= GET SETTINGS =================

    const getSettings = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/settings/"
            );

            const settings = response.data.settings;

            setOpenTime(settings.openTime);
            setCloseTime(settings.closeTime);
            setClosedDays(settings.closedDays || []);
            setHolidays(settings.holidays || []);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load settings"
            );

        }

    };


    // ================= TICK / UNTICK A CLOSED DAY =================

    const toggleClosedDay = (day) => {

        if (closedDays.includes(day)) {

            setClosedDays(
                closedDays.filter((item) => item !== day)
            );

        } else {

            setClosedDays([...closedDays, day]);

        }

    };


    // ================= ADD / REMOVE HOLIDAY =================

    const addHoliday = () => {

        if (!holidayDate) {
            setMessage({
                type: "error",
                text: "Please choose a holiday date."
            });
            return;
        }

        setHolidays([
            ...holidays,
            {
                date: holidayDate,
                reason: holidayReason
            }
        ]);

        setHolidayDate("");
        setHolidayReason("");

    };

    const removeHoliday = (date) => {

        setHolidays(
            holidays.filter((item) => item.date !== date)
        );

    };


    // ================= SAVE SETTINGS =================

    const saveSettings = async (e) => {

        e.preventDefault();

        try {

            await axios.put(
                "http://localhost:5000/api/settings/",
                {
                    openTime,
                    closeTime,
                    closedDays,
                    holidays
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage({
                type: "success",
                text: "Salon settings saved."
            });

            getSettings();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to save settings"
            });

        }

    };


    const inputClass =
        "border border-[#c9aa91] bg-[#f7efe5] p-3 text-[#321d1d] outline-none";


    return (
        <section
            id="settings"
            className="bg-[#efe2d5] px-6 md:px-20 py-16 md:py-20"
        >

            <h2 className="text-4xl font-normal text-[#5a182b]">
                Salon Settings
            </h2>

            <form
                onSubmit={saveSettings}
                className="mt-8 border border-[#c9aa91] bg-[#f7efe5] p-8"
            >

                {/* ================= WORKING HOURS ================= */}

                <h3 className="text-2xl text-[#5a182b]">
                    Working Hours
                </h3>

                <div className="mt-4 flex items-center gap-3">

                    <input
                        type="time"
                        value={openTime}
                        onChange={(e) => setOpenTime(e.target.value)}
                        className={inputClass}
                    />

                    <span className="text-[#6e5545]">
                        to
                    </span>

                    <input
                        type="time"
                        value={closeTime}
                        onChange={(e) => setCloseTime(e.target.value)}
                        className={inputClass}
                    />

                </div>


                {/* ================= CLOSED DAYS ================= */}

                <h3 className="mt-8 text-2xl text-[#5a182b]">
                    Weekly Days Off
                </h3>

                <div className="mt-4 flex flex-wrap gap-4">

                    {DAYS.map((day) => (

                        <label
                            key={day}
                            className="flex items-center gap-2 cursor-pointer text-[#6e5545]"
                        >

                            <input
                                type="checkbox"
                                checked={closedDays.includes(day)}
                                onChange={() => toggleClosedDay(day)}
                            />

                            {day}

                        </label>

                    ))}

                </div>


                {/* ================= HOLIDAYS ================= */}

                <h3 className="mt-8 text-2xl text-[#5a182b]">
                    Holidays
                </h3>

                {holidays.map((holiday) => (

                    <p
                        key={holiday.date}
                        className="mt-3 text-[#6e5545]"
                    >
                        {holiday.date}
                        {holiday.reason ? ` · ${holiday.reason}` : ""}
                        {" "}
                        <button
                            type="button"
                            onClick={() => removeHoliday(holiday.date)}
                            className="ml-3 text-sm text-[#5a182b] underline"
                        >
                            Remove
                        </button>
                    </p>

                ))}

                <div className="mt-4 flex flex-col md:flex-row gap-3">

                    <input
                        type="date"
                        value={holidayDate}
                        onChange={(e) => setHolidayDate(e.target.value)}
                        className={inputClass}
                    />

                    <input
                        type="text"
                        value={holidayReason}
                        onChange={(e) => setHolidayReason(e.target.value)}
                        placeholder="Reason (optional)"
                        className={`flex-1 ${inputClass}`}
                    />

                    <button
                        type="button"
                        onClick={addHoliday}
                        className="border border-[#5a182b] px-5 py-3 text-sm tracking-[1px] text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                    >
                        ADD HOLIDAY
                    </button>

                </div>

                <button
                    type="submit"
                    className="mt-8 bg-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                >
                    SAVE SETTINGS
                </button>

            </form>

            <Message
                message={message}
                onClose={() => setMessage(null)}
            />

        </section>
    );

}

export default AdminSettings;
