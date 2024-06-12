import Tax from "../models/taxModel.mjs"
import Product from "../models/productModel.mjs"
const createTax = async (req, res) => {
    try {
        const { name, description, type, value } = req.body

        if (!name || !description || !type || !value) {
            return res
                .status(400)
                .json({ message: "Please provide all required fields" })
        }

        if (type !== "percentage" && type !== "fixed") {
            return res.status(400).json({
                message: "Invalid type. Type must be 'percentage' or 'fixed'",
            })
        }

        const existingTax = await Tax.findOne({ name }).lean()
        if (existingTax) {
            return res
                .status(400)
                .json({ message: "A tax with this name already exists" })
        }

        const taxDetails = await new Tax({
            name,
            description,
            type,
            value,
        })

        await taxDetails.save()
        res.status(200).json({
            status: true,
            message: "Tax created successfully",
            tax: taxDetails,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const removeTax = async (req, res) => {
    try {
        const { _id } = req.query
        if (!_id) {
            return res.status(400).json({ message: "TaxId is required" })
        }
        const productCount = await Product.countDocuments({taxId: _id})
        console.log("product count", productCount)
        if (productCount > 0) {
            return res
                .status(400)
                .json({
                    message:
                        "Cannot delete tax. It is associated with products.",
                })
        }
        const deletedTax = await Tax.findByIdAndDelete(_id)

        if (!deletedTax) {
            return res.status(404).json({ message: "Tax not found" })
        }
        res.status(200).json({ message: "Tax deleted successfully." })
    } catch (error) {
        console.log("Error deleting tax:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const updateTax = async (req, res) => {
    try {
        const { _id } = req.query
        const { name, description, type, value } = req.body
        console.log("idddddddd", _id)
        // Validate required fields
        if (!name || !description || !type || !value) {
            return res
                .status(400)
                .json({ message: "Please provide all required fields" })
        }

        // Validate type field
        if (type !== "percentage" && type !== "fixed") {
            return res.status(400).json({
                message: "Invalid type. Type must be 'percentage' or 'fixed'",
            })
        }

        // Find tax document by ID and update it
        const updatedTax = await Tax.findByIdAndUpdate(
            _id,
            { name, description, type, value },
            { new: true }
        )

        // Check if tax document exists
        if (!updatedTax) {
            return res.status(404).json({ message: "Tax document not found" })
        }

        // Return success response with updated tax document
        res.status(200).json({
            status: true,
            message: "Tax updated successfully",
            tax: updatedTax,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const listTax = async (req, res) => {
    try {
        const { name, taxId } = req.query
        let query = {}

        let page = parseInt(req.query.page) || 1
        let limit = parseInt(req.query.limit) || 10
        let skip = (page - 1) * limit

        if (name) {
            return (query.name = name)
        }
        if (taxId) {
            return (query._id = taxId)
        }

        const taxList = await Tax.find(query).skip(skip).limit(limit).lean()
        res.status(200).json({
            taxList,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export { createTax, removeTax, updateTax, listTax }
