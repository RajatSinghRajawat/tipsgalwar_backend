const { Students } = require("../modals/students");

const add_student = async (req, res) => {
    try {
        const { course_id, batch_id, enrollment_id, name, father_name, mother_name, address, aadhar, pan_card, emi, contact, email, password, dob } = await req.body;
        
        const data = await Students.create({
            course_id,
            batch_id,
            enrollment_id,
            name,
            father_name,
            mother_name,
            address,
            aadhar,
            pan_card,
            emi,
            contact,
            email,
            password,
            dob
        })

        return res.status(201).json({ message: "Data added Successfully.", data })
    } catch (error) {
        return res.status(500).json({ message: error.message })
        console.log(error.message);
    }
}

module.exports = { add_student }