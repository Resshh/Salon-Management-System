const mongoose = require("mongoose");

// One record = one period of work: from clock in to clock out.
// A stylist can have more than one record in a day (for example before and after lunch).
const attendanceSchema = new mongoose.Schema(
    {
        stylist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Stylist",
            required: true
        },

        clockIn: {
            type: Date,
            required: true
        },

        // Empty while the stylist is still working
        clockOut: {
            type: Date
        }
    },
    { timestamps: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
