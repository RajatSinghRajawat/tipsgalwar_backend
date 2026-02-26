const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    qualification: {
      type: String,
      required: true
    },

    institute: {
      type: String,
      required: true
    },

    department: {
      type: String,
      required: true
    },

    mobileNumber: {
      type: String,
      required: true
    },

    emergencyContact: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    dob: {
      type: Date,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    startTime: {
      type: String
    },

    endTime: {
      type: String
    },

    salary: {
      type: Number,
      required: true
    },

    joinDate: {
      type: Date,
      default: Date.now
    },

    accountNumber: {
      type: String,
      required: true
    },

    ifscCode: {
      type: String,
      required: true
    },

    bankName: {
      type: String,
      required: true
    },

    bankHolderName: {
      type: String,
      required: true
    }
  },

  // Professional Option
  {
    timestamps: true
  }
);

// Model Create
const Employee = mongoose.model("Employee", employeeSchema);

// Export Model
module.exports = Employee;