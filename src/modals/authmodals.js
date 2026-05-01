const mongoose = require("mongoose");

const signup_Schema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    mobile_Number: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/
    },
    password: {
        type: String,
        required: true,
        select: false
    }
}, { timestamps: true })

const Signup = mongoose.models.Signup || mongoose.model("Signup", signup_Schema);

module.exports = { Signup }