const { Courses } = require("../modals/Course");

const add = async (req, res) => {
  try {
    const { course_name, type, duration, course_price, discount_price, status } = req.body;

    if ( !course_name || !type || !duration || !course_price || !discount_price || !status ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const banner = req.files.map((file) => file.path);

    const added_Data = await Courses.create({
      course_name,
      type,
      duration,
      course_price,
      discount_price,
      status,
      banner: banner
    });

    return res.status(201).json({ message: "Course added successfully", added_Data });
  }
  catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const courses = await Courses.find().sort({ createdAt: -1 });

    return res.status(200).json({ message: "Courses fetched successfully", courses });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getOne = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Courses.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({ message: "Course fetched successfully", course });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { course_name, type, duration, course_price, discount_price, status } = req.body;

    if (req.files.length > 0) {
      var image = req.files.map((file) => file.filename);
    }

    if ( !course_name || !type || !duration || !course_price || !discount_price || !status ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const updated = await Courses.findByIdAndUpdate(
      id,
      {
        course_name,
        type,
        duration,
        course_price,
        discount_price,
        status,
        banner: image || undefined,
      },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Course not found", updated });
    }

    return res.status(200).json({ message: "Course updated successfully", updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const del = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Courses.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { add, getAll, getOne, update, del };
