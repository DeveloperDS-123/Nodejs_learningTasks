import express from "express"
const router = express.Router()
import {
    createTax,
    removeTax,
    updateTax,
    listTax,
} from "../controllers/tax.mjs"

import { verifyToken } from "../middlewares/verifytoken.mjs"
router.post("/create", verifyToken, createTax)
router.delete("/remove", verifyToken, removeTax)
router.patch("/update", verifyToken, updateTax)
router.get("/list", verifyToken, listTax)

export default router
