import express from "express"
import { createStock, listStocks, deleteStocks, updateStocks } from "../controllers/stocks.mjs"
const router = express.Router()

import { verifyToken } from "../middlewares/verifytoken.mjs"
router.post("/create", verifyToken, createStock)
router.get("/list",verifyToken, listStocks)
router.delete("/remove",verifyToken, deleteStocks)
router.put("/update", verifyToken, updateStocks)

export default router;