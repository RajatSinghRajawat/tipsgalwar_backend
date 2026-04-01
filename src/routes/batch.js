const express = require('express');
const { add, getAll, getOne, update, del } = require('../controllers/batch');
const router = express.Router();

const upload = require('../../multer')

router.post('/add', upload.array('images'), add);
router.get('/get', getAll);
router.get('/getOne/:id', getOne);
router.put('/update/:id', upload.array('images'), update);
router.delete('/delete/:id', del);

module.exports =  router;