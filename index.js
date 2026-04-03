const express = require('express');
const { connectDb } = require('./src/config/config');
const cors = require('cors');

const batch_Router = require('./src/routes/batch');
const course_Router = require('./src/routes/course');
const employee_Router = require('./src/routes/employees');
const student_Router = require('./src/routes/students');

const port = process.env.PORT || 3005;

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static('public/Uploads'));

app.use('/apis/batch', batch_Router);
app.use('/apis/course', course_Router);
app.use('/apis/employee', employee_Router);
app.use('/apis/student', student_Router);

connectDb();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});