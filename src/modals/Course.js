const mongoose = require("mongoose");


const fields = new mongoose.Schema({
    course_Name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true,
        enum: ["1 year", "3 years"]
    },
    course_Price: {
        type: Number,
        required: true
    },
    discount_Price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ["Active", "Inactive"]
    },
    banner: {
        type: [String],
        required: true,
        default: []
    },
}, { timestamps: true }
);


const Courses = mongoose.model("Courses", fields);


module.exports = { Courses };