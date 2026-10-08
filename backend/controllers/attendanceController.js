const Attendance = require("../models/attendanceModel");
const Stylist = require("../models/stylistModel");
const SalonSetting = require("../models/salonSettingModel");

const {
    getToday,
    getTimeNow,
    toDateText,
    isSalonOpen
} = require("../utils/salonHours");


// The token only has the user id, so find the stylist profile first
const findStylist = (userId) => {
    return Stylist.findOne({ user: userId });
};


// Is the salon open right now? Uses the same rule as booking (utils/salonHours.js).
// Returns { open: true/false, message }
const getSalonStatus = async () => {

    const timeNow = getTimeNow();

    const check = await isSalonOpen(getToday(), timeNow, timeNow);

    if (!check.valid) {
        return {
            open: false,
            message: check.message
        };
    }

    return {
        open: true,
        message: "The salon is open now"
    };

};


// A stylist who forgot to clock out would stay "on duty" for days.
// This closes every record left open from an earlier day,
// at the salon's closing time on the day it was opened.
const closeForgottenRecords = async () => {

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const forgotten = await Attendance.find({
        clockOut: null,
        clockIn: { $lt: startOfToday }
    });

    if (forgotten.length === 0) {
        return;
    }

    const settings = await SalonSetting.findOne();

    const closeTime = settings ? settings.closeTime : "20:00";

    for (const record of forgotten) {

        // closing time on the day the stylist clocked in
        let clockOut = new Date(
            `${toDateText(record.clockIn)}T${closeTime}:00`
        );

        // clocked in after closing time: count no time at all
        if (clockOut < record.clockIn) {
            clockOut = record.clockIn;
        }

        record.clockOut = clockOut;

        await record.save();

    }

};


// Stylist starts work
const clockIn = async (req, res) => {
    try {
        const stylist = await findStylist(req.user.userId);

        if (!stylist) {
            return res.status(404).json({
                message: "Stylist profile not found"
            });
        }

        // Clocking in is only allowed while the salon is open
        const salon = await getSalonStatus();

        if (!salon.open) {
            return res.status(400).json({
                message: `You cannot clock in now. ${salon.message}.`
            });
        }

        await closeForgottenRecords();

        // A record without clockOut means the stylist is already working
        const openRecord = await Attendance.findOne({
            stylist: stylist._id,
            clockOut: null
        });

        if (openRecord) {
            return res.status(400).json({
                message: "You are already clocked in"
            });
        }

        const record = await Attendance.create({
            stylist: stylist._id,
            clockIn: new Date()
        });

        res.status(201).json({
            message: "Clocked in",
            record
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to clock in"
        });
    }
};


// Stylist stops work
const clockOut = async (req, res) => {
    try {
        const stylist = await findStylist(req.user.userId);

        if (!stylist) {
            return res.status(404).json({
                message: "Stylist profile not found"
            });
        }

        // Close EVERY open record of this stylist. Normally there is one;
        // closing all of them means a double click on Clock In can never
        // leave the stylist stuck "on duty".
        const result = await Attendance.updateMany(
            {
                stylist: stylist._id,
                clockOut: null
            },
            {
                clockOut: new Date()
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                message: "You are not clocked in"
            });
        }

        res.status(200).json({
            message: "Clocked out"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to clock out"
        });
    }
};


// Stylist views their own recent records (newest first)
const getMyAttendance = async (req, res) => {
    try {
        const stylist = await findStylist(req.user.userId);

        if (!stylist) {
            return res.status(404).json({
                message: "Stylist profile not found"
            });
        }

        await closeForgottenRecords();

        const records = await Attendance.find({
            stylist: stylist._id
        })
            .sort({ clockIn: -1 })
            .limit(14);

        // Also tell the screen whether clocking in is possible right now
        const salon = await getSalonStatus();

        res.status(200).json({
            message: "Attendance fetched successfully",
            records,
            salon
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch attendance"
        });
    }
};


// Admin views today's records of every stylist
const getTodayAttendance = async (req, res) => {
    try {
        await closeForgottenRecords();

        // Midnight at the start of today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const records = await Attendance.find({
            clockIn: { $gte: startOfToday }
        }).sort({ clockIn: 1 });

        res.status(200).json({
            message: "Today's attendance fetched successfully",
            records
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch attendance"
        });
    }
};


module.exports = {
    clockIn,
    clockOut,
    getMyAttendance,
    getTodayAttendance,
    closeForgottenRecords
};
