import mongoose from "mongoose"
import { DB_NAME } from "../constants.mjs"
import "dotenv/config"
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        )
        console.log(
            `\n Mongodb connected !! DB Host: ${connectionInstance.connection.host}`
        )
    } catch (error) {
        console.log("MONGODB CONNECTION failed", error)
        process.exit(1)
    }
}

export default connectDB ;
