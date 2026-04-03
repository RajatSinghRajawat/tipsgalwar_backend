const { Batches } = require("../modals/batch");


const add = async (req, res) => {
    try {
        const { batch_Name, start_Date, end_Date, start_Time, end_Time, status } = req.body;

        if (!batch_Name || !start_Date || !end_Date || !start_Time || !end_Time || !status) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (new Date(end_Date) < new Date(start_Date)) {
            return res.status(400).json({ message: "End Date cannot be before Start Date" });
        }

        const existingBatch = await Batches.findOne({ batch_Name });
        if (existingBatch) {
            return res.status(400).json({ message: "Batch with this name already exists" });
        }

        const image = req.files.map(file => file.filename);

        const added_Data = await Batches.create({
            batch_Name,
            start_Date,
            end_Date,
            start_Time,
            end_Time,
            status,
            images: image
        });

        return res.status(201).json({ message: "Batch data added Successfully.", added_Data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const getAll = async (req, res) => {
    try {
        const data = await Batches.find();

        return res.status(200).json({ message: "Batches retrieved Successfully.", data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const getOne = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Batches.findById(id);

        if (!data) {
            return res.status(404).json({ message: "Batch not found" });
        }

        return res.status(200).json({ message: "Batch retrieved Successfully.", data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const update = async (req, res) => {
    try {
        const id = req.params.id;
        const { batch_Name, start_Date, end_Date, start_Time, end_Time, status } = req.body;

        if (!batch_Name || !start_Date || !end_Date || !start_Time || !end_Time || !status) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (new Date(end_Date) < new Date(start_Date)) {
            return res.status(400).json({ message: "End Date cannot be before Start Date" });
        }

        if (req.files && req.files.length > 0) {
            var image = req.files.map(file => file.filename);
        }

        const updated_data = await Batches.findByIdAndUpdate(id, { batch_Name, start_Date, end_Date, start_Time, end_Time, status, images: image }, { new: true });

        if (!updated_data) {
            return res.status(404).json({ message: "Batch not found" });
        }

        return res.status(200).json({ message: "Batch updated Successfully.", updated_data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const del = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted_data = await Batches.findByIdAndDelete(id);

        if (!deleted_data) {
            return res.status(404).json({ message: "Batch not found" });
        }

        return res.status(200).json({ message: "Batch deleted Successfully.", deleted_data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


module.exports = { add, getAll, getOne, update, del };