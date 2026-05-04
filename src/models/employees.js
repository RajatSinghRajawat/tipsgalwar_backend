const mongoose = require("mongoose");


const employee_Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    qualification: {
        type: String,
        required: true
    },
    institute: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    mobile_Number: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/
    },
    emergency_Contact: {
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
    dob: {
        type: Date,
        required: true
    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    start_Time: {
        type: String,
        required: true,
        default: "09:00"
    },
    end_Time: {
        type: String,
        required: true,
        default: "18:00"
    },
    salary: {
        type: Number,
        required: true,
        default: 0
    },
    join_Date: {
        type: Date,
        required: true
    },
    account_Number: {
        type: String,
        required: true,
        match: /^[0-9]{9,18}$/
    },
    ifsc_Code: {
        type: String,
        required: true
    },
    bank_Name: {
        type: String,
        required: true
    },
    bank_Holder_Name: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        required: true,
        default: []
    }
}, { timestamps: true }
);


const Employees = mongoose.models.Employees || mongoose.model("Employees", employee_Schema);


module.exports = { Employees }