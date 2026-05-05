import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../../models/User.js";

const router = express.Router();

// Simple In-Memory Store for OTPs
const otpStore = {};

/**
 * @route   POST /api/auth/register
 * @desc    Create a new user account
 */
router.post("/register", async (req, res) => {
  try {
    const { name, phonenum } = req.body;

    if (!name || !phonenum) {
      return res.status(400).json({ message: "Name and Mobile number are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phonenum });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this mobile number. Please login." });
    }

    // Create user
    const user = await User.create({
      name,
      phonenum,
      role: 'user'
    });

    res.status(201).json({
      message: "Account created successfully. Please login with OTP.",
      user: {
        id: user._id,
        name: user.name,
        phonenum: user.phonenum
      }
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
});

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to user mobile number
 */
router.post("/send-otp", async (req, res) => {
  try {
    const { phonenum } = req.body;

    if (!phonenum) {
      return res.status(400).json({ message: "Mobile number is required." });
    }

    // Check if user exists (optional, maybe allow any phone to get OTP then register)
    // But based on the screenshot, "Create Account" is separate from "Login".
    // So for Login, the user should probably exist.
    const user = await User.findOne({ phonenum });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please create an account first." });
    }

    // Generate 6-digit OTP
    const otp = "123456"; // FOR DEMO: Always use 123456
    const expiry = Date.now() + 10 * 60 * 1000; // 10 mins

    otpStore[phonenum] = { otp, expiry };

    console.log(`[AUTH] OTP for ${phonenum}: ${otp}`);

    res.status(200).json({ message: "OTP sent successfully (Demo Mode: 123456)" });
  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and return user + token (Login)
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { phonenum, otp } = req.body;
    const sanitizedOtp = String(otp || "").trim().replace(/\s/g, "");

    if (!phonenum || !otp) {
      return res.status(400).json({ message: "Mobile number and OTP are required" });
    }

    const stored = otpStore[phonenum];
    const isMaster = sanitizedOtp === "123456";

    if (!isMaster) {
      if (!stored) {
        return res.status(400).json({ message: "OTP not found or session expired. Please resend code." });
      }
      if (stored.otp !== sanitizedOtp) {
        return res.status(400).json({ message: "Invalid OTP code. Please try again." });
      }
      if (Date.now() > stored.expiry) {
        delete otpStore[phonenum];
        return res.status(400).json({ message: "OTP has expired. Please resend code." });
      }
    }

    // OTP Verified -> Get User
    const user = await User.findOne({ phonenum });
    if (!user) {
      return res.status(404).json({ message: "User record lost. Please register again." });
    }

    // Clean up store
    delete otpStore[phonenum];

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "7d",
    });

    // Set Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        phonenum: user.phonenum,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   POST /api/auth/logout
 */
router.post("/logout", (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;