import User from "../models/userModel.mjs"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import nodemailer from "nodemailer"
dotenv.config({
    path: "./env",
})
import OTP from "../models/otpModel.mjs"
// import { hashPassword } from "../constants.mjs"

const hashConfig = {
    hashBytes: parseInt(process.env.HASH_BYTES) || 32,
    saltBytes: parseInt(process.env.SALT_BYTES) || 16,
    iterations: parseInt(process.env.ITERATIONS) || 10000,
    digest: process.env.DIGEST || "sha512",
}

function hashPassword(password) {
    const { iterations, hashBytes, digest } = hashConfig
    const salt = crypto.randomBytes(16).toString("hex")
    const hash = crypto
        .pbkdf2Sync(password, salt, iterations, hashBytes, digest)
        .toString("hex")
    console.log(`Generated hash for password "${password}": ${salt}$${hash}`)
    return `${salt}$${hash}`
}

function verifyPassword(password, combined) {
    const { iterations, hashBytes, digest } = hashConfig
    const [salt, originalHash] = combined.split("$")
    const hash = crypto
        .pbkdf2Sync(password, salt, iterations, hashBytes, digest)
        .toString("hex")
    console.log(
        `Verifying password "${password}": ${hash} against original: ${originalHash}`
    )
    return hash === originalHash
}

const SECRET_KEY = process.env.SECRET_KEY

const signup = async (req, res) => {
    try {
        const { name, email, password, otp, phoneNumber } = req.body
        console.log("name", name)
        console.log("email", email)

        console.log("password", password)
        console.log("otp", otp)

        if (!name) {
            return res
                .status(400)
                .json({ status: false, message: "Name is required" })
        }
        if (!email) {
            return res.status(400).json({
                status: false,
                message: "Email is required",
            })
        }
        if (!phoneNumber) {
            return res.status(400).json({
                status: false,
                message: "Phone Number is required",
            })
        }
        if (!password) {
            return res.status(400).json({
                status: false,
                message: "Password is required",
            })
        }
        if (!otp) {
            return res.status(400).json({
                status: false,
                message: "OTP is required",
            })
        }
        const existingEmailUser = await User.findOne({
            email: email,
        }).lean()
        if (existingEmailUser) {
            return res
                .status(400)
                .json({ status: false, message: "Email already exists" })
        }
        const response = await OTP.find({ email })
            .sort({ createdAt: -1 })
            .limit(1)
        if (response.length === 0 || otp !== response[0].otp) {
            return res.status(400).json({
                success: false,
                message: "The OTP is not valid",
            })
        }
        // Hash the password before saving it
        const hashedPassword = hashPassword(password)

        // Create a new student instance with the provided data
        const newStudent = new User({
            name: name.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            phoneNumber: phoneNumber,
        })

        // Save the new student to the database
        await newStudent.save()

        // Return success response
        res.status(200).json({
            status: true,
            message: "User signed up successfully",
        })
    } catch (error) {
        console.error("Error:", error.message)
        res.status(500).json({
            Status: false,
            message: `Error is ${error.message}`,
        })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                status: false,
                message: "Email and password are required",
            })
        }

        const userDetails = await User.findOne({
            email: email.toLowerCase(),
        }).lean()

        if (!userDetails) {
            return res.status(400).json({
                status: false,
                message: "Invalid email or password",
            })
        }

        console.log("Hashed password in DB:", userDetails.password)

        const trimmedPassword = password.trim() // Ensure no leading/trailing spaces
        const isPasswordValid = verifyPassword(
            trimmedPassword,
            userDetails.password
        )
        console.log(`Password provided: "${trimmedPassword}"`)
        console.log("Password valid:", isPasswordValid)

        if (!isPasswordValid) {
            return res.status(400).json({
                status: false,
                message: "Invalid email or password",
            })
        }

        delete userDetails.password

        const token = jwt.sign(
            { userId: userDetails._id, email: userDetails.email },
            SECRET_KEY
        )

        res.json({
            status: true,
            token,
            user_Id: userDetails._id,
        })
    } catch (error) {
        console.error("Error:", error.message)
        res.status(500).json({
            status: false,
            message: `Error is ${error.message}`,
        })
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }

        const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
            expiresIn: "2h",
        })

        user.resetPasswordToken = token
        user.resetPasswordExpires = Date.now() + 2 * 60 * 60 * 1000

        await user.save()
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        })
        const mailOptions = {
            from: process.env.MAIL_HOST,
            to: email,
            subject: "Password Reset",
            text: "Password Reset",
            html: `
                <div >
                <h2>Password Reset </h2>
                <p style="color: #333;">
                        A password reset event has been triggered. The password reset window is limited to two hours.
                    </p>
                    <p style="color: #333;">
                        If you do not reset your password within two hours, you will need to submit a new request.
                    </p>
                    <p style="color: #333;">
                        If you didn't request a password reset, please ignore this email.
                    </p>
                    <p style="color: #333;">
                        To complete the password reset process, visit the following link:
                    </p>
                    <p>
                        <a
                            href="http://localhost:8000/api/user/resetpassword/${token}"
                            style="color: blue; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 10px; padding: 10px 15px; background-color: #f0f0f0; border-radius: 5px;"
                        >
                            Reset Password here
                        </a>
                    </p>
                </div>
            `,
        }

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return res.status(500).send({ message: err.message })
            }
            res.status(200).send({
                message:
                    "Please check your email inbox for a link to complete the reset.",
            })
        })
    } catch (error) {
        console.error("Error:", error.message)
        res.status(500).json({
            Status: false,
            message: `Error is ${error.message}`,
        })
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params
        console.log("tokeeeeeeeeeeeeeeeee", token)
        const { newPassword } = req.body
        if (!newPassword) {
            return res.status(400).json({ message: "password is required" })
        }
        console.log("passsssssssss", newPassword)

        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY)
        const userId = decoded.userId
        console.log("decodeduuuuuuuuuuuuuuuuu", decoded)
        console.log("userIdooooooooooo", userId)

        // Find the user by token and check if the token is expired
        const user = await User.findOne({
            _id: userId,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        })
        console.log("uerrrrrrrrrrrrrrrrrrr", user)
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" })
        }

        // Hash the new password
        const hashedPassword = hashPassword(newPassword)

        // Update the user's password
        user.password = hashedPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined

        await user.save()

        res.status(200).json({
            message: "Password has been reset successfully",
        })
    } catch (error) {
        console.error("Error:", error.message)
        res.status(500).json({
            Status: false,
            message: `Error is ${error.message}`,
        })
    }
}
export { signup, login, forgotPassword, resetPassword }
