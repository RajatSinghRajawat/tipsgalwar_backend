const mongoose = require("mongoose");

const fields = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    mobile_Number: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    date_of_birth: {
      type: Date,
    },
    highest_Qualification: {
      type: String,
      required: true,
      trim: true,
    },
    college_Name: {
      type: String,
      required: true,
      trim: true,
    },
    passing_year: {
      type: Number,
      required: true,
    },
    selected_course: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      default: "Male",
    },
    state: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    area_of_interest: {
      type: String,
      trim: true,
    },
    previous_coding_experience: {
      type: Boolean,
      default: false,
    },
    additional_message: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const ApplieStudents = mongoose.model("ApplieStudents", fields);

module.exports = { ApplieStudents };
