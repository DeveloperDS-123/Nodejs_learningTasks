import Category from "../models/categoryModel.mjs"
import Product from "../models/productModel.mjs"

const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body
        if (!name) {
            return res
                .status(400)
                .json({ status: false, message: "Name is required" })
        }
        if (!description) {
            return res
                .status(400)
                .json({ status: false, message: "Description is required" })
        }
        const existingCategory = await Category.findOne({ name })
        if (existingCategory) {
            return res
                .status(400)
                .json({ status: false, message: "category is already present" })
        }

        const newCategory = new Category({
            name,
            description,
        })
        const newCategoryDetail = await newCategory.save()
        console.log("newCategoryDetail", newCategoryDetail)
        res.status(201).json({
            status: true,
            message: "category created successfully",
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            Status: false,
            message: `Error is ${error.message}`,
        })
    }
}

const listCategory = async (req, res) => {
    try {
        const { name, page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        let query = {};
        if (name) {
            query.name = { $regex: name, $options: 'i' }; 
        }

        const categories = await Category.find(query).skip(skip).limit(limitNumber).lean();

        const totalCategories = await Category.countDocuments(query);

        res.status(200).json({
            categories,
            totalCategories,
            page: pageNumber,
            totalPages: Math.ceil(totalCategories / limitNumber)
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            message: `Error: ${error.message}`,
        });
    }
};


const updateCategory = async (req, res) => {
    try {
        const { _id } = req.query
        const { name, description } = req.body

        // Validate input
        if (!_id && (!_id || (!name && !description))) {
            return res.status(400).json({
                status: false,
                message:
                    "Please provide _id and at least one field to update (name or description)",
            })
        }

        // Create update object dynamically
        const updateData = {}
        if (name) updateData.name = name
        if (description) updateData.description = description

        // Find and update the category
        const categoryDetails = await Category.findByIdAndUpdate(
            _id,
            updateData,
            { new: true, runValidators: true }
        )

        // Check if the category exists
        if (!categoryDetails) {
            return res.status(404).json({
                status: false,
                message: "Category not found",
            })
        }

        // Respond with the updated category details
        res.status(200).json({
            status: true,
            message: "Category updated successfully",
            category: categoryDetails,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            Status: false,
            message: `Error is ${error.message}`,
        })
    }
}

const removeCategory = async (req, res) => {
    try {
        const { _id } = req.query
        if (!_id) {
            return res.status(400).json({ message: "Category ID is required" })
        }

        const productCount = await Product.countDocuments({ categoryId: _id })
        console.log("productCount", productCount)
        if (productCount > 0) {
            return res.status(400).json({
                message:
                    "Cannot delete category. It is associated with products. ",
            })
        }
        // Check if the category exists
        const category = await Category.findById(_id).lean()
        if (!category) {
            return res.status(404).json({
                status: false,
                message: "Category not found",
            })
        }

        // Delete the category
        await Category.findByIdAndDelete(_id)

        res.status(200).json({
            status: true,
            message: "Category deleted successfully",
        })
    } catch (error) {
        console.error("Error deleting category", error)
        res.status(500).json({
            Status: false,
            message: `Error is ${error.message}`,
        })
    }
}

export { createCategory, listCategory, updateCategory, removeCategory }
