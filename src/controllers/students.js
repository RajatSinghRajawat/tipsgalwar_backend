const bcrypt = require("bcrypt");
const { Students } = require("../modals/students");


const add_Student = async (req, res) => {
    try {
        const { course_Id, batch_Id, enrollment_Id, name, father_Name, mother_Name, address, aadhar, pan_Card, emi, contact, email, password, dob } = req.body;
        
        if (!course_Id || !batch_Id || !enrollment_Id || !name || !father_Name || !mother_Name || !address || !aadhar || !pan_Card || !emi || !contact || !email || !password || !dob) {
            return res.status(400).json({ message: "All fields are required." });
        }
        
        const existingStudent = await Students.findOne({ email });
        
        if (existingStudent) {
            return res.status(400).json({ message: "Student with this email already exists" });
        }

        const image = req.file?.filename;

        const hashedPassword = await bcrypt.hash(password, 10);
        const data = await Students.create({
            course_Id,
            batch_Id,
            enrollment_Id,
            name,
            father_Name,
            mother_Name,
            address,
            aadhar,
            pan_Card,
            emi,
            contact,
            email,
            password: hashedPassword,
            dob,
            image
        })

        return res.status(201).json({ message: "Data added Successfully.", data })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


const getAll_Student = async (req, res) => {
    try {
        const data = await Students.find().populate('course_Id').populate('batch_Id').populate('enrollment_Id');

        return res.status(200).json({ message: "Data fetched Successfully.", data })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


const getOne_Student = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await Students.findById(id);
        if (!data) {
            return res.status(404).json({ message: "Data not found." });
        }

        return res.status(200).json({ message: "Data fetched Successfully.", data })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


const update_Student = async (req, res) => {
    try {
        const id = req.params.id;

        if (req.file) {
            req.body.image = req.file?.filename;
        }

        const updated_Data = await Students.findByIdAndUpdate(id, req.body, 
            // { new: true }
        )
        
        if (!updated_Data) {
            return res.status(404).json({ message: "Data not found." });
        }

        return res.status(200).json({ message: "Data updated Successfully.", updated_Data })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


const delete_Student = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted_Data = await Students.findByIdAndDelete(id);

        if (!deleted_Data) {
            return res.status(404).json({ message: "Data not found." });
        }

        return res.status(200).json({ message: "Data deleted Successfully.", deleted_Data })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


const search_Student = async (req, res) => {
    try {
        const search_Value = await req.query.name;

        const data = await Students.find({
            name: { $regex: search_Value, $options: 'i' }
        })

        return res.status(200).json({ message: "Student found Successfully.", data })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


module.exports = { add_Student, getAll_Student, getOne_Student, update_Student, delete_Student, search_Student }