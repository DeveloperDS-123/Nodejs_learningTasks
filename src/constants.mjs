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

export function hashPassword(password) {
    const { iterations, hashBytes, digest } = hashConfig
    const salt = crypto.randomBytes(16).toString("hex")
    const hash = crypto
        .pbkdf2Sync(password, salt, iterations, hashBytes, digest)
        .toString("hex")
    console.log(`Generated hash for password "${password}": ${salt}$${hash}`)
    return `${salt}$${hash}`
}

export function verifyPassword(password, combined) {
    const { iterations, hashBytes, digest } = hashConfig
    const [salt, originalHash] = combined.split("$")
    const hash = crypto
        .pbkdf2Sync(password, salt, iterations, hashBytes, digest)
        .toString("hex")
    console.log(
        `Verifying password "${password}" with salt "${salt}": ${hash} against original: ${originalHash}`
    )
    return hash === originalHash
}
