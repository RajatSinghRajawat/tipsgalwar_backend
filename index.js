const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const path = require('path');


const { connectDB } = require("./src/config/employeesdb");
const employeeRoutes = require("./src/routes/employees");

const app = express();
connectDB();


app.use(cors());
app.use(express.json());

app.use("/api/employees", employeeRoutes);
app.use("/public/Uploads", express.static("public/Uploads"));

app.listen(5001,()=>{
    console.log("Server is running on port 5001");
})