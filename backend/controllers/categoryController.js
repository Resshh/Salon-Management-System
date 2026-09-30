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

module.exports = {
    createCategory
};