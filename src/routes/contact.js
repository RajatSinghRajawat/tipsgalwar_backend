const express = require("express");
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