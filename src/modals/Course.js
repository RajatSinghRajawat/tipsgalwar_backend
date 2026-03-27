const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
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
      type: String,
      required: true,
  
    },

    banner: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Course", courseSchema);