import Enquiry from "../models/Enquiry.js";

// SUBMIT ENQUIRY
export const submitEnquiry = async (req, res) => {
  try {
    const { name, contactNo, email, message } = req.body;
    if (!name || !contactNo || !email || !message) {
      return res.status(400).json({ success: false, message: "Please fill all fields" });
    }
    const enquiry = await Enquiry.create({ name, contactNo, email, message });
    res.status(201).json({ success: true, data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
