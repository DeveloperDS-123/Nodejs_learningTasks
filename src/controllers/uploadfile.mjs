import User from "../models/userModel.mjs"
import crypto from "crypto"

import fs from "fs"

import csvtojson from "csvtojson"

const hashConfig = {
    hashBytes: parseInt(process.env.HASH_BYTES) || 32,
    saltBytes: parseInt(process.env.SALT_BYTES) || 16,
    iterations: parseInt(process.env.ITERATIONS) || 10000,
    digest: process.env.DIGEST || "sha512",
}

export function hashPassword(password) {
    const { iterations, hashBytes, digest } = hashConfig
    const salt = crypto.randomBytes(16).toString("hex")
    const hash = crypto
        .pbkdf2Sync(password, salt, iterations, hashBytes, digest)
        .toString("hex")
    console.log(`Generated hash for password "${password}": ${salt}$${hash}`)
    return `${salt}$${hash}`
} 

// Route for CSV file upload

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "CSV file is required" })
        }

        const jsonArray = await csvtojson().fromFile(req.file.path)

        for (const user of jsonArray) {
            const { name, email, password } = user

            if (!name || !email || !password) {
                console.log(`Skipping user ${email}: Missing required fields`)
                continue
            }

            const existingUser = await User.findOne({
                email: email.toLowerCase(),
            }).lean()
            if (existingUser) {
                console.log(`Skipping user ${email}: Email already exists`)
                continue
            }

            const trimmedPassword = password.trim() // Ensure no leading/trailing spaces
            const hashedPassword = hashPassword(trimmedPassword)
            console.log(
                `Saving user ${email} with hashed password: ${hashedPassword}`
            )

            const newUser = new User({
                name: name.toLowerCase(),
                email: email.toLowerCase(),
                password: hashedPassword,
            })

            await newUser.save()
            console.log(`User ${email} created successfully`)
        }

        fs.unlinkSync(req.file.path)

        res.status(200).json({ message: "Users created successfully" })
    } catch (error) {
        console.error("Error uploading CSV file:", error.message)
        res.status(500).json({
            status: false,
            message: `Error is ${error.message}`,
        })
    }
}

export default uploadFile
