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

// import mongoose from "mongoose"

// const cartItemSchema = new mongoose.Schema({
//   products : {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "stocks"
//   }
// })

// const cartSchema = new mongoose.Schema({
//     userId: String,
//     invoiceNumber: Number,
//     items: [cartItemSchema],
//     totalPriceWithTax: Number,
//     totalPriceWithoutTax: Number,
//     totalProducts: { type: Number, default: 0 },
// })

// // Define a pre-save hook to update the totalProducts field
// cartSchema.pre("save", function (next) {
//     // Calculate the total number of products
//     const totalProducts = this.items.reduce(
//         (acc, item) => acc + item.quantity,
//         0
//     )
//     // Update the totalProducts field
//     this.totalProducts = totalProducts
//     next()
// })

// const Cart = mongoose.model("Cart", cartSchema)

// export default Cart
