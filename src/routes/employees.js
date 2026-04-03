const express = require('express');
const employee_Router = express.Router();

const upload = require('../../multer');
const { add_Employees, getAll_Employees, getOne_Employee, update_Employee, delete_Employee } = require('../controllers/employees');


employee_Router.post('/add', upload.array('image'), add_Employees);
employee_Router.get('/get', getAll_Employees);
employee_Router.get('/getOne/:id', getOne_Employee);
employee_Router.put('/update/:id', upload.array('image'), update_Employee);
employee_Router.delete('/delete/:id', delete_Employee);


module.exports = employee_Router;