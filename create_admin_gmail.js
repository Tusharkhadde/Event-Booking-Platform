require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Config
const MONGO_URI = process.env.MONGO_URI;
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";

async function createAdmin() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        
        const userSchema = new mongoose.Schema({
            username: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            role: { type: String, default: "user" },
            balance: { type: Number, default: 0 }
        });

        const User = mongoose.models.User || mongoose.model('User', userSchema);

        const existing = await User.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            console.log(`User ${ADMIN_EMAIL} found. Updating role to admin...`);
            existing.role = "admin";
            await existing.save();
            console.log("Admin role updated successfully.");
        } else {
            console.log("Creating new admin account for admin@gmail.com...");
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
            const newUser = new User({
                username: "Admin",
                email: ADMIN_EMAIL,
                password: hashedPassword,
                role: "admin",
                balance: 1000
            });
            await newUser.save();
            console.log("Admin account created successfully!");
        }

    } catch (error) {
        console.error("Error creating admin:", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

createAdmin();
