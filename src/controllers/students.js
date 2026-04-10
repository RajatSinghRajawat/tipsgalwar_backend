const bcrypt = require("bcrypt");
const { Students } = require("../modals/students");
const XLSX = require("xlsx");


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

        const data = await Students.findById(id).populate('course_Id').populate('batch_Id');
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
const uploadExcelStudents = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload Excel file" });
        }

        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        let insertedData = [];
        let skippedData = [];

        for (let item of sheetData) {
            try {
                // duplicate check
                const exist = await Students.findOne({ email: item.email });
                if (exist) {
                    skippedData.push({ email: item.email, reason: "Already exists" });
                    continue;
                }

                // password hash
                const hashedPassword = await bcrypt.hash(item.password, 10);

                const newStudent = {
                    course_Id: item.course_Id,
                    batch_Id: item.batch_Id,
                    enrollment_Id: item.enrollment_Id,
                    name: item.name,
                    father_Name: item.father_Name,
                    mother_Name: item.mother_Name,
                    address: item.address,
                    aadhar: item.aadhar,
                    pan_Card: item.pan_Card,
                    emi: item.emi,
                    contact: item.contact,
                    email: item.email,
                    password: hashedPassword,
                    dob: item.dob,
                    image: ""
                };

                const saved = await Students.create(newStudent);
                insertedData.push(saved);

            } catch (err) {
                skippedData.push({ data: item, error: err.message });
            }
        }

        return res.status(200).json({
            message: "Students Excel uploaded successfully",
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

module.exports = { add_Student, getAll_Student, getOne_Student, update_Student, delete_Student, search_Student, uploadExcelStudents }