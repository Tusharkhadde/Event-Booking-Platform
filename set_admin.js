require('dotenv').config();
const mongoose = require('mongoose');

// Config
const MONGO_URI = process.env.MONGO_URI;
const ADMIN_EMAIL = "admin@gmail.com";

async function setAdmin() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        
        const userSchema = new mongoose.Schema({
            email: { type: String, required: true, unique: true },
            role: { type: String, default: "user" }
        });

        const User = mongoose.models.User || mongoose.model('User', userSchema);

        const existing = await User.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            console.log(`User ${ADMIN_EMAIL} found. Updating role to admin...`);
            existing.role = "admin";
            await existing.save();
            console.log("Admin role updated successfully.");
        } else {
            console.log(`User ${ADMIN_EMAIL} not found. Please register this email first or provide a password to create it.`);
        }

    } catch (error) {
        console.error("Error updating admin:", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

setAdmin();
