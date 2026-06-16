const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Users } = require("../modals/user");

const auth_Router = express.Router();

// Safe email validation regex (no nested quantifiers to prevent ReDoS)
const SAFE_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// POST /signup
auth_Router.post("/signup", async (req, res) => {
  try {
    const fullName = typeof req.body.fullName === 'string' ? req.body.fullName.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
    const mobile_Number = typeof req.body.mobile === 'string' ? req.body.mobile.trim() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    // SSTI: Simple validations and JSON output, no templating
    if (!fullName || !email || !mobile_Number || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // LPDoS Protection: Limit password length to max 72 characters before bcrypt hashing
    if (password.length > 72) {
      return res.status(400).json({ success: false, message: "Password is too long. Maximum 72 characters allowed." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    // ReDoS Protection: Validate length and format using safe regex
    if (email.length > 100) {
      return res.status(400).json({ success: false, message: "Email is too long." });
    }
    if (!SAFE_EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format." });
    }

    if (mobile_Number.length > 15) {
      return res.status(400).json({ success: false, message: "Mobile number is too long." });
    }

    // NoSQL Injection Defense: We pass sanitized strings to Mongoose findOne
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Users.create({
      fullName,
      email,
      mobile_Number,
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: "Signup successful!",
      data: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        mobile_Number: newUser.mobile_Number
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ success: false, message: "Server error during registration." });
  }
});

// POST /login
auth_Router.post("/login", async (req, res) => {
  try {
    const identifier = typeof req.body.identifier === 'string' ? req.body.identifier.trim() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    // Limit checks to prevent LPDoS / hashing exhaustion
    if (password.length > 72) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }

    // NoSQL Injection Defense: Explicit parameter matching with verified string
    const user = await Users.findOne({ email: identifier }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // Secret Key Defense: Read strictly from environment variable, fall back safely if not set
    const jwtSecret = process.env.JWT_SECRET || "fallback_default_secure_secret_key";
    const token = jwt.sign({ id: user._id, role: "Student" }, jwtSecret, { expiresIn: "1d" });

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile_Number: user.mobile_Number,
        role: "Student"
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error during authentication." });
  }
});

// GET /all-users
auth_Router.get("/all-users", async (req, res) => {
  try {
    const users = await Users.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Fetch users error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching registered students." });
  }
});

module.exports = auth_Router;
