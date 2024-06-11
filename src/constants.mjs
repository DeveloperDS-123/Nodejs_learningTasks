export const DB_NAME = "dummyTestData"
import crypto from "crypto"
import dotenv from "dotenv"

dotenv.config({
    path: "./env",
})

const hashConfig = {
    hashBytes: parseInt(process.env.HASH_BYTES) || 32,
    saltBytes: parseInt(process.env.SALT_BYTES) || 16,
    iterations: parseInt(process.env.ITERATIONS) || 10000,
    digest: process.env.DIGEST || "sha512",
}

// Password Hashing
export function hashPassword(password) {
    const { iterations, hashBytes, digest, saltBytes } = hashConfig
    const salt = crypto.randomBytes(saltBytes).toString("hex")
    const hash = crypto
        .pbkdf2Sync(password, salt, iterations, hashBytes, digest)
        .toString("hex")
    return [salt, hash].join("$")
}
