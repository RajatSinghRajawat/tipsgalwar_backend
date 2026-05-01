const { Contact } = require("../modals/contact");

// CREATE CONTACT
const contact = async (req, res) => {
    try {
        const { name, email, mobilenumber, qualification, subject, message } = req.body;

        if (!name || !email || !mobilenumber || !qualification || !subject || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newContact = await Contact.create({
            name,
            email,
            mobilenumber,
            qualification,
            subject,
            message
        });

        res.status(201).json({
            message: "Contact created successfully 🎉",
            data: newContact
        });

    } catch (error) {
        res.status(500).json({
            message: "Contact creation failed",
            error: error.message
        });
    }
};

// GET ALL
const getAllContact = async (req, res) => {
    try {
        const data = await Contact.find().sort({ createdAt: -1 });

        res.status(200).json({
            message: "All contacts fetched",
            count: data.length,
            data
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching contacts",
            error: error.message
        });
    }
};

// DELETE
const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await Contact.findByIdAndDelete(id);

        if (!data) {
            return res.status(404).json({
                message: "Contact not found"
            });
        }

        res.status(200).json({
            message: "Contact deleted successfully 🧹",
            data
        });

    } catch (error) {
        res.status(500).json({
            message: "Error deleting contact",
            error: error.message
        });
    }
};

module.exports = {
    contact,
    getAllContact,
    deleteContact
};