import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  phonenum: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);