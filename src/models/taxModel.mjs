import mongoose from "mongoose"

const taxSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String,
        },
        type: {
            type: String,
            enum: ["percentage", "fixed"],
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
    },
    {
        timeStamps: true,
    }
)

const Tax = new mongoose.model("tax", taxSchema)
export default Tax
