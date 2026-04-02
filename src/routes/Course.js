const express = require("express");
const router = express.Router();
const { add, getAll, getOne, update, del } = require("../controllers/Course");
const upload = require("../../multer");

router.post("/add", upload.array("banner"), add);
router.get("/get", getAll);
router.get("/getOne/:id", getOne);
router.put("/update/:id", upload.array("banner"), update);
router.delete("/delete/:id", del);

module.exports = router;