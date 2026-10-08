require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("./models/userModel");
const db = require("./connection");

const createAdmin = async () => {

    try {

        // The admin login comes from .env, so no password is written in the code
        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            console.error("Add ADMIN_EMAIL and ADMIN_PASSWORD to backend/.env first");
            process.exit(1);
        }

        if (process.env.ADMIN_PASSWORD.length < 8) {
            console.error("ADMIN_PASSWORD must be at least 8 characters long");
            process.exit(1);
        }

        await db();

        const existingAdmin = await User.findOne({
            role: "admin"
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

        const admin = new User({
            name: "Admin",
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            phone: "9999999999",
            gender: "Other",
            dateOfBirth: "2000-01-01",
            role: "admin"
        });

        await admin.save();

        console.log("Admin created successfully");

        process.exit();

    } catch (error) {

        console.error("Error creating admin:", error);
        process.exit(1);

    }
};

createAdmin();