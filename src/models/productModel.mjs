import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
    },
    taxId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tax",
    },
})

const Product = mongoose.model("product", productSchema)
export default Product
