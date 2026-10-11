const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        // minutes
        duration: {
            type: Number,
            required: true,
            min: 5,
            max: 600
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        availability: {
            type: Boolean,
            default: true
        },

        // Picture of the service, saved as text (a "data URL": data:image/jpeg;base64,...),
        // the same way as the stylist photo in stylistModel.js.
        // select: false = left out of every query unless we ask with .select("+image"),
        // because it is long and most pages do not need it.
        image: {
            type: String,
            select: false
        }
    },
    {
        timestamps: true
    }
);

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;