const express = require("express");
const { ExamResults } = require("../modals/examResult");

const exam_Router = express.Router();

// POST /results - Submit proctored exam results from frontend
exam_Router.post("/results", async (req, res) => {
  try {
    const {
      studentName,
      fatherName,
      mobileNumber,
      examId,
      score,
      totalMarks,
      warningCount,
      cheatingAttempts
    } = req.body;

    const examResultData = {
      studentName: typeof studentName === 'string' ? studentName.trim() : '',
      fatherName: typeof fatherName === 'string' ? fatherName.trim() : 'N/A',
      mobileNumber: typeof mobileNumber === 'string' ? mobileNumber.trim() : '',
      examId: typeof examId === 'string' ? examId.trim() : '',
      score: isNaN(Number(score)) ? 0 : Number(score),
      totalMarks: isNaN(Number(totalMarks)) ? 0 : Number(totalMarks),
      warningCount: isNaN(Number(warningCount)) ? 0 : Number(warningCount),
      cheatingAttempts: Array.isArray(cheatingAttempts)
        ? cheatingAttempts.map(attempt => ({
            time: typeof attempt.time === 'string' ? attempt.time.trim() : new Date().toLocaleTimeString(),
            reason: typeof attempt.reason === 'string' ? attempt.reason.trim() : 'Suspicious activity'
          }))
        : []
    };

    if (!examResultData.studentName || !examResultData.mobileNumber || !examResultData.examId) {
      return res.status(400).json({ success: false, message: "Missing required exam result details." });
    }

    const result = await ExamResults.create(examResultData);

    return res.status(201).json({
      success: true,
      message: "Exam result saved successfully!",
      data: result
    });
  } catch (error) {
    console.error("Save exam results error:", error);
    return res.status(500).json({ success: false, message: "Server error processing exam result." });
  }
});

// GET /results - Retrieve all exam results (Admin dashboard)
exam_Router.get("/results", async (req, res) => {
  try {
    const results = await ExamResults.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Fetch exam results error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching exam results." });
  }
});

// DELETE /results/:id - Delete exam result record (Admin dashboard)
exam_Router.delete("/results/:id", async (req, res) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const deletedResult = await ExamResults.findByIdAndDelete(id);
    if (!deletedResult) {
      return res.status(404).json({ success: false, message: "Exam result record not found." });
    }
    return res.status(200).json({ success: true, message: "Exam result record deleted successfully." });
  } catch (error) {
    console.error("Delete exam result record error:", error);
    return res.status(500).json({ success: false, message: "Server error deleting record." });
  }
});

module.exports = exam_Router;
