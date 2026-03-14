const mongoose = require("mongoose");

const batch = mongoose.Schema({
    BatchName: {
        type: String,
        required: true
    },
    StartDate: {
        type: Date,
        required: true
    },
    EndDate: {
        type: Date,
        required: true
    },
    StartTime: {
        type: Date,
        required: true
    },
    EndTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true
    }
})

const Batches = mongoose.Model("batches", batch);

module.exports = { Batches }