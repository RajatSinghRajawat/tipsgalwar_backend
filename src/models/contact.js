const mongoose = require("mongoose");

<<<<<<< HEAD:src/modals/contact.js
const fields = new mongoose.Schema(
  {
    name: {
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
    mobilenumber: {
      type: String,
      required: true,
      trim: true,
    },
    qualification: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Contacts = mongoose.model("Contacts", fields);

module.exports = { Contacts };
=======
const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    mobilenumber: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/
    },
    qualification: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);

module.exports = { Contact };
>>>>>>> ed5cec7855c9b1c81d00c64538139545fe8b44fd:src/models/contact.js
