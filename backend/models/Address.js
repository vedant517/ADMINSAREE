import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional to support admin side
    },
    userId: {
      type: String,
      required: false, // Optional to support user side
    },
    contact: {
      emailOrPhone: {
        type: String,
        required: true,
      },
    },
    shippingAddress: {
      fullName: {
        type: String,
      },
      phone: {
        type: String,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      state: {
        type: String,
      },
      landmark: {
        type: String,
      },
      country: {
        type: String,
        default: "India",
      },
    },
  },
  { timestamps: true }
);

// Prevent re-definition error and ensure we use the same model everywhere
export default mongoose.models.Address || mongoose.model("Address", addressSchema);
