const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Employees } = require("../modals/employees");


const add_Employees = async (req, res) => {
    try {
        const {
            name,
            password,
            qualification,
            institute,
            department,
            mobile_Number,
            emergency_Contact,
            email,
            dob,
            address,
            start_Time,
            end_Time,
            salary,
            join_Date,
            account_Number,
            ifsc_Code,
            bank_Name,
            bank_Holder_Name
        } = req.body;

        // console.log(req.body);

        if (!name || !password || !qualification || !institute || !department || !mobile_Number || !emergency_Contact || !email || !dob || !address || !start_Time || !end_Time || !salary || !join_Date || !account_Number || !ifsc_Code || !bank_Name || !bank_Holder_Name) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const image = req.files?.map(file => file.path) || (req.file ? [req.file.path] : []);


        const Employee_exist = await Employees.findOne({ email });

        if (Employee_exist) {
            console.log(Employee_exist);
            return res.status(400).json({ message: "Employee already exists with this email." });
        }


        const hashedPassword = await bcrypt.hash(password, 10);

        const added_Data = await Employees.create({
            name,
            password: hashedPassword,
            qualification,
            institute,
            department,
            mobile_Number,
            emergency_Contact,
            email,
            dob,
            address,
            start_Time,
            end_Time,
            salary,
            join_Date,
            account_Number,
            ifsc_Code,
            bank_Name,
            bank_Holder_Name,
            images: image || [],
        });

        return res.status(201).json({ message: "Employee Data added Successfully.", added_Data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const getAll_Employees = async (req, res) => {
    try {
        const data = await Employees.find().sort({ createdAt: -1 });

        return res.status(200).json({ message: "Employees Data fetched Successfully.", data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const getOne_Employee = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid employee ID" });
        }

        const data = await Employees.findById(id);

        if (!data) {
            return res.status(404).json({ message: "Employee Data not found." });
        }

        return res.status(200).json({ message: "Employee Data fetched Successfully.", data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const update_Employee = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Employee ID" });
        }

        if (req.file) {
            req.body.image = req.file?.filename;
        }

        const updated_Data = await Employees.findByIdAndUpdate(id, req.body,
            // { new: true }
        );

        if (!updated_Data) {
            return res.status(404).json({ message: "Employee Data not found." });
        }

        return res.status(200).json({ message: "Employee Data updated Successfully.", updated_Data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const delete_Employee = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Employee ID" });
        }

        const deleted_Data = await Employees.findByIdAndDelete(id);

        if (!deleted_Data) {
            return res.status(404).json({ message: "Employee Data not found." });
        }

        return res.status(200).json({ message: "Employee Data deleted successfully.", deleted_Data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


module.exports = { add_Employees, getAll_Employees, getOne_Employee, update_Employee, delete_Employee };