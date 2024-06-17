import mongoose from "mongoose"

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
        },
        products: [
            {
                stockId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Stock",
                    required: true,
                },
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                priceWithTax: {
                    type: Number,
                    required: true,
                },
                priceWithoutTax: {
                    type: Number,
                    required: true,
                },
            },
        ],
        totalPriceWithTax: {
            type: Number,
            required: true,
            min: [0, "Total price with tax must be a positive number"],
        },
        totalPriceWithoutTax: {
            type: Number,
            required: true,
            min: [0, "Total price without tax must be a positive number"],
        },
        totalProducts: {
            type: Number,
            required: true,
            min: [0, "Total products must be a positive number"],
        },
    },
    {
        timestamps: true,
    }
)

const Cart = mongoose.model("cart", cartSchema)
export default Cart

