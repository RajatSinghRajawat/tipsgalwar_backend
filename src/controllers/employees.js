const mongoose = require("mongoose");
const Employee = require("../models/employees");

// ADD EMPLOYEE
const addEmployee = async (req, res) => {
  try {

    const {
      name,
      password,
      qualification,
      institute,
      department,
      mobileNumber,
      emergencyContact,
      email,
      dob,
      address,
      startTime,
      endTime,
      salary,
      accountNumber,
      ifscCode,
      bankName,
      bankHolderName
    } = req.body;

    const existingEmployee = await Employee.findOne({ email });

    if (existingEmployee) {
      return res.status(400).json({
        message: "Employee already exists"
      });
    }

    const employee = new Employee({
      name,
      password,
      qualification,
      institute,
      department,
      mobileNumber,
      emergencyContact,
      email,
      dob,
      address,
      startTime,
      endTime,
      salary,
      accountNumber,
      ifscCode,
      bankName,
      bankHolderName
    });

    await employee.save();

    res.status(201).json({
      success: true,
      message: "Employee Added Successfully",
      employee
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

module.exports = {
  addEmployee
};