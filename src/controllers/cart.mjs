import Cart from "../models/cartModel.mjs"
import Stock from "../models/stockModel.mjs"
import User from "../models/userModel.mjs"

// Function to generate a unique invoice number
const generateInvoiceNumber = () => {
    return `INV-${Date.now()}`
}

const createCart = async (req, res) => {
    try {
        const userId = req.user.userId
        const { products } = req.body

        // Validate input
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Invalid input" })
        }

        let totalPriceWithoutTax = 0
        let totalProducts = 0
        let totalPriceWithTax = 0
        const itemsDetails = [] // Store details of each stock item

        console.log("Received products:", products)

        for (const stockItem of products) {
            const stock_id = stockItem.stock_id

            const requestedQuantity = parseInt(stockItem.quantity, 10) // Convert quantity to a number

            console.log(
                `Processing stock item with ID: ${stock_id}, Quantity: ${requestedQuantity}`
            )

            const stock = await Stock.findById(stock_id).populate({
                path: "productId",
                populate: {
                    path: "taxId",
                    model: "tax",
                },
            })

            if (!stock) {
                return res.status(400).json({
                    message: `Stock item with ID ${stock_id} not found`,
                })
            }

            if (requestedQuantity > stock.quantity) {
                return res.status(400).json({
                    message: `Item with ID ${stock_id} is out of stock. Available quantity: ${stock.quantity}`,
                })
            }

            const product = stock.productId
            const tax = product.taxId

            if (!product || !tax) {
                return res.status(400).json({
                    message: `Product or tax information not found for stock item with ID ${stock_id}`,
                })
            }

            const taxRate = tax.type === "percentage" ? tax.value / 100 : 0
            const productTotalPriceWithoutTax = stock.price * requestedQuantity
            let productTotalPriceWithTax =
                tax.type === "fixed"
                    ? productTotalPriceWithoutTax + tax.value
                    : productTotalPriceWithoutTax * (1 + taxRate)

            productTotalPriceWithTax = parseFloat(
                productTotalPriceWithTax.toFixed(2)
            )

            // Add details of the stock item
            itemsDetails.push({
                productId: product._id,
                stockId: stock._id,
                quantity: requestedQuantity,
                priceWithTax: productTotalPriceWithTax,
                priceWithoutTax: productTotalPriceWithoutTax,
            })

            totalProducts += requestedQuantity
            totalPriceWithoutTax += productTotalPriceWithoutTax
            totalPriceWithTax += productTotalPriceWithTax
        }
        console.log(`Updated total products: ${totalProducts}`)

        const newCart = new Cart({
            userId: userId,
            invoiceNumber: generateInvoiceNumber(),
            products: itemsDetails,
            totalPriceWithTax,
            totalPriceWithoutTax,
            totalProducts,
        })
        console.log("Final total products:", newCart.totalProducts)
        await newCart.save()

        res.status(201).json(newCart)
    } catch (error) {
        console.error("Error creating cart:", error)
        res.status(500).json({
            Status: false,
            message: `Error is ${error.message}`,
        })
    }
}

const listCart = async (req, res) => {
    try {
        const { page = 1, limit = 10, invoiceNumber, userId } = req.query // Default values for page and limit
        console.log("invoiceNumber", invoiceNumber)
        console.log(page)
        console.log(limit)
        console.log(req.query)

        let query = {}
        let skip = (parseInt(page) - 1) * parseInt(limit)

        if (invoiceNumber) {
            query.invoiceNumber = invoiceNumber
        }
        if (userId) {
            query.userId = userId
        }

        const totalResults = await Cart.countDocuments(query)
        const totalPages = Math.ceil(totalResults / limit)

        const userDetails = await User.findById(userId);
        const userName = userDetails.name;
        const cartList = await Cart.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .lean()
        res.status(200).json({
            message: "Cart list",
            userName: userName,
            productList: cartList,
            page: parseInt(page),
            limit: parseInt(limit),
            skip: skip,
            totalPages: totalPages,
            totalResults: totalResults,
        })
    } catch (error) {
        console.error("Error listing cart:", error)
        res.status(500).json({
            Status: false,
            message: `Error is ${error.message}`,
        })
    }
}

export { createCart, listCart }
