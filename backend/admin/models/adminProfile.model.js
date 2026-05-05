import mongoose from "mongoose";

const adminProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      unique: true,
    },

    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },

    email: { type: String, required: true, unique: true },

    phoneNumber: { type: String, default: "" },

    dateOfBirth: { type: Date, default: null },

    countryCode: { type: String, default: "" },

    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },

    profileImageUrl: { type: String, default: "" },

    biography: { type: String, default: "" },

    // ❌ REMOVED socialMedia completely

    creditCard: {
      cardHolderName: { type: String, default: "" },
      last4: { type: String, default: "" },
      brand: { type: String, default: "" },
      expiryMonth: { type: String, default: "" },
      expiryYear: { type: String, default: "" },
      paymentToken: { type: String, default: "" },
    },

    role: {
      type: String,
      enum: ["superadmin", "manager", "editor"],
      default: "manager",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.models.AdminProfile || mongoose.model("AdminProfile", adminProfileSchema);