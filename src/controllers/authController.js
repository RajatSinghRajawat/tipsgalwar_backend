const { Signup } = require("../models/authmodals");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ================= REGISTER =================
const register = async (req, res) => {
    try {
        const { fullName, email, mobile_Number, password } = req.body;

        if (!fullName || !email || !mobile_Number || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await Signup.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await Signup.create({
            fullName,
            email,
            mobile_Number,
            password: hashedPassword
        });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(201).json({
            message: "Register successful",
            user,
            token
        });

    } catch (error) {
        res.status(500).json({ message: "Register error", error });
    }
};

// ================= LOGIN =================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email & Password required" });
        }

        const user = await Signup.findOne({ email }).select("+password");

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful",
            user,
            token
        });

    } catch (error) {
        res.status(500).json({ message: "Login error", error });
    }
};

// ================= GET ALL SIGNUPS (ADMIN) =================
const getAllSignups = async (req, res) => {
    try {
        const data = await Signup.find().sort({ createdAt: -1 });

        res.status(200).json({
            message: "All registered users fetched",
            count: data.length,
            data
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

// ================= LOGOUT =================
const logout = async (req, res) => {
    try {
        res.status(200).json({
            message: "Logout successful (delete token from frontend)"
        });
    } catch (error) {
        res.status(500).json({ message: "Logout error", error });
    }
};

// ================= EXPORT =================
module.exports = {
    register,
    login,
    logout,
    getAllSignups
};