const express = require('express')
const student_Router = express.Router()

const upload = require('../../multer')
const { add_Student, getAll_Student, getOne_Student, update_Student, delete_Student, search_Student } = require('../controllers/students')


student_Router.post('/add', upload.single('image'), add_Student)
student_Router.get('/get', getAll_Student)
student_Router.get('/getOne/:id', getOne_Student)
student_Router.put('/update/:id', upload.single('image'), update_Student)
student_Router.delete('/delete/:id', delete_Student)
student_Router.get('/search', search_Student)


module.exports = student_Router;