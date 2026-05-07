import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email }).lean();
    if (!admin) {
      return res.status(400).json({ msg: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: admin._id.toString(),
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Required for cross-origin cookies on Render
      sameSite: "None", // Required for cross-origin cookies on Render
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      message: "Login successful",
      role: admin.role
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: error.message });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", { 
    path: "/",
    secure: true,
    sameSite: "None"
  });
  res.status(200).json({ message: "Logged out successfully" });
};

