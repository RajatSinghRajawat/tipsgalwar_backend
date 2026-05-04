const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Employees } = require("../models/employees");
const XLSX = require("xlsx");


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

        const image = req.files?.map(file => file.filename) || (req.file ? [req.file.filename] : []);


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

        if (req.files && req.files.length > 0) {
            req.body.images = req.files.map(file => file.filename);
        } else if (req.file) {
            req.body.images = [req.file.filename];
        }

        const updated_Data = await Employees.findByIdAndUpdate(id, req.body,
            { returnDocument: 'after' }
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




const uploadExcelEmployees = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload Excel file" });
        }

        // Read Excel file
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        let insertedData = [];
        let skippedData = [];

        for (let item of sheetData) {
            try {
                // Check duplicate email
                const exist = await Employees.findOne({ email: item.email });
                if (exist) {
                    skippedData.push({ email: item.email, reason: "Already exists" });
                    continue;
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(item.password, 10);

                const newEmployee = {
                    name: item.name,
                    password: hashedPassword,
                    qualification: item.qualification,
                    institute: item.institute,
                    department: item.department,
                    mobile_Number: item.mobile_Number,
                    emergency_Contact: item.emergency_Contact,
                    email: item.email,
                    dob: item.dob,
                    address: item.address,
                    start_Time: item.start_Time,
                    end_Time: item.end_Time,
                    salary: item.salary,
                    join_Date: item.join_Date,
                    account_Number: item.account_Number,
                    ifsc_Code: item.ifsc_Code,
                    bank_Name: item.bank_Name,
                    bank_Holder_Name: item.bank_Holder_Name,
                    images: [],
                };

                const saved = await Employees.create(newEmployee);
                insertedData.push(saved);

            } catch (err) {
                skippedData.push({ data: item, error: err.message });
            }
        }

        return res.status(200).json({
            message: "Excel uploaded successfully",
            total: sheetData.length,
            inserted: insertedData.length,
            skipped: skippedData.length,
            insertedData,
            skippedData
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


module.exports = { add_Employees, getAll_Employees, getOne_Employee, update_Employee, delete_Employee, uploadExcelEmployees };