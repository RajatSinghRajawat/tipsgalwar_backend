const mongoose = require("mongoose");

const connectDb = async () => {
    mongoose.connect("mongodb://localhost:27017/tipsg-alwar-backend").then(() => {
        console.log("Connected to MongoDB");
    }).catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });
}

module.exports = { connectDb };