import express from "express"
const app = express()

import connectDB from "./src/db/index.mjs"
import dotenv from "dotenv"
dotenv.config({
    path: "./env",
})
import userRoutes from "./src/routes/auth.mjs"
import categoryRoutes from "./src/routes/category.mjs"
import productRoutes from "./src/routes/product.mjs"
import cartRoutes from "./src/routes/cart.mjs"
import taxRoutes from "./src/routes/tax.mjs"
import stocksRoutes from "./src/routes/stocks.mjs"

app.use(express.json())

app.use("/api/users", userRoutes)
app.use("/api/category", categoryRoutes)
app.use("/api/product", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/tax", taxRoutes)
app.use("/api/stocks",stocksRoutes)

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port : ${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err)
    })
