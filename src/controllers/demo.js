const { Batches } = require("../modals/demo")

const add = async (req, res) => {
    try {
        const { BatchName, StartDate, EndDate, StartTime, EndTime, status } = req.body

        const added_Data = Batches.create({
            BatchName,
            StartDate,
            EndDate,
            StartTime,
            EndTime,
            status
        })

        res.status(200).json({ message: "batch data successfully", added_Data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { add };