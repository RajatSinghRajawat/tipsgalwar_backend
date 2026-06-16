const mongoose = require("mongoose");

const fields = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      default: "N/A",
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    examId: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    warningCount: {
      type: Number,
      required: true,
      default: 0,
    },
    cheatingAttempts: [
      {
        time: { type: String, required: true },
        reason: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const ExamResults = mongoose.model("ExamResults", fields);

module.exports = { ExamResults };
