import mongoose from "mongoose";

const passwordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    newPasswordHash: { type: String, required: true },
    passwordSalt: String,

    passwordUpdatedAt: { type: Date, default: Date.now },
    passwordHistory: [{ type: String }],

    passwordResetToken: String,
    passwordResetExpires: Date,

    failedAttempts: { type: Number, default: 0 },
    lockedUntil: Date,

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    updateReason: {
      type: String,
      enum: ["user_request", "admin_reset", "security_policy"],
    },

    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

export default mongoose.models.AdminPassword || mongoose.model("AdminPassword", passwordSchema);