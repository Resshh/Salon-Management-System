const mongoose = require("mongoose");

const stylistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        specialization: {
            type: String,
            required: true,
            trim: true
        },

        // Profile photo, saved as text (a "data URL": data:image/jpeg;base64,...).
        // select: false = left out of every query unless we ask with .select("+photo"),
        // because it is long and most pages do not need it.
        photo: {
            type: String,
            select: false
        },

        services: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Service"
            }
        ],

        workingSchedule: [
            {
                day: {
                    type: String,
                    required: true
                },

                startTime: {
                    type: String,
                    required: true
                },

                endTime: {
                    type: String,
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

const Stylist = mongoose.model("Stylist", stylistSchema);

module.exports = Stylist;