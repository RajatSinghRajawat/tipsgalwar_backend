const mongoose = require("mongoose");


const connectDb = async () => {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/tipsg-alwar-backend";
    mongoose.connect(mongoUri).then(() => {
        console.log("Connected to MongoDB");
    }).catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });
}   


module.exports = { connectDb };