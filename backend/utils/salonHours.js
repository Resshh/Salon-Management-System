const SalonSetting = require("../models/salonSettingModel");

// ======================================================
// Shared date, time and opening-hours helpers.
// Booking, slots, clock in and the dashboard all use these,
// so the rules exist in ONE place only.
//
// Dates are text like "2026-10-07" and times are text like "09:30".
// Text in these shapes can be compared with < and > directly.
// ======================================================

const DAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];


// ---------- shape checks ----------

const isValidDate = (value) => {
    return (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !isNaN(new Date(`${value}T00:00:00`))
    );
};

const isValidTime = (value) => {
    return (
        typeof value === "string" &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
    );
};


// ---------- conversions ----------

// "09:30" -> 570 minutes
const toMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

// 570 minutes -> "09:30"
const toTime = (totalMinutes) => {
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const minutes = String(totalMinutes % 60).padStart(2, "0");
    return `${hours}:${minutes}`;
};

// A Date -> "2026-10-07"
const toDateText = (date) => {
    return (
        date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0")
    );
};

// "2026-10-07" -> "Wednesday"
const getDayName = (date) => {
    return DAY_NAMES[new Date(`${date}T00:00:00`).getDay()];
};


// ---------- now ----------

const getToday = () => {
    return toDateText(new Date());
};

const getTimeNow = () => {
    const now = new Date();
    return (
        String(now.getHours()).padStart(2, "0") + ":" +
        String(now.getMinutes()).padStart(2, "0")
    );
};


// ---------- is the salon open? ----------

// Checks the hours, weekly days off and holidays the admin saved.
// Returns { valid: true } or { valid: false, message }.
const isSalonOpen = async (date, startTime, endTime) => {

    const settings = await SalonSetting.findOne();

    // Admin has not saved any settings yet, so nothing to check
    if (!settings) {
        return { valid: true };
    }

    const holiday = settings.holidays.find(
        (item) => item.date === date
    );

    if (holiday) {
        return {
            valid: false,
            message: `Salon is closed on ${date} (${holiday.reason || "Holiday"})`
        };
    }

    const dayName = getDayName(date);

    if (settings.closedDays.includes(dayName)) {
        return {
            valid: false,
            message: `Salon is closed on ${dayName}`
        };
    }

    if (startTime < settings.openTime || endTime > settings.closeTime) {
        return {
            valid: false,
            message: `Salon is open from ${settings.openTime} to ${settings.closeTime}`
        };
    }

    return { valid: true };

};


module.exports = {
    DAY_NAMES,
    isValidDate,
    isValidTime,
    toMinutes,
    toTime,
    toDateText,
    getDayName,
    getToday,
    getTimeNow,
    isSalonOpen
};
