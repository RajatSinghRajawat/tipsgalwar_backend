const express = require("express");
const path = require("path");
const cors = require("cors");
const { connectDb } = require("./src/config/config");

const batch_Router = require("./src/routes/batch");
const course_Router = require("./src/routes/course");
const employee_Router = require("./src/routes/employees");
const student_Router = require("./src/routes/students");

const port = process.env.PORT || 3005;

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static("public/Uploads"));
app.use("/public", express.static(path.join(__dirname, "public", "Uploads")));

app.use("/apis/batch", batch_Router);
app.use("/apis/course", course_Router);
app.use("/apis/employee", employee_Router);
app.use("/apis/student", student_Router);

// Keep the older employee base path working for existing clients.
app.use("/api/employees", employee_Router);

connectDb();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
