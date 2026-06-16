const mongoose = require('mongoose')
const Courses = require("./course");
const Batches = require("./batch");


const fields = new mongoose.Schema({
    course_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Courses",
        required: true
    },
    batch_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batches",
        required: true
    },
    enrollment_Id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    father_Name: {
        type: String,
        required: true,
        trim: true
    },
    mother_Name: {
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
    pan_Card: {
        type: String,
        required: true,
        match: /^[A-Z]{5}[0-9]{4}[A-Z]$/
    },
    emi: {
        type: String,
        required: true,
        enum: ["Monthly", "Quarterly", "Semester", "Yearly"]
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


const Students = mongoose.models.Students || mongoose.model('Students', fields);


module.exports = { Students }