const Course = require("../models/Course");

const add = async (req, res) => {
  try {
    const {
      course_name,
      type,
      duration,
      course_price,
      discount_price,
      status,
      banner,
    } = req.body;

    if (
      !course_name ||
      !type ||
      !duration ||
      !course_price ||
      !discount_price ||
      !status
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const added_Data = await Course.create({
      course_name,
      type,
      duration,
      course_price,
      discount_price,
      status,
      banner,
    });

    return res.status(201).json({
      message: "Course added successfully",
      added_Data,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getAll = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });

    return res.status(200).json({
      courses,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getOne = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.status(200).json({
      course,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      course_name,
      type,
      duration,
      course_price,
      discount_price,
      status,
      banner,
    } = req.body;

    if (
      !course_name ||
      !type ||
      !duration ||
      !course_price ||
      !discount_price ||
      !status
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const updated = await Course.findByIdAndUpdate(
      id,
      {
        course_name,
        type,
        duration,
        course_price,
        discount_price,
        status,
        banner,
      },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.status(200).json({
      message: "Course updated successfully",
      updated,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const Delete = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Course.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  add,
  getAll,
  getOne,
  update,
  Delete,
};
