import Product from "../models/productModel.mjs"
import Stock from "../models/stockModel.mjs"
import Cart from "../models/cartModel.mjs"
const createStock = async (req, res) => {
    try {
        const { productId, price, quantity } = req.body
        if (!productId || price == null || quantity == null) {
            return res
                .status(400)
                .json({ message: "Please fill all the fields" })
        }
        const existingProduct = await Product.findById(productId).lean()
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" })
        }

        // Check if stock for the product already exists
        const existingStock = await Stock.findOne({ productId }).lean()
        if (existingStock) {
            return res
                .status(400)
                .json({ message: "Stock for this product is already present" })
        }

        // Create new stock
        const newStock = new Stock({
            productId,
            price,
            quantity,
        })

        await newStock.save()

        res.status(201).json({
            status: true,
            message: "Stock created successfully",
            stock: newStock,
        })
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message })
        }
        console.error("Error creating stock:", error)
        res.status(500).json({
            Status: false,
            message: `Error is ${error.message}`,
        })
    }
}

const listStocks = async (req, res) => {
    try {
        let query = {}
        let page = req.query.page || 1
        let limit = req.query.limit || 10
        let skip = (page - 1) * limit

        if (req.query.productId) {
            query.productId = req.query.productId
        }

        console.log("query", query)
        const stocks = await Stock.find(query)
            .populate("productId")
            .skip(skip)
            .limit(limit)
            .lean()
        const stockDetails = {
            stocks,
            skip,
            page,
            limit,
        }
        res.status(200).json({ stockDetails })
    } catch (error) {
        console.log("Error fetching stocks:", error)
        res.status(500).json({
            Status: false,
            message: `Error is ${error.message}`,
        })
    }
}

const deleteStocks = async (req, res) => {
    try {
        const { _id } = req.query

        // Check if _id is provided
        if (!_id) {
            return res.status(400).json({ message: "Stock ID is required" })
        }
const stockCount = await Cart.countDocuments({"products.stockId": _id})

if(stockCount>0){
    return res
    .status(400)
    .json({
        message:
            "Cannot delete stock. It is associated with Cart.",
    })
}
        // Find the stock by ID
        const stock = await Stock.findById(_id)

        // If stock is not found, return an error
        if (!stock) {
            return res.status(404).json({ message: "Stock not found" })
        }

        // Remove the stock using the static method on the Stock model
        await Stock.findByIdAndDelete(_id)

        // Return success response
        res.status(200).json({
            status: true,
            message: "Stock removed successfully",
        })
    } catch (error) {
        console.error("Error removing stock:", error)
        res.status(500).json({
            Status: false,
            message: `Error is ${error.message}`,
        })
    }
}

const updateStocks = async (req, res) => {
    try {
        const { _id } = req.query
        const { price, quantity } = req.body

        // Check if _id is provided
        if (!_id) {
            return res.status(400).json({ message: "Stock ID is required" })
        }

        // Validate request body
        if (price == null && quantity == null) {
            return res.status(400).json({
                message:
                    "At least one field (price or quantity) must be provided for update",
            })
        }
        console.log("_iddddddddddddddddd", _id)
        // Find the stock by ID
        const stock = await Stock.findById(_id)
        console.log("stoccccc", stock)
        // If stock is not found, return an error
        if (!stock) {
            return res.status(404).json({ message: "Stock not found" })
        }

        // Update the stock fields if they are provided
        if (price != null) stock.price = price
        if (quantity != null) stock.quantity = quantity

        // Save the updated stock
        await stock.save()

        // Return success response
        res.status(200).json({
            status: true,
            message: "Stock updated successfully",
            stock: stock,
        })
    } catch (error) {
        console.error("Error updating stock:", error.message)
        res.status(500).json({
            Status: false,
            message: `Error is ${error.message}`,
        }) 
    }
}

export { createStock, listStocks, deleteStocks, updateStocks }
