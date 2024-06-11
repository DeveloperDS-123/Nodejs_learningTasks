import express from "express"
const router = express.Router()
import {
    createCart,
    removeCart,
    getCart,
    removeCartItem,
} from "../controllers/cart.mjs"
import { verifyToken } from "../controllers/auth.mjs"

router.post("/create", verifyToken, createCart)
router.delete("/delete", verifyToken, removeCart)
router.get("/cartItems", verifyToken, getCart)
router.delete("/item/:productId", verifyToken, removeCartItem)

export default router
