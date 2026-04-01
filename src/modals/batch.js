const mongoose = require("mongoose");

const fields = mongoose.Schema({
    batch_Name: {
        type: String,
        required: true
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
        type: Date,
        required: true
    },
    end_Time: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        required: true,
        default: []
    }
})

const Batches = mongoose.model("Batch", fields);

module.exports = { Batches }