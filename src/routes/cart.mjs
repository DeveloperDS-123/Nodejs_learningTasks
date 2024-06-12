import express from "express"
const router = express.Router()
import {
    createCart, listCart
    
} from "../controllers/cart.mjs"
import { verifyToken } from "../controllers/auth.mjs"

router.post("/create", verifyToken, createCart)
// router.delete("/delete", verifyToken, deleteCart)
router.get("/listItems", verifyToken, listCart)
// router.delete("/item/:productId", verifyToken, deleteCartItem)

export default router
