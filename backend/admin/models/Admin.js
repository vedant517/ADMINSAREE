import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "User"
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "admin" // Changed default to admin for this model context
    }
  },
  { timestamps: true }
);

export default mongoose.models.Admin || mongoose.model("Admin", adminSchema, "Admin");
