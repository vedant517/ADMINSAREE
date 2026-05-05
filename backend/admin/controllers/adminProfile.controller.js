import AdminProfile from "../models/adminProfile.model.js";
import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";

// GET PROFILE
export const getProfile = async (req, res) => {
  try {
    let profile = await AdminProfile.findOne({ userId: req.user._id });

    // Auto create if not exists
    if (!profile) {
      const admin = await Admin.findById(req.user._id);

      profile = await AdminProfile.create({
        userId: req.user._id,
        email: admin?.email || "",
        firstName: admin?.name || "Admin",
      });
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE PROFILE (SAFE)
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
      profileImageUrl: req.body.profileImageUrl,
      countryCode: req.body.countryCode,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address,
      // ❌ REMOVED socialMedia
      creditCard: req.body.creditCard,
    };

    Object.keys(allowedFields).forEach(
      (key) =>
        allowedFields[key] === undefined && delete allowedFields[key]
    );

    const profile = await AdminProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: allowedFields },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE PASSWORD
export const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await Admin.findByIdAndUpdate(req.user._id, {
      password: hashed,
    });

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};