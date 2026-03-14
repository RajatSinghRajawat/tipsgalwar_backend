const bcrypt = require("bcrypt");
const { Students } = require("../modals/students");


const add_Student = async (req, res) => {
    try {
        const { course_id, batch_id, enrollment_id, name, father_name, mother_name, address, aadhar, pan_card, emi, contact, email, password, dob } = await req.body;
        const existing = await Students.findOne({ email });

        if (existing) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const data = await Students.create({
            course_id,
            batch_id,
            enrollment_id,
            name,
            father_name,
            mother_name,
            address,
            aadhar,
            pan_card,
            emi,
            contact,
            email,
            password: hashedPassword,
            dob
        })

        return res.status(201).json({ message: "Data added Successfully.", data })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message })
    }
}


const getAll_Student = async (req, res) => {
    try {
        const data = await Students.find();

        return res.status(200).json({ message: "Data fetched Successfully.", data })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message })
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
        console.log(error.message);
        return res.status(500).json({ message: error.message })
    }
}


const update_Student = async (req, res) => {
    try {
        const id = req.params.id;

        const updated_Data = await Students.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
        if (!updated_Data) {
            return res.status(404).json({ message: "Data not found." });
        }

        return res.status(200).json({ message: "Data updated Successfully.", updated_Data })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message })
    }
}


const delete_Student = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted_Data = await Students.findByIdAndDelete(id)
        if (!deleted_Data) {
            return res.status(404).json({ message: "Data not found." });
        }

        return res.status(200).json({ message: "Data deleted Successfully.", deleted_Data })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message })
    }
}


module.exports = { add_Student, getAll_Student, getOne_Student, update_Student, delete_Student }