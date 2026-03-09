const mongoose = require("mongoose");
const Employee = require("../models/employees");

// ADD EMPLOYEE
const addEmployee = async (req, res) => {
  try {
    const { name, password, qualification, institute, department, mobileNumber, emergencyContact, email, dob, address, startTime, endTime, salary, accountNumber, ifscCode, bankName, bankHolderName} = req.body;

    if (
      !name || !password || !email || !mobileNumber || !department || !salary) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }

    const existingEmployee = await Employee.findOne({ email });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee already exists"
      });
    }

    const employee = await Employee.create({
      name, password, qualification, institute, department, mobileNumber, emergencyContact, email, dob, address, startTime, endTime, salary, accountNumber, ifscCode, bankName, bankHolderName
    });

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

// GET EMPLOYEE BY ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.find
ById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }
    res.status(200).json({
      success: true,
      employee
    });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


// GET ALL EMPLOYEES
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json({
      success: true,
      employees
    });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// update employee,
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, password, qualification, institute, department, mobileNumber, emergencyContact, email, dob, address, startTime, endTime, salary, accountNumber, ifscCode, bankName, bankHolderName} = req.body;
    const employee = await Employee.findById(id);
    console.log(employee);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// DELETE EMPLOYEE
 const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }
    await employee.remove();
    res.status(200).json({
      success: true,
      message: "Employee Deleted Successfully"
    });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};




module.exports = {addEmployee, getEmployeeById, getAllEmployees, updateEmployee, deleteEmployee };