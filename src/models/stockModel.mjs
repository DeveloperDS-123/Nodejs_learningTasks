import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product" 
    },
    price: {
        type: Number,
        required: true,
        min:[0, "Price must be integer"]
    },
    quantity: {
        type: Number,
        required: true,
        min:[0, "Quantity must be integer"]
    },
}, 
{
    timestamps: true
});

const Stock = mongoose.model("stock", stockSchema);
export default Stock