const express = require("express");
const router = express.Router();

const { register, login, logout, getAllSignups } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/all-users", getAllSignups);

module.exports = router;