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