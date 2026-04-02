const express = require('express');
const batch_Router = express.Router();

const upload = require('../../multer')
const { add, getAll, getOne, update, del } = require('../controllers/batch');


batch_Router.post('/add', upload.array('images'), add);
batch_Router.get('/get', getAll);
batch_Router.get('/getOne/:id', getOne);
batch_Router.put('/update/:id', upload.array('images'), update);
batch_Router.delete('/delete/:id', del);


module.exports =  batch_Router;