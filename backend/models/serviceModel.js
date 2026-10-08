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
        }
    },
    {
        timestamps: true
    }
);

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;