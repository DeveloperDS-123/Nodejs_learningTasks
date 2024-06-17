import express from "express"
const router = express.Router()
import {
    createCart, listCart
    
} from "../controllers/cart.mjs"
import { verifyToken } from "../middlewares/verifytoken.mjs"

router.post("/create", verifyToken, createCart)
router.get("/listItems", verifyToken, listCart)

export default router
