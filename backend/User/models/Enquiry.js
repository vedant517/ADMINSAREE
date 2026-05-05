import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contactNo: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['New', 'In Progress', 'Resolved'], 
      default: 'New' 
    },
  },
  { timestamps: true }
);

export default mongoose.models.Enquiry || mongoose.model("Enquiry", enquirySchema);
