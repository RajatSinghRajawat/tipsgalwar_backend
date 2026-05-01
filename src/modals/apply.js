const mongoose = require("mongoose");

const applySchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    mobile_Number: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    date_of_birth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ["Male", "Female", "Other"]
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    pincode: {
        type: String,
        required: true,
        match: /^[0-9]{6}$/
    },
    highest_Qualification: {
        type: String,
        required: true,
        trim: true
    },
    college_Name: {
        type: String,
        required: true,
        trim: true
    },
    passing_year: {
        type: Number,
        required: true
    },
    selected_course: {
        type: String,
        required: true,
        trim: true
    },
    area_of_interest: {
        type: String,
        required: true,
        trim: true
    },
    previous_coding_experience: {
        type: Boolean,
        required: true
    },
    additional_message: {
        type: String,
        trim: true,
        default: ""
    }

}, { timestamps: true });

const Apply = mongoose.models.Apply || mongoose.model("Apply", applySchema);

module.exports = { Apply };