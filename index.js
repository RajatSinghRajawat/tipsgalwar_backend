require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { connectDb } = require('./src/config/config');
const cors = require('cors');

const batch_Router = require('./src/routes/batch.js');
const course_Router = require('./src/routes/Course.js');
const employee_Router = require('./src/routes/employees.js');
const student_Router = require('./src/routes/students.js');
const apply_Router = require('./src/routes/apply.js');
const auth_Router = require('./src/routes/authroutes.js');
const contact_Router = require('./src/routes/contact.js');
const port = process.env.PORT || 3005;

const app = express();
const uploadsDir = path.join(__dirname, 'public', 'Uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/uploads', express.static(uploadsDir));
app.use(express.static(uploadsDir));

app.use('/apis/batch', batch_Router);
app.use('/apis/course', course_Router);
app.use('/apis/employee', employee_Router);
app.use('/apis/student', student_Router);
app.use('/apis/auth', auth_Router);
app.use('/apis/apply', apply_Router);
app.use('/apis/contact', contact_Router);
connectDb();


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
