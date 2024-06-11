import express from "express"
const router = express.Router()
import {
    createProduct,
    listProduct,
    deleteProduct,
    updateProduct
} from "../controllers/product.mjs"
import { verifyToken } from "../controllers/auth.mjs"

router.post("/create", createProduct)
router.get("/list",  listProduct)
router.delete("/remove", deleteProduct)
router.put("/update", updateProduct)

export default router
