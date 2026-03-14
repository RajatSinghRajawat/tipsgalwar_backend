
const { Batches } = require("../modals/batch");


const add = async (req, res) => {
    try {
        const { BatchName, StartDate, EndDate, StartTime, EndTime, status } = req.body;

        if (!BatchName || !StartDate || !EndDate || !StartTime || !EndTime || !status) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (new Date(EndDate) < new Date(StartDate)) {
            return res.status(400).json({
                message: "EndDate cannot be before StartDate"
            });
        }

        const added_Data = await Batches.create({
            BatchName,
            StartDate,
            EndDate,
            StartTime,
            EndTime,
            status
        });

        return res.status(201).json({
            message: "Batch data successfully added",
            added_Data
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


const getAll = async (req, res) => {
    try {
        const batches = await Batches.find();
        return res.status(200).json({ batches });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const batch = await Batches.findById(id);
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }
        return res.status(200).json({ batch });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { BatchName, StartDate, EndDate, StartTime, EndTime, status } = req.body;

        if (!BatchName || !StartDate || !EndDate || !StartTime || !EndTime || !status) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (new Date(EndDate) < new Date(StartDate)) {
            return res.status(400).json({ message: "EndDate cannot be before StartDate" });
        }

        const updated = await Batches.findByIdAndUpdate(
            id,
            { BatchName, StartDate, EndDate, StartTime, EndTime, status },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Batch not found" });
        }
        return res.status(200).json({ message: "Batch updated", updated });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Batches.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Batch not found" });
        }
        return res.status(200).json({ message: "Batch deleted" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { add, getAll, getOne, update, remove };