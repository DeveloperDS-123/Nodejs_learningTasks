import Product from "../models/productModel.mjs"

export const createProduct = async (req, res) => {
    try {
        const { name, description, categoryId, taxId } = req.body

        if (!name) {
            return res.status(400).json({ message: "Name is required" })
        }

        if (!description) {
            return res.status(400).json({ message: "description is required" })
        }

        if (!categoryId) {
            return res.status(400).json({ message: "categoryId is required" })
        }
        if (!taxId) {
            return res.status(400).json({ message: "taxId is required" })
        }
        const existingProduct = await Product.findOne({ name }).lean()
        if (existingProduct) {
            res.status(400).json({
                status: false,
                message: "Product name is already exist",
            })
        }

        const newProduct = new Product({
            name,
            description,
            taxId,
            categoryId,
        })

        await newProduct.save()

        res.status(201).json({
            status: true,
            message: "Product created successfully",
        })
    } catch (error) {
        console.log("error", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const listProduct = async (req, res) => {
    try {
        let query = {}
        let page = req.query.page || 1
        let limit = req.query.limit || 10
        let skip = (page - 1) * limit

        if (req.query.categoryId) {
            query.categoryId = req.query.categoryId
        }
       
        if (req.query.name) {
            query.name = { $regex: req.query.name, $options: 'i' };
        } 
        console.log("query", query)
        const products = await Product.find(query)
            .populate("categoryId")
            .skip(skip)
            .limit(limit)
            .lean()
        const productDetails = {
            products,
            skip,
            page,
            limit,
        }
        res.status(200).json({ productDetails })
    } catch (error) {
        console.log("Error fetching products:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const { _id } = req.query
        console.log("idddddddddd", _id)

        // Check if the category exists
        const product = await Product.findById(_id).lean()
        if (!product) {
            return res.status(404).json({
                status: false,
                message: "product not found",
            })
        }

        // Delete the category
        await Product.findByIdAndDelete(_id)

        res.status(200).json({
            status: true,
            message: "product deleted successfully",
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const updateProduct = async (req, res) => {
    try {
        const { _id } = req.query
        const { name, description, categoryId, taxId } = req.body

        // Validate input
        if (
            !_id &&
            (!_id || (!name && !description && !categoryId && !taxId))
        ) {
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
        if (categoryId) updateData.categoryId = categoryId
        if (taxId) updateData.taxId = taxId

        // Find and update the category
        const productDetails = await Product.findByIdAndUpdate(
            _id,
            updateData,
            { new: true, runValidators: true }
        )

        // Check if the category exists
        if (!productDetails) {
            return res.status(404).json({
                status: false,
                message: "product not found",
            })
        }

        // Respond with the updated category details
        res.status(200).json({
            status: true,
            message: "product updated successfully",
            product: productDetails,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}
