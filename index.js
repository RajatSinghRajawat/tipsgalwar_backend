const express = require('express');
const cors = require('cors');
const { connectDb } = require('./src/config/config');



const app = express();
app.use(express.json());
app.use(cors());




connectDb();




app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});


















