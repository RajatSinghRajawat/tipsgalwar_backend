const { Courses } = require("../models/Course");


const add = async (req, res) => {
    try {
        const { course_Name, type, duration, course_Price, discount_Price, status, date, description } = req.body;

        if (!course_Name || !type || !duration || !course_Price || !discount_Price || !status || !date || !description) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const banner = req.files?.map(file => file.path) || (req.file ? [req.file.path] : []);


        const existingCourse = await Courses.findOne({ course_Name });
        if (existingCourse) {
            return res.status(400).json({ message: "Course with this name already exists" });
        }

        const added_Data = await Courses.create({
            course_Name,
            type,
            duration,
            course_Price,
            discount_Price,
            status,
            date,
            description,
            banner: banner
        });

        return res.status(201).json({ message: "Course added Successfully.", added_Data });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const getAll = async (req, res) => {
    try {
        const data = await Courses.find().sort({ createdAt: -1 });

        return res.status(200).json({ message: "Courses fetched Successfully.", data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const getOne = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Courses.findById(id);

        if (!data) {
            return res.status(404).json({ message: "Course not found" });
        }

        return res.status(200).json({ message: "Course fetched Successfully.", data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const update = async (req, res) => {
    try {
        const id = req.params.id;
        const { course_Name, type, duration, course_Price, discount_Price, status, date, description } = req.body;

        if (req.files && req.files.length > 0) {
            var image = req.files.map((file) => file.filename);
        }

        if (!course_Name || !type || !duration || !course_Price || !discount_Price || !status || !date || !description) {
            return res.status(400).json({ message: "All fields are required" });
        }


        const updated_Data = await Courses.findByIdAndUpdate(id, { course_Name, type, duration, course_Price, discount_Price, status, date, description, banner: image || undefined }, { new: true });

        if (!updated_Data) {
            return res.status(404).json({ message: "Course not found" });
        }

        return res.status(200).json({ message: "Course updated Successfully.", updated_Data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const del = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted_Data = await Courses.findByIdAndDelete(id);

        if (!deleted_Data) {
            return res.status(404).json({ message: "Course not found" });
        }

        return res.status(200).json({ message: "Course deleted Successfully.", deleted_Data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


module.exports = { add, getAll, getOne, update, del };