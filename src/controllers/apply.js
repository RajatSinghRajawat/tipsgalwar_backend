const { Apply } = require("../modals/apply");

// ================= CREATE APPLY =================
const createApply = async (req, res) => {
    try {
        const {
            fullName,
            email,
            mobile_Number,
            city,
            date_of_birth,
            gender,
            address,
            state,
            pincode,
            highest_Qualification,
            college_Name,
            passing_year,
            selected_course,
            area_of_interest,
            previous_coding_experience,
            additional_message
        } = req.body;

        // validation
        if (
            !fullName ||
            !email ||
            !mobile_Number ||
            !city ||
            !date_of_birth ||
            !gender ||
            !address ||
            !state ||
            !pincode ||
            !highest_Qualification ||
            !college_Name ||
            !passing_year ||
            !selected_course ||
            !area_of_interest ||
            previous_coding_experience === undefined
        ) {
            return res.status(400).json({
                message: "All required fields must be filled"
            });
        }

        const apply = await Apply.create({
            fullName,
            email,
            mobile_Number,
            city,
            date_of_birth,
            gender,
            address,
            state,
            pincode,
            highest_Qualification,
            college_Name,
            passing_year: Number(passing_year),
            selected_course,
            area_of_interest,
            previous_coding_experience,
            additional_message: additional_message || ""
        });

        res.status(201).json({
            message: "Application submitted successfully 🎉",
            apply
        });

    } catch (error) {
        res.status(500).json({
            message: "Error creating application",
            error: error.message
        });
    }
};

// ================= GET ALL =================
const getAllApply = async (req, res) => {
    try {
        const data = await Apply.find().sort({ createdAt: -1 });

        res.status(200).json({
            message: "All applications fetched",
            count: data.length,
            data
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching applications",
            error: error.message
        });
    }
};

// ================= GET BY ID =================
const getApplyById = async (req, res) => {
    try {
        const data = await Apply.findById(req.params.id);

        if (!data) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        res.status(200).json({
            message: "Application fetched",
            data
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching application",
            error: error.message
        });
    }
};

// ================= UPDATE =================
const updateApply = async (req, res) => {
    try {
        const data = await Apply.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!data) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        res.status(200).json({
            message: "Application updated successfully",
            data
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating application",
            error: error.message
        });
    }
};

// ================= DELETE =================
const deleteApply = async (req, res) => {
    try {
        const data = await Apply.findByIdAndDelete(req.params.id);

        if (!data) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        res.status(200).json({
            message: "Application deleted successfully 🧹",
            data
        });

    } catch (error) {
        res.status(500).json({
            message: "Error deleting application",
            error: error.message
        });
    }
};

module.exports = {
    createApply,
    getAllApply,
    getApplyById,
    updateApply,
    deleteApply
};