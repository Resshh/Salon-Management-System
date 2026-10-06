const mongoose = require("mongoose");

// The salon has only ONE settings document
const salonSettingSchema = new mongoose.Schema(
    {
        // "HH:MM" in 24 hour format
        openTime: {
            type: String,
            default: "09:00"
        },

        closeTime: {
            type: String,
            default: "20:00"
        },

        // Weekly days off, example: ["Sunday"]
        closedDays: [
            {
                type: String
            }
        ],

        // Single days off, date is "YYYY-MM-DD"
        holidays: [
            {
                date: {
                    type: String,
                    required: true
                },

                reason: {
                    type: String,
                    trim: true
                }
            }
        ]
    },
    { timestamps: true }
);

const SalonSetting = mongoose.model("SalonSetting", salonSettingSchema);

module.exports = SalonSetting;
