import User from "../models/userModel.mjs"
import { hashPassword } from "../constants.mjs" // Your password hashing utility function
import fs from "fs"

import csvtojson from 'csvtojson';
// Route for CSV file upload
const uploadFile = async (req, res) => {
    try {
        // Check if file is provided
        if (!req.file) {
            return res.status(400).json({ message: 'CSV file is required' });
        }

        // Parse CSV file and convert data to JSON
        const jsonArray = await csvtojson().fromFile(req.file.path);

        // Iterate over parsed user details and create accounts
        for (const user of jsonArray) {
            const { name, email, password } = user;

            // Validate required fields
            if (!name || !email || !password) {
                console.log(`Skipping user ${email}: Missing required fields`);
                continue;
            }

            // Check if email already exists
            const existingUser = await User.findOne({ email }).lean();
            if (existingUser) {
                console.log(`Skipping user ${email}: Email already exists`);
                continue;
            }

            // Hash the password before saving
            const hashedPassword = hashPassword(password);

            // Create new user instance
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
            });

            // Save user to the database
            await newUser.save();
            console.log(`User ${email} created successfully`);
        }

        // Remove uploaded file
        fs.unlinkSync(req.file.path);

        res.status(200).json({ message: 'Users created successfully' });
    } catch (error) {
        console.error('Error uploading CSV file:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default uploadFile
