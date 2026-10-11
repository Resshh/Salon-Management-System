const Service = require("../models/serviceModel");
const isBadImage = require("../utils/checkImage");

const createService = async (req, res) => {

    try {

        const {
            name,
            description,
            duration,
            price,
            image
        } = req.body;

        // The picture is optional: check it only when one was sent
        if (image !== undefined && isBadImage(image)) {
            return res.status(400).json({
                message: "The picture must be a small JPEG image"
            });
        }

        const existingService = await Service.findOne({ name });

        if (existingService) {
            return res.status(400).json({
                message: "Service already exists"
            });
        }

        const newService = new Service({
            name,
            description,
            duration,
            price,
            image
        });

        await newService.save();

        return res.status(201).json({
            message: "Service created successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Service creation failed",
            error: error.message
        });

    }
};

const getAllServices = async (req, res) => {

    try {

        // The picture is hidden by default (select: false in the model)
        const services = await Service.find()
            .select("+image");

        return res.status(200).json({
            message: "Services fetched successfully",
            services: services
        });

    } catch (error) {

        return res.status(500).json({
            message: "Failed to fetch services",
            error: error.message
        });

    }
};


const updateService = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            name,
            description,
            duration,
            price,
            availability,
            image
        } = req.body;

        if (image !== undefined && isBadImage(image)) {
            return res.status(400).json({
                message: "The picture must be a small JPEG image"
            });
        }

        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        service.name = name ?? service.name;
        service.description = description ?? service.description;
        service.duration = duration ?? service.duration;
        service.price = price ?? service.price;
        service.availability = availability ?? service.availability;

        // The picture was not loaded above (select: false), so it is only
        // touched when a new one was sent. Otherwise the old picture stays.
        if (image !== undefined) {
            service.image = image;
        }

        await service.save();

        return res.status(200).json({
            message: "Service updated successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Service update failed",
            error: error.message
        });

    }
};

const deleteService = async (req, res) => {

    try {

        const { id } = req.params;

        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        await Service.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Service deleted successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Service deletion failed",
            error: error.message
        });

    }
};


module.exports = {
    createService, getAllServices,updateService,deleteService
};