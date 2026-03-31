const express = require('express');
const cors = require('cors');
const { connectDb } = require('./src/config/config');

const router = require('./src/routes/students');
const port = process.env.PORT || 3005;

const app = express();
app.use(express.json());
app.use(cors());

app.use('/apis', router);
app.use(express.static('public/Uploads'));


connectDb();


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
