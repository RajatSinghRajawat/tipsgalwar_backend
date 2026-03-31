const express = require('express')
const { add_Student, getAll_Student, getOne_Student, update_Student, delete_Student, search_Student } = require('../controllers/students')

const upload = require('../../multer')
const router = express.Router()


router.post('/add', upload.single('image'), add_Student)
router.get('/get', getAll_Student)
router.get('/getOne/:id', getOne_Student)
router.put('/update/:id', upload.single('image'), update_Student)
router.delete('/delete/:id', delete_Student)
router.get('/search', search_Student)


module.exports = router;