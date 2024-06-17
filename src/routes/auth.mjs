import express from "express"
import {
    signup,
    login,
    forgotPassword,
    resetPassword,
} from "../controllers/auth.mjs"
import sendOTP from "../controllers/otp.mjs"
import uploadfile from "../controllers/uploadfile.mjs"
import multer from "multer"
const router = express.Router()

const upload = multer({ dest: "uploads/" })

router.post("/signup", signup)
router.post("/login", login)
router.post("/sendotp", sendOTP)
//multiple users signup at once using csv file containing their details
router.post("/upload", upload.single("file"), uploadfile)

//Forgot password
router.post("/forgotpassword", forgotPassword)
router.post("/resetpassword/:token", resetPassword)

export default router
