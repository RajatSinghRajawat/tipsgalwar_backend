const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Employee = require("../modals/employees");

// ADD EMPLOYEE
const addEmployee = async (req, res) => {
  try {
    const { name, password, qualification, institute, department, mobileNumber, emergencyContact, email, dob, address, startTime, endTime, salary, accountNumber, ifscCode, bankName, bankHolderName, images } = req.body;

    const uploadedImages = Array.isArray(req.files)
      ? req.files.map((file) => file.filename)
      : [];

    const bodyImages = Array.isArray(images)
      ? images.filter(Boolean)
      : (typeof images === "string" && images.trim() !== "" ? [images.trim()] : []);

    const finalImages = uploadedImages.length > 0 ? uploadedImages : bodyImages;


    if (
      !name ||
      !password ||
      !qualification ||
      !institute ||
      !department ||
      !mobileNumber ||
      !emergencyContact ||
      !email ||
      !dob ||
      !address ||
      !salary ||
      !accountNumber ||
      !ifscCode ||
      !bankName ||
      !bankHolderName ||
      finalImages.length === 0
    ) {
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
      name, password: hashedPassword, qualification, institute, department, mobileNumber, emergencyContact, email, dob, address, startTime, endTime, salary, accountNumber, ifscCode, bankName, bankHolderName, images: finalImages
    });

    res.status(201).json({
      success: true,
      message: "Employee Added Successfully",
      employee
    });

  } catch (error) {
    console.log(error);

    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Employee already exists"
      });
    }

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

    const body = req.body || {};
    const uploadedImages = Array.isArray(req.files) ? req.files.map((file) => file.filename) : [];

    const normalizedBodyImages = Array.isArray(body.images)
      ? body.images.filter(Boolean)
      : (typeof body.images === "string" && body.images.trim() !== "" ? [body.images.trim()] : []);

    const finalImages = uploadedImages.length > 0 ? uploadedImages : normalizedBodyImages;

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

    for (const key of Object.keys(body)) {
      if (allowedFields.includes(key)) {
        if (key === "password") {
          updateData[key] = await bcrypt.hash(body[key], 10);
        } else {
          updateData[key] = body[key];
        }
      }
    }

    // If images are uploaded using multer, use them even if body.images is not sent.
    if (finalImages.length > 0) {
      updateData.images = finalImages;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update",
      });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });

  } catch (error) {
    console.log(error);
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }
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

    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }
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
