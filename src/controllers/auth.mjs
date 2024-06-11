import User from "../models/userModel.mjs"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

import OTP from "../models/otpModel.mjs"
import { hashPassword } from "../constants.mjs"
dotenv.config({
    path: "./env",
})
const hashConfig = {
    hashBytes: parseInt(process.env.HASH_BYTES),
    saltBytes: parseInt(process.env.SALT_BYTES),
    iterations: parseInt(process.env.ITERATIONS),
    digest: process.env.DIGEST,
}

 const SECRET_KEY = process.env.SECRET_KEY;


// Define verifyPassword function
function verifyPassword(password, combined) {
    const { iterations, hashBytes, digest } = hashConfig
    const [salt, originalHash] = combined.split("$")
    const hash = crypto
        .pbkdf2Sync(password, salt, iterations, hashBytes, digest)
        .toString("hex")
    return hash === originalHash
}

const signup = async (req, res) => {
    try {
        const { name, email, password, otp } = req.body
        console.log("name", name)
        console.log("email", email)

        console.log("password", password)
        console.log("otp", otp)

        if (!name) {
            res.status(400).json({ status: false, message: "Name is required" })
            return
        }
        if (!email) {
            res.status(400).json({
                status: false,
                message: "Email is required",
            })
            return
        }

        if (!password) {
            res.status(400).json({
                status: false,
                message: "Password is required",
            })
            return
        }
        if (!otp) {
            res.status(400).json({
                status: false,
                message: "OTP is required",
            })
            return
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
            name: name,
            email: email,
            password: hashedPassword,
        })

        // Save the new student to the database
        await newStudent.save()

        // Return success response
        res.status(200).json({
            status: true,
            message: "User signed up successfully",
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}
const login = async (req, res) => {
    if (!req.body.email) {
        res.status(400).json({ status: false, message: "Email is required" })
        return
    }
    if (!req.body.password) {
        res.status(400).json({ status: false, message: "Password is required" })
        return
    }
    try {
        const { email, password } = req.body
        const userDetails = await User.findOne({ email }).lean()

        if (!userDetails) {
            res.status(400).json({
                status: false,
                message: "Invalid email or password",
            })
            return
        }
        // Password Hashing
        const passwordParts = userDetails.password.split(":")

        // Password verifying
        const isPasswordValid = verifyPassword(password, userDetails.password)

        if (!isPasswordValid) {
            res.status(400).json({
                status: false,
                message: "Invalid email or password",
            })
            return
        }
        // end
        console.log("uuuuuuuuuuuuuuuuuuuuuuuuuuu", userDetails)
        delete userDetails.password
        const token = await jwt.sign(
            { userId: userDetails._id, email: User.email },
            SECRET_KEY
        )
        res.json({
            status: true,
            token,
            user_Id: userDetails._id,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
        })
    }
}

const verifyToken = async (req, res, next) => {
    try {
      console.log("req.headers req.headers --- ", req.headers.authorization);
      if (!req.headers.authorization) {
        res.status(400).json({ message: "Invalid token" });
        return;
      }
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        res.status(400).json({ message: "Invalid token" });
        return;
      }
      const decoded = jwt.verify(token, SECRET_KEY);
      console.log("deddddddddddddddd", decoded)
      const user = await User.findById(decoded.userId).select(
        "-password"
      );
      console.log("user", user);
      if (!user) {
        res.status(400).json({ message: "Invalid User" });
        return;
      }
      console.log("decoded----", decoded);
      req.user = decoded;
  
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Invalid token" });
    }
  };

export { signup, login, verifyToken }
