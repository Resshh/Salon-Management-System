import { useEffect, useState } from "react";
import axios from "axios";

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

    // One row per day: { day, working, startTime, endTime }
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

            // Build a row for all 7 days.
            // If the day is saved in the database, use its times.
            const rows = DAYS.map((day) => {

                const savedDay = savedSchedule.find(
                    (item) => item.day === day
                );

                if (savedDay) {
                    return {
                        day: day,
                        working: true,
                        startTime: savedDay.startTime,
                        endTime: savedDay.endTime
                    };
                }

                return {
                    day: day,
                    working: false,
                    startTime: "09:00",
                    endTime: "18:00"
                };

            });

            setSchedule(rows);

        } catch (error) {

            console.log(
                error.response?.data?.message ||
                "Failed to load schedule"
            );

        } finally {

            setLoading(false);

        }

    };


    // ================= CHANGE ONE DAY =================

    const changeDay = (index, field, value) => {

        // Copy the array, then replace the one row that changed
        const newSchedule = [...schedule];

        newSchedule[index] = {
            ...newSchedule[index],
            [field]: value
        };

        setSchedule(newSchedule);

    };


    // ================= SAVE SCHEDULE =================

    const saveSchedule = async (e) => {

        e.preventDefault();

        // Only working days are saved
        const workingDays = schedule.filter(
            (item) => item.working
        );

        for (const item of workingDays) {

            if (item.startTime >= item.endTime) {
                alert(`End time must be after start time on ${item.day}.`);
                return;
            }

        }

        const workingSchedule = workingDays.map((item) => ({
            day: item.day,
            startTime: item.startTime,
            endTime: item.endTime
        }));

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

            alert("Schedule saved successfully.");

            getSchedule();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to save schedule"
            );

        }

    };


    return (
        <section
            id="schedule"
            className="px-6 md:px-20 py-16 md:py-20"
        >

            {/* ================= HEADING ================= */}

            <p className="text-xs tracking-[4px] text-[#9a7b62]">
                YOUR WORKING HOURS
            </p>

            <h2 className="mt-4 text-4xl font-normal text-[#5a182b]">
                Schedule
            </h2>

            <p className="mt-4 max-w-xl text-[#6e5545]">
                Customers can only book you on the days and times you set here.
            </p>


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

                <form
                    onSubmit={saveSchedule}
                    className="mt-8 border border-[#c9aa91] bg-[#efe2d5] p-8"
                >

                    <div className="space-y-4">

                        {schedule.map((item, index) => (

                            <div
                                key={item.day}
                                className="flex flex-col md:flex-row md:items-center gap-4 border-b border-[#d8c6b6] pb-4"
                            >

                                {/* DAY */}

                                <label className="flex items-center gap-3 md:w-48 cursor-pointer">

                                    <input
                                        type="checkbox"
                                        checked={item.working}
                                        onChange={(e) =>
                                            changeDay(
                                                index,
                                                "working",
                                                e.target.checked
                                            )
                                        }
                                    />

                                    <span className="text-[#321d1d]">
                                        {item.day}
                                    </span>

                                </label>


                                {/* TIMES */}

                                {item.working ? (

                                    <div className="flex items-center gap-3">

                                        <input
                                            type="time"
                                            value={item.startTime}
                                            onChange={(e) =>
                                                changeDay(
                                                    index,
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
                                            value={item.endTime}
                                            onChange={(e) =>
                                                changeDay(
                                                    index,
                                                    "endTime",
                                                    e.target.value
                                                )
                                            }
                                            className="border border-[#c9aa91] bg-[#f7efe5] p-2 text-[#321d1d] outline-none"
                                        />

                                    </div>

                                ) : (

                                    <p className="text-sm text-[#9a7b62]">
                                        Day off
                                    </p>

                                )}

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

            )}

        </section>
    );

}

export default StylistSchedule;
