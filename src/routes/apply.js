const express = require("express");
const router = express.Router();

const {
    createApply,
    getAllApply,
    getApplyById,
    updateApply,
    deleteApply
} = require("../controllers/apply");

router.post("/apply", createApply);
router.get("/apply", getAllApply);
router.get("/apply/:id", getApplyById);
router.put("/apply/:id", updateApply);
router.delete("/apply/:id", deleteApply);

module.exports = router;