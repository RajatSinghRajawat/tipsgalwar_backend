const mongoose = require("mongoose");


const fields = new mongoose.Schema({
    batch_Name: {
        type: String,
        required: true,
        trim: true
    },
    start_Date: {
        type: Date,
        required: true
    },
    end_Date: {
        type: Date,
        required: true
    },
    start_Time: {
        type: String,
        required: true
    },
    end_Time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ["Active", "Inactive"]
    },
    images: {
        type: [String],
        required: true,
        default: []
    }
})


const Batches = mongoose.model("Batches", fields);


module.exports = { Batches }