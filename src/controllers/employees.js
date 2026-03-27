const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Employee = require("../modals/employees");

// ADD EMPLOYEE
const addEmployee = async (req, res) => {
  try {
    const { name, password, qualification, institute, department, mobileNumber, emergencyContact, email, dob, address, startTime, endTime, salary, accountNumber, ifscCode, bankName, bankHolderName, images } = req.body;

    const imageFiles = req.files.map(file => file.filename);


    if (
      !name || !password || !email || !mobileNumber || !department || !salary || !images || images.length === 0) {
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await Employee.create({
      name, password: hashedPassword, qualification, institute, department, mobileNumber, emergencyContact, email, dob, address, startTime, endTime, salary, accountNumber, ifscCode, bankName, bankHolderName, images
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID"
      });
    }

    const employee = await Employee.findById(id);

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const allowedFields = [
      "name",
      "password",
      "qualification",
      "institute",
      "department",
      "mobileNumber",
      "emergencyContact",
      "email",
      "dob",
      "address",
      "startTime",
      "endTime",
      "salary",
      "accountNumber",
      "ifscCode",
      "bankName",
      "bankHolderName",
      "images"
    ];

    const updateData = {};

    for (const key of Object.keys(req.body)) {
      if (allowedFields.includes(key)) {
        if (key === "password") {
          updateData[key] = await bcrypt.hash(req.body[key], 10);
        } else {
          updateData[key] = req.body[key];
        }
      }
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// DELETE EMPLOYEE
 const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID"
      });
    }

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