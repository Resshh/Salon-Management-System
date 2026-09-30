const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
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




module.exports = {
    registerUser, loginUser
};