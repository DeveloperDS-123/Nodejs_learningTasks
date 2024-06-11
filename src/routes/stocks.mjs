import express from "express"
import { createStock, listStocks, removeStocks, updateStocks } from "../controllers/stocks.mjs"
const router = express.Router()

router.post("/create", createStock)
router.get("/list", listStocks)
router.delete("/remove", removeStocks)
router.put("/update", updateStocks)

export default router;