require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("./models/userModel");
const db = require("./connection");

const createAdmin = async () => {

    try {

        await db();

        const existingAdmin = await User.findOne({
            role: "admin"
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash("Admin@123", 10);

        const admin = new User({
            name: "Admin",
            email: "admin@gmail.com",
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