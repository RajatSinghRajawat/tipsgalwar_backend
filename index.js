const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDb } = require('./src/config/config');
const router = require('./src/routes/Course');

const port = process.env.PORT || 3005;


const app = express();
app.use(express.json());
app.use(cors());

app.use('/apis', router);
app.use(express.static('public/Uploads'));

connectDb();

app.use('/api/employees', require('./src/routes/employeesroutes'));
app.use("/public", express.static(path.join(__dirname, "src", "public", "Uploads")));


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});









