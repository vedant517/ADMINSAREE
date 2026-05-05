import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    userId: {
      type: String,
      required: false,
    },
    // Billing / Shipping fields (matching the checkout form)
    firstName:  { type: String, required: true },
    lastName:   { type: String, required: true },
    email:      { type: String, required: true },
    phoneNumber:{ type: String, required: true },
    address:    { type: String, required: true },
    country:    { type: String, required: true },
    state:      { type: String, required: true },
    city:       { type: String, required: true },
    zipCode:    { type: String, required: true },

    // Keep old nested format as optional fallback for compatibility
    contact: {
      emailOrPhone: { type: String },
    },
    shippingAddress: {
      fullName:   { type: String },
      phone:      { type: String },
      address:    { type: String },
      city:       { type: String },
      postalCode: { type: String },
      state:      { type: String },
      landmark:   { type: String },
      country:    { type: String, default: "India" },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Address || mongoose.model("Address", addressSchema);
