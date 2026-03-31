const mongoose = require('mongoose')
const Courses = require("../modals/courses");
const Batches = require("../modals/batch");


const fields = new mongoose.Schema({
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Courses",
        required: true
    },
    batch_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batches",
        required: true
    },
    enrollment_id: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: "Enrollments",
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    father_name: {
        type: String,
        required: true,
        trim: true
    },
    mother_name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    aadhar: {
        type: String,
        required: true,
        match: /^[0-9]{12}$/
    },
    pan_card: {
        type: String,
        required: true,
        match: /^[0-9]{12}$/
    },
    emi: {
        type: String,
        required: true,
        enum: ["2 months EMI", "4 months EMI", "6 months EMI", "Yearly"]
    },
    contact: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    dob: {
        type: Date,
        required: true
    },
    image: {
        type: String,
        required: true,
        default: ""
    }
})


const Students = mongoose.model('Students', fields);


module.exports = { Students }