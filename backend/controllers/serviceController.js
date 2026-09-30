const Service = require("../models/serviceModel");
const Category = require("../models/categoryModel");

const createService = async (req, res) => {

    try {

        const {
            name,
            description,
            duration,
            price,
            category
        } = req.body;

        const existingService = await Service.findOne({ name });

        if (existingService) {
            return res.status(400).json({
                message: "Service already exists"
            });
        }

        const existingCategory = await Category.findById(category);

        if (!existingCategory) {
            return res.status(400).json({
                message: "Category not found"
            });
        }

        const newService = new Service({
            name,
            description,
            duration,
            price,
            category
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

        const services = await Service.find()
            .populate("category", "name");

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
            category,
            availability
        } = req.body;

        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        if (category) {

            const existingCategory = await Category.findById(category);

            if (!existingCategory) {
                return res.status(400).json({
                    message: "Category not found"
                });
            }

        }

        service.name = name ?? service.name;
        service.description = description ?? service.description;
        service.duration = duration ?? service.duration;
        service.price = price ?? service.price;
        service.category = category ?? service.category;
        service.availability = availability ?? service.availability;

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

const getServicesByCategory = async (req, res) => {

    try {

        const { categoryId } = req.params;

        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        const services = await Service.find({
            category: categoryId,
            availability: true
        }).populate("category", "name");

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




module.exports = {
    createService, getAllServices,updateService,deleteService,getServicesByCategory
};