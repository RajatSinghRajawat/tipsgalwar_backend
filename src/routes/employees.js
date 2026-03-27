const express = require("express");
const upload = require("../../multer");

const router = express.Router();

const {
  addEmployee,
  getEmployeeById,
  getAllEmployees,
  updateEmployee,
  deleteEmployee
} = require("../controllers/employees");

const uploadFile = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const files = req.files.map((file) => ({
      filename: file.filename,
      path: `/public/Uploads/${file.filename}`,
    }));

    return res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      files,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



// ADD EMPLOYEE
router.post("/add", addEmployee);


// GET ALL EMPLOYEES
router.get("/all", getAllEmployees);


// GET EMPLOYEE BY ID
router.get("/:id", getEmployeeById);


// UPDATE EMPLOYEE
router.put("/update/:id", updateEmployee);


// DELETE EMPLOYEE
router.delete("/delete/:id", deleteEmployee);

// image upload route

router.post("/upload", upload.array("images"), uploadFile);

module.exports = router;
