const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDb } = require('./src/config/config');

const router = require('./src/routes/students');
const port = process.env.PORT || 3005;

const app = express();
app.use(express.json());
app.use(cors());

app.use('/apis', router);
app.use(express.static('public/Uploads'));

connectDb();

app.use('/api/employees', require('./src/routes/employeesroutes'));
app.use("/public", express.static(path.join(__dirname, "src", "public", "Uploads")));


// app.listen(process.env.PORT, () => {
//     console.log(`Server is running on port ${process.env.PORT}`);
// });

<<<<<<< HEAD
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
=======


const port = process.env.PORT || 3005;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});












>>>>>>> origin/ravinder
