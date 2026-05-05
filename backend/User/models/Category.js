import mongoose from "mongoose";


const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, lowercase: true, unique: true },
    description: { type: String },
    image: { type: String },

  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model("Category", categorySchema);
