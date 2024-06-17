import User from "../models/userModel.mjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config({
    path: "./env",
})
const SECRET_KEY = process.env.SECRET_KEY
 
export const verifyToken = async (req, res, next) => {
    try {
        console.log("req.headers req.headers --- ", req.headers.authorization)
        if (!req.headers.authorization) {
            res.status(400).json({ message: "Invalid token" })
            return
        }
        const token = req.headers.authorization.split(" ")[1]
        if (!token) {
            res.status(400).json({ message: "Invalid token" })
            return
        }
        const decoded = jwt.verify(token, SECRET_KEY)
        const user = await User.findById(decoded.userId).select("-password")
        console.log("user", user)
        if (!user) {
            res.status(400).json({ message: "Invalid User" })
            return
        }
        console.log("decoded----", decoded)
        req.user = decoded

        next()
    } catch (error) {
        console.error(error)
        res.status(401).json({ message: "Invalid token" })
    }
}