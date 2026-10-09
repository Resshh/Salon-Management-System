import { useEffect, useState } from "react";
import axios from "axios";
import Message from "../Message";
import StylistAttendance from "./StylistAttendance";

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

function StylistSchedule() {

    // Success / error message shown at the top right
    const [message, setMessage] = useState(null);

    // One item per day:
    //   { day: "Monday", slots: [ { startTime: "10:00", endTime: "13:00" }, ... ] }
    // A day with no slots is a day off.
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        getSchedule();
    }, []);


    // ================= GET SCHEDULE =================

    const getSchedule = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/stylist/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const savedSchedule =
                response.data.stylist.workingSchedule || [];

            // The database stores one row per time slot: { day, startTime, endTime }.
            // Group those rows by day so each day shows its own list of slots.
            const days = DAYS.map((day) => {

                const daySlots = savedSchedule
                    .filter((item) => item.day === day)
                    .map((item) => ({
                        startTime: item.startTime,
                        endTime: item.endTime
                    }))
                    .sort((a, b) =>
                        a.startTime.localeCompare(b.startTime)
                    );

                return {
                    day: day,
                    slots: daySlots
                };

            });

            setSchedule(days);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load schedule"
            );

        } finally {

            setLoading(false);

        }

    };


    // ================= CHANGE THE SLOTS OF ONE DAY =================

    // Replaces the slots of the day at dayIndex with newSlots
    const setDaySlots = (dayIndex, newSlots) => {

        const newSchedule = [...schedule];

        newSchedule[dayIndex] = {
            ...newSchedule[dayIndex],
            slots: newSlots
        };

        setSchedule(newSchedule);

    };


    // ================= ADD A SLOT =================

    const addSlot = (dayIndex) => {

        const slots = schedule[dayIndex].slots;

        // First slot of the day: a normal morning.
        // Next slots start where the last one ended.
        let newSlot = {
            startTime: "10:00",
            endTime: "13:00"
        };

        if (slots.length > 0) {

            const lastEnd = slots[slots.length - 1].endTime;

            newSlot = {
                startTime: lastEnd,
                endTime: lastEnd
            };

        }

        setDaySlots(dayIndex, [...slots, newSlot]);

    };


    // ================= REMOVE A SLOT =================

    const removeSlot = (dayIndex, slotIndex) => {

        setDaySlots(
            dayIndex,
            schedule[dayIndex].slots.filter(
                (slot, index) => index !== slotIndex
            )
        );

    };


    // ================= CHANGE A TIME =================

    // field is "startTime" or "endTime"
    const changeSlot = (dayIndex, slotIndex, field, value) => {

        const newSlots = [...schedule[dayIndex].slots];

        newSlots[slotIndex] = {
            ...newSlots[slotIndex],
            [field]: value
        };

        setDaySlots(dayIndex, newSlots);

    };


    // ================= SAVE SCHEDULE =================

    const saveSchedule = async (e) => {

        e.preventDefault();

        // Turn the days back into one row per slot, the shape the database uses
        const workingSchedule = [];

        for (const item of schedule) {

            for (const slot of item.slots) {

                if (!slot.startTime || !slot.endTime) {
                    setMessage({
                        type: "error",
                        text: `Please fill both times for every slot on ${item.day}.`
                    });
                    return;
                }

                if (slot.startTime >= slot.endTime) {
                    setMessage({
                        type: "error",
                        text: `End time must be after start time on ${item.day}.`
                    });
                    return;
                }

                // Two slots overlap when each one starts before the other ends
                const overlapping = item.slots.find(
                    (other) =>
                        other !== slot &&
                        other.startTime < slot.endTime &&
                        other.endTime > slot.startTime
                );

                if (overlapping) {
                    setMessage({
                        type: "error",
                        text: `Two time slots overlap on ${item.day}.`
                    });
                    return;
                }

                workingSchedule.push({
                    day: item.day,
                    startTime: slot.startTime,
                    endTime: slot.endTime
                });

            }

        }

        try {

            await axios.put(
                "http://localhost:5000/api/stylist/profile",
                {
                    workingSchedule: workingSchedule
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage({
                type: "success",
                text: "Schedule saved successfully."
            });

            getSchedule();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to save schedule"
            });

        }

    };


    return (
        <section
            id="schedule"
            className="px-6 md:px-20 py-10 md:py-14"
        >

            {/* ================= CLOCK IN / CLOCK OUT ================= */}

            <StylistAttendance />


            {/* ================= HEADING ================= */}

            <h2 className="mt-14 text-4xl font-normal text-[#5a182b]">
                Schedule
            </h2>


            {loading ? (

                <p className="mt-8 text-[#6e5545]">
                    Loading schedule...
                </p>

            ) : schedule.length === 0 ? (

                <div className="mt-8 border border-[#c9aa91] bg-[#efe2d5] p-8">
                    <p className="text-[#6e5545]">
                        Your stylist profile has not been created yet.
                    </p>
                </div>

            ) : (

                <div>

                    {/* ================= WORKING TIME SLOTS ================= */}

                    <form
                        onSubmit={saveSchedule}
                        className="mt-8 border border-[#c9aa91] bg-[#efe2d5] p-6 md:p-8"
                    >

                        <p className="text-xs tracking-[3px] text-[#9a7b62]">
                            WORKING TIME SLOTS
                        </p>

                        <p className="mt-2 max-w-xl text-[#6e5545]">
                            Add the times you are willing to work on each day. Customers can only book you inside these slots. A day with no slot is a day off.
                        </p>

                        <div className="mt-6 space-y-5">

                            {schedule.map((item, dayIndex) => (

                                <div
                                    key={item.day}
                                    className="flex flex-col md:flex-row md:items-start gap-3 md:gap-6 border-b border-[#d8c6b6] pb-5"
                                >

                                    {/* DAY */}

                                    <p className="md:w-32 md:pt-2 text-[#321d1d]">
                                        {item.day}
                                    </p>


                                    {/* SLOTS OF THIS DAY */}

                                    <div className="flex-1 space-y-3">

                                        {item.slots.length === 0 && (

                                            <p className="md:pt-2 text-sm text-[#9a7b62]">
                                                Day off
                                            </p>

                                        )}

                                        {item.slots.map((slot, slotIndex) => (

                                            <div
                                                key={slotIndex}
                                                className="flex flex-wrap items-center gap-3"
                                            >

                                                <input
                                                    type="time"
                                                    value={slot.startTime}
                                                    aria-label={`${item.day} slot ${slotIndex + 1} start time`}
                                                    onChange={(e) =>
                                                        changeSlot(
                                                            dayIndex,
                                                            slotIndex,
                                                            "startTime",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="border border-[#c9aa91] bg-[#f7efe5] p-2 text-[#321d1d] outline-none"
                                                />

                                                <span className="text-[#6e5545]">
                                                    to
                                                </span>

                                                <input
                                                    type="time"
                                                    value={slot.endTime}
                                                    aria-label={`${item.day} slot ${slotIndex + 1} end time`}
                                                    onChange={(e) =>
                                                        changeSlot(
                                                            dayIndex,
                                                            slotIndex,
                                                            "endTime",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="border border-[#c9aa91] bg-[#f7efe5] p-2 text-[#321d1d] outline-none"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeSlot(
                                                            dayIndex,
                                                            slotIndex
                                                        )
                                                    }
                                                    className="text-sm text-[#5a182b] underline"
                                                >
                                                    Remove
                                                </button>

                                            </div>

                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => addSlot(dayIndex)}
                                            className="border border-[#5a182b] px-4 py-2 text-sm text-[#5a182b] hover:bg-[#5a182b] hover:text-[#f7efe5]"
                                        >
                                            + ADD TIME SLOT
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                        <button
                            type="submit"
                            className="mt-7 bg-[#5a182b] px-7 py-4 text-sm tracking-[2px] text-[#f7efe5] hover:bg-[#321d1d]"
                        >
                            SAVE SCHEDULE
                        </button>

                    </form>

                </div>

            )}

            <Message
                message={message}
                onClose={() => setMessage(null)}
            />

        </section>
    );

}

export default StylistSchedule;
