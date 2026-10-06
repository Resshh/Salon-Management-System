const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Stylist = require("../models/stylistModel");
const sendEmail = require("../utils/emailService");
const registerUser = async (req, res) => {
    try {

        const { name, email, password, phone, gender, dateOfBirth } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            gender,
            dateOfBirth,
            role: "customer"
        });

        await newUser.save();

        await sendEmail(
            email,
            "Welcome to Beauté Salon",
            `Hi ${name}, your account has been created. You can now log in and book appointments.`
        );

        return res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Registration failed",
            error: error.message
        });

    }

};



const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }

    const token = jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );
    return res.status(200).json({
        message: "Login successful",
        token: token,
        role: user.role
    });
};

const createStylistUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            phone,
            gender,
            dateOfBirth,
            specialization
        } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStylist = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            gender,
            dateOfBirth,
            role: "stylist"
        });

        await newStylist.save();

        // Every stylist also needs a Stylist profile.
        // The stylist fills in services and schedule after logging in.
        await Stylist.create({
            user: newStylist._id,
            specialization: specialization || "Stylist",
            services: [],
            workingSchedule: []
        });

        await sendEmail(
            email,
            "Your Beauté Salon stylist account",
            `Hi ${name}, the salon admin created a stylist account for you. Log in with this email address, then set your services and working schedule.`
        );

        return res.status(201).json({
            message: "Stylist user created successfully",
            userId: newStylist._id
        });

    } catch (error) {

        return res.status(500).json({
            message: "Stylist user creation failed",
            error: error.message
        });

    }
};


// Logged-in user reads their own details (membership, loyalty points)
const getMe = async (req, res) => {

    try {

        const user = await User.findById(req.user.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User fetched successfully",
            user
        });

    } catch (error) {

        return res.status(500).json({
            message: "Failed to fetch user",
            error: error.message
        });

    }
};


module.exports = {
    registerUser, loginUser, createStylistUser, getMe
};