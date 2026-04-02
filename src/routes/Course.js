const express = require('express');
const course_Router = express.Router();

const upload = require('../../multer');
const { add, getAll, getOne, update, del } = require('../controllers/course');


course_Router.post('/add', upload.array('banner'), add);
course_Router.get('/get', getAll);
course_Router.get('/getOne/:id', getOne);
course_Router.put('/update/:id', upload.array('banner'), update);
course_Router.delete('/delete/:id', del);


module.exports = course_Router;