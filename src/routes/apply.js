const express = require("express");
<<<<<<< HEAD
const { ApplieStudents } = require("../modals/apply");

const apply_Router = express.Router();

// POST /apply - Submit a new application
apply_Router.post("/apply", async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobile_Number,
      city,
      date_of_birth,
      highest_Qualification,
      college_Name,
      passing_year,
      selected_course,
      gender,
      state,
      pincode,
      address,
      area_of_interest,
      previous_coding_experience,
      additional_message
    } = req.body;

    // Strict input type checks to avoid injection attacks
    const appData = {
      fullName: typeof fullName === 'string' ? fullName.trim() : '',
      email: typeof email === 'string' ? email.trim().toLowerCase() : '',
      mobile_Number: typeof mobile_Number === 'string' ? mobile_Number.trim() : '',
      city: typeof city === 'string' ? city.trim() : '',
      date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
      highest_Qualification: typeof highest_Qualification === 'string' ? highest_Qualification.trim() : '',
      college_Name: typeof college_Name === 'string' ? college_Name.trim() : '',
      passing_year: Number(passing_year),
      selected_course: typeof selected_course === 'string' ? selected_course.trim() : '',
      gender: typeof gender === 'string' ? gender.trim() : 'Male',
      state: typeof state === 'string' ? state.trim() : '',
      pincode: typeof pincode === 'string' ? pincode.trim() : '',
      address: typeof address === 'string' ? address.trim() : '',
      area_of_interest: typeof area_of_interest === 'string' ? area_of_interest.trim() : '',
      previous_coding_experience: Boolean(previous_coding_experience),
      additional_message: typeof additional_message === 'string' ? additional_message.trim() : ''
    };

    if (!appData.fullName || !appData.email || !appData.mobile_Number || !appData.city || !appData.highest_Qualification || !appData.college_Name || isNaN(appData.passing_year) || !appData.selected_course) {
      return res.status(400).json({ success: false, message: "Missing required application details." });
    }

    const application = await ApplieStudents.create(appData);

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      data: application
    });
  } catch (error) {
    console.error("Apply submission error:", error);
    return res.status(500).json({ success: false, message: "Server error processing application." });
  }
});

// GET /apply - Get all applications (Admin dashboard)
apply_Router.get("/apply", async (req, res) => {
  try {
    const applications = await ApplieStudents.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error("Fetch applications error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching applications." });
  }
});

// PUT /apply/:id - Update application details (Admin dashboard)
apply_Router.put("/apply/:id", async (req, res) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    if (!id) {
      return res.status(400).json({ success: false, message: "Invalid ID." });
    }

    // Cast parameter fields safely
    const updates = {};
    const stringFields = [
      "fullName", "email", "mobile_Number", "city",
      "highest_Qualification", "college_Name", "selected_course",
      "gender", "state", "pincode", "address", "area_of_interest",
      "additional_message"
    ];

    stringFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : '';
      }
    });

    if (req.body.passing_year !== undefined) {
      updates.passing_year = Number(req.body.passing_year);
    }
    if (req.body.previous_coding_experience !== undefined) {
      updates.previous_coding_experience = Boolean(req.body.previous_coding_experience);
    }
    if (req.body.date_of_birth !== undefined) {
      updates.date_of_birth = req.body.date_of_birth ? new Date(req.body.date_of_birth) : null;
    }

    const updatedApp = await ApplieStudents.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedApp) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    return res.status(200).json({ success: true, message: "Application updated successfully.", data: updatedApp });
  } catch (error) {
    console.error("Update application error:", error);
    return res.status(500).json({ success: false, message: "Server error updating application." });
  }
});

// DELETE /apply/:id - Delete application (Admin dashboard)
apply_Router.delete("/apply/:id", async (req, res) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const deletedApp = await ApplieStudents.findByIdAndDelete(id);
    if (!deletedApp) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }
    return res.status(200).json({ success: true, message: "Application deleted successfully." });
  } catch (error) {
    console.error("Delete application error:", error);
    return res.status(500).json({ success: false, message: "Server error deleting application." });
  }
});

module.exports = apply_Router;
=======
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
>>>>>>> ed5cec7855c9b1c81d00c64538139545fe8b44fd
