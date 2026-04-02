const mongoose = require("mongoose");

const fields = new mongoose.Schema(
  {
    course_name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
      enum: ["1 year", "3 years"],
    },
    course_price: {
      type: Number,
      required: true,
    },
    discount_price: {
      type: Number,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
    banner: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Courses = mongoose.model("Course", fields);

module.exports = { Courses };