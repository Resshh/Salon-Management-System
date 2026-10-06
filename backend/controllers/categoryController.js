const Category = require("../models/categoryModel");

const createCategory = async (req, res) => {

    try {

        const { name } = req.body;

        const existingCategory = await Category.findOne({ name });

        if (existingCategory) {
            return res.status(400).json({
                message: "Category already exists"
            });
        }

        const newCategory = new Category({
            name
        });

        await newCategory.save();

        return res.status(201).json({
            message: "Category created successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Category creation failed",
            error: error.message
        });

    }

};

const getAllCategories = async (req, res) => {

    try {

        const categories = await Category.find().sort({ name: 1 });

        return res.status(200).json({
            message: "Categories fetched successfully",
            categories
        });

    } catch (error) {

        return res.status(500).json({
            message: "Failed to fetch categories",
            error: error.message
        });

    }

};

module.exports = {
    createCategory,
    getAllCategories
};