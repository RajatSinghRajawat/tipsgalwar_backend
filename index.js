const express = require('express');
const path = require('path');
const fs = require('fs');
const { connectDb } = require('./src/config/config');
const cors = require('cors');

const batch_Router = require('./src/routes/batch');
// const course_Router = require('./src/routes/course');
const employee_Router = require('./src/routes/employees');
// const student_Router = require('./src/routes/students');

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
// app.use('/apis/course', course_Router);
app.use('/apis/employee', employee_Router);
// app.use('/apis/student', student_Router);
connectDb();


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

