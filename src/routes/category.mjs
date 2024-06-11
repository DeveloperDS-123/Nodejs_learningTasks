import express from "express";
const router = express.Router();
import {createCategory, listCategory, updateCategory, deleteCategory} from "../controllers/category.mjs"
// import {verifyToken} from "../controllers/auth.mjs"

router.post("/create",  createCategory );
router.get("/list",  listCategory );
router.put("/update", updateCategory)
router.delete("/remove", deleteCategory)


export default router;