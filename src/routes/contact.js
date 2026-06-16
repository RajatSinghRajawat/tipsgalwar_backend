const express = require("express");
<<<<<<< HEAD
const { Contacts } = require("../modals/contact");

const contact_Router = express.Router();

// POST /contact - Submit contact form
contact_Router.post("/contact", async (req, res) => {
  try {
    const { name, email, mobilenumber, qualification, subject, message } = req.body;

    const queryData = {
      name: typeof name === 'string' ? name.trim() : '',
      email: typeof email === 'string' ? email.trim().toLowerCase() : '',
      mobilenumber: typeof mobilenumber === 'string' ? mobilenumber.trim() : '',
      qualification: typeof qualification === 'string' ? qualification.trim() : '',
      subject: typeof subject === 'string' ? subject.trim() : '',
      message: typeof message === 'string' ? message.trim() : ''
    };

    if (!queryData.name || !queryData.email || !queryData.mobilenumber || !queryData.qualification || !queryData.subject || !queryData.message) {
      return res.status(400).json({ success: false, message: "All form fields are required." });
    }

    const savedContact = await Contacts.create(queryData);

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully!",
      data: savedContact
    });
  } catch (error) {
    console.error("Submit contact error:", error);
    return res.status(500).json({ success: false, message: "Server error saving contact inquiry." });
  }
});

// GET /contact - Retrieve contact messages (Admin dashboard)
contact_Router.get("/contact", async (req, res) => {
  try {
    const messages = await Contacts.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("Fetch contact messages error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching messages." });
  }
});

// DELETE /contact/:id - Delete a message (Admin dashboard)
contact_Router.delete("/contact/:id", async (req, res) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const deletedContact = await Contacts.findByIdAndDelete(id);
    if (!deletedContact) {
      return res.status(404).json({ success: false, message: "Inquiry not found." });
    }
    return res.status(200).json({ success: true, message: "Inquiry deleted successfully." });
  } catch (error) {
    console.error("Delete contact message error:", error);
    return res.status(500).json({ success: false, message: "Server error deleting inquiry." });
  }
});

module.exports = contact_Router;
=======
const router = express.Router();

// IMPORT CONTROLLER
const {
    contact,
    getAllContact,
    deleteContact
} = require("../controllers/contact");

// ROUTES
router.post("/contact", contact);
router.get("/contact", getAllContact);
router.delete("/contact/:id", deleteContact);

module.exports = router;
>>>>>>> ed5cec7855c9b1c81d00c64538139545fe8b44fd
