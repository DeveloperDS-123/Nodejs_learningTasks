import express from "express";
const router = express.Router();
import {createCategory, listCategory, updateCategory, removeCategory} from "../controllers/category.mjs"
import {verifyToken} from "../middlewares/verifytoken.mjs"

router.post("/create", verifyToken, createCategory );
router.get("/list", verifyToken, listCategory );
router.put("/update",verifyToken, updateCategory)
router.delete("/remove",verifyToken, removeCategory)


export default router;