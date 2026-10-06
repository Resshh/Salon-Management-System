const SalonSetting = require("../models/salonSettingModel");


// Anyone can read the salon working hours and holidays
const getSettings = async (req, res) => {
    try {
        let settings = await SalonSetting.findOne();

        // Nothing saved yet: send the default values (not saved to the database)
        if (!settings) {
            settings = new SalonSetting();
        }

        res.status(200).json({
            message: "Salon settings fetched successfully",
            settings
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch salon settings"
        });
    }
};


// Admin updates working hours, closed days and holidays
const updateSettings = async (req, res) => {
    try {
        const { openTime, closeTime, closedDays, holidays } = req.body;

        if (!openTime || !closeTime || openTime >= closeTime) {
            return res.status(400).json({
                message: "Closing time must be after opening time"
            });
        }

        let settings = await SalonSetting.findOne();

        if (!settings) {
            settings = new SalonSetting();
        }

        settings.openTime = openTime;
        settings.closeTime = closeTime;
        settings.closedDays = closedDays || [];
        settings.holidays = holidays || [];

        await settings.save();

        res.status(200).json({
            message: "Salon settings updated successfully",
            settings
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update salon settings"
        });
    }
};


module.exports = {
    getSettings,
    updateSettings
};
