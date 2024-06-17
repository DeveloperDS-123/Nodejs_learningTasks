import express from "express"
const router = express.Router()
import {
    createProduct,
    listProduct,
    deleteProduct,
    updateProduct
} from "../controllers/product.mjs"
import { verifyToken } from "../middlewares/verifytoken.mjs"

router.post("/create",verifyToken, createProduct)
router.get("/list", verifyToken,  listProduct)
router.delete("/remove", verifyToken, deleteProduct)
router.put("/update",verifyToken, updateProduct)

export default router
