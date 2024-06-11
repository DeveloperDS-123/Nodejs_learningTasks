import express from "express"
const router = express.Router()
import {
    createTax,
    removeTax,
    updateTax,
    listTax,
} from "../controllers/tax.mjs"

router.post("/create", createTax)
router.delete("/remove/:id", removeTax)
router.patch("/update", updateTax)
router.get("/list", listTax)

export default router
