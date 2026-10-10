import { useEffect, useState } from "react";
import api, { showError } from "../../api";
import Message from "../Message";

// Clock in / clock out banner, shown at the very top of the stylist's first page.

function StylistAttendance() {

    // Success / error message shown at the top right
    const [message, setMessage] = useState(null);

    // Recent work records, newest first
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    // true while a clock in / clock out request is on its way to the server
    const [busy, setBusy] = useState(false);

    // Is the salon open right now? Sent by the server: { open, message }
    const [salon, setSalon] = useState(null);

    useEffect(() => {
        getRecords();
    }, []);


    // ================= GET MY RECORDS =================

    const getRecords = async () => {

        try {

            const response = await api.get(
                "/attendance/my"
            );

            setRecords(response.data.records || []);
            setSalon(response.data.salon || null);

        } catch (error) {

            showError(
                error.response?.data?.message ||
                "Failed to load attendance"
            );

        } finally {

            setLoading(false);

        }

    };


    // ================= CLOCK IN OR CLOCK OUT =================

    // action is "clock-in" or "clock-out"
    const clock = async (action) => {

        // A second click while the first request is still running is ignored
        if (busy) {
            return;
        }

        setBusy(true);

        try {

            const response = await api.post(
                `/attendance/${action}`,
                {}
            );

            setMessage({
                type: "success",
                text: response.data.message
            });

            getRecords();

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.response?.data?.message ||
                    "Failed to update attendance"
            });

        } finally {

            setBusy(false);

        }

    };


    // ================= SMALL HELPERS =================

    // Date -> "10:05 am"
    const formatTime = (date) => {

        return new Date(date).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
        });

    };

    // How long a record lasted, as "3 h 20 min"
    const formatDuration = (record) => {

        const end = record.clockOut
            ? new Date(record.clockOut)
            : new Date();

        const minutes = Math.floor(
            (end - new Date(record.clockIn)) / 60000
        );

        return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;

    };


    // The newest record has no clockOut = the stylist is working right now
    const openRecord = records.find(
        (record) => !record.clockOut
    );


    if (loading) {
        return null;
    }


    return (
        <div>

            {/* ================= BIG CLOCK IN / CLOCK OUT BANNER ================= */}

            <div className="clock-card flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                <div>

                    {/* small coloured label: on duty or off duty */}

                    <p className={openRecord ? "clock-status on-duty" : "clock-status off-duty"}>
                        {openRecord ? "● ON DUTY" : "● OFF DUTY"}
                    </p>

                    <p className="mt-3 text-3xl md:text-4xl">
                        {openRecord
                            ? `Clocked in since ${formatTime(openRecord.clockIn)}`
                            : "You are not clocked in"}
                    </p>

                    <p className="mt-2 text-sm md:text-base clock-note">
                        {openRecord
                            ? `Working for ${formatDuration(openRecord)}. Clock out when you stop.`
                            : "Clock in when you start work, so the salon knows you are here."}
                    </p>

                    {/* salon hours, or why clocking in is not possible */}

                    {salon && (

                        <p className="mt-2 text-sm clock-note">
                            {salon.message}
                        </p>

                    )}

                </div>

                {openRecord ? (

                    <button
                        onClick={() => clock("clock-out")}
                        disabled={busy}
                        className="clock-button clock-out"
                    >
                        CLOCK OUT
                    </button>

                ) : (

                    <button
                        onClick={() => clock("clock-in")}
                        disabled={busy || (salon && !salon.open)}
                        className="clock-button"
                    >
                        {salon && !salon.open ? "SALON CLOSED" : "CLOCK IN"}
                    </button>

                )}

            </div>


            {/* ================= RECENT RECORDS ================= */}

            {records.length > 0 && (

                <div className="mt-5 border border-[#c9aa91] bg-[#efe2d5] p-6 space-y-2 text-sm text-[#6e5545]">

                    <p className="text-xs tracking-[2px] text-[#9a7b62]">
                        RECENT
                    </p>

                    {records.slice(0, 5).map((record) => (

                        <div
                            key={record._id}
                            className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-[#d8c6b6] pb-2"
                        >

                            <span>
                                {new Date(
                                    record.clockIn
                                ).toLocaleDateString("en-IN", {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "short"
                                })}
                            </span>

                            <span className="text-[#321d1d]">
                                {formatTime(record.clockIn)}
                                {" - "}
                                {record.clockOut
                                    ? formatTime(record.clockOut)
                                    : "working"}
                                {" · "}
                                {formatDuration(record)}
                            </span>

                        </div>

                    ))}

                </div>

            )}

            <Message
                message={message}
                onClose={() => setMessage(null)}
            />

        </div>
    );

}

export default StylistAttendance;
