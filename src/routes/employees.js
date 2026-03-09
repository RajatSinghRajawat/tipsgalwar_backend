const express = require("express");

const router = express.Router();

const {
  addEmployee,
  getEmployeeById,
  getAllEmployees,
  updateEmployee,
  deleteEmployee
} = require("../controllers/employees");


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


module.exports = router;