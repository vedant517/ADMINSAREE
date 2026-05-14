import mongoose from "mongoose";

// Single unified Coupon schema used by both Admin and User sides
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Code must be at least 3 characters"],
      maxlength: [20, "Code cannot exceed 20 characters"],
    },
    description: { type: String, default: "", trim: true },
    discountType: {
      type: String,
      // Accept both "flat" (admin) and "fixed" (user) — normalize to "flat"
      enum: ["percentage", "flat", "fixed"],
      required: true,
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount cannot be negative"],
    },
    minOrderValue: { type: Number, default: 0, min: 0 },
    maxDiscount:   { type: Number, default: null },
    usageLimit:    { type: Number, default: null, min: 1 },
    usagePerUser:  { type: Number, default: 1, min: 1 },
    usedCount:     { type: Number, default: 0 },
    // Unified usedBy — store userId and when they used it
    usedBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        usedAt: { type: Date, default: Date.now }
      }
    ],
    validFrom:  { type: Date, default: Date.now },
    validUntil: { type: Date, required: [true, "Expiry date is required"] },
    isActive:   { type: Boolean, default: true },
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    applicableProducts:   [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

couponSchema.virtual("isValid").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.validFrom &&
    now <= this.validUntil &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
});

couponSchema.set("toJSON", { virtuals: true });
couponSchema.set("toObject", { virtuals: true });

export default mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);