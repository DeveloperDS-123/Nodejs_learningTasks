import express from "express";
import { signup, login, verifyToken } from "../controllers/auth.mjs";
import sendOTP from "../controllers/otp.mjs";
import uploadfile from "../controllers/uploadfile.mjs";
import multer from 'multer';
const router = express.Router();


const upload = multer({ dest: 'uploads/' }); 


router.post("/signup", signup);
router.post("/login", login);
router.post("/sendotp", sendOTP)
router.post("/upload", upload.single("file"), uploadfile)

export default router;
