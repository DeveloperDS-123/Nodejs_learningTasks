import mongoose from "mongoose"

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: Number,
    },
    resetPasswordToken: {
        type: String,
        trim: true,
    },
    resetPasswordExpires: Date,
})

const User = mongoose.model("user", userSchema)
export default User
