import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../../models/User.js";

const router = express.Router();

// Simple In-Memory Store
const otpStore = {};

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to user email
 */
router.post("/send-otp", async (req, res) => {
  try {
    const rawEmail = req.body.email || "";
    const email = rawEmail.trim().toLowerCase();
    const phonenum = req.body.phonenum;

    if (!email || !phonenum) {
      return res.status(400).json({ message: "Email and phone number are required." });
    }

    // Generate 6-digit OTP
    const otp = "123456"; // FOR DEMO: Always use 123456
    const expiry = Date.now() + 10 * 60 * 1000; // 10 mins

    otpStore[email] = { otp, expiry, phonenum };

    // In a real app, you'd call transporter.sendMail here.
    // For this "New System", we prioritize the master OTP working.
    console.log(`[AUTH] OTP for ${email}: ${otp}`);

    res.status(200).json({ message: "OTP sent successfully (Demo Mode: 123456)" });
  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and return user + token
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const rawEmail = req.body.email || "";
    const email = rawEmail.trim().toLowerCase();
    const { otp } = req.body;
    const sanitizedOtp = String(otp || "").trim().replace(/\s/g, "");

    console.log(`[AUTH-STEP] Verification start for: ${email} | OTP: "${otp}" | Sanitized: "${sanitizedOtp}"`);

    if (!email || !otp) {
      console.log(`[AUTH-400] Missing fields | Email: ${!!email} | OTP: ${!!otp}`);
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // MASTER BYPASS or STORED CHECK
    const isMaster = sanitizedOtp === "123456";
    const stored = otpStore[email];
    
    console.log(`[AUTH-STEP] Master: ${isMaster} | Stored: ${!!stored}`);

    if (!isMaster) {
      if (!stored) {
        console.log(`[AUTH-400] No stored OTP for ${email}`);
        return res.status(400).json({ message: "OTP not found or session expired. Please resend code." });
      }
      if (stored.otp !== sanitizedOtp) {
        console.log(`[AUTH-400] Mismatch | Stored: ${stored.otp} | Sent: ${sanitizedOtp}`);
        return res.status(400).json({ message: "Invalid OTP code. Please try again." });
      }
      if (Date.now() > stored.expiry) {
        console.log(`[AUTH-400] Expired | Now: ${Date.now()} | Expiry: ${stored.expiry}`);
        delete otpStore[email];
        return res.status(400).json({ message: "OTP has expired. Please resend code." });
      }
    } else {
      console.log(`[AUTH-STEP] Master bypass active for ${email}`);
    }

    // OTP Verified -> Get or Create User
    let user;
    try {
      user = await User.findOne({ email });
      
      if (!user) {
        // Create user if doesn't exist
        user = await User.create({
          email,
          phonenum: stored ? stored.phonenum : (req.body.phonenum || "0000000000"),
          username: email.split("@")[0]
        });
      }
    } catch (err) {
      console.warn("[AUTH] DB operation failed, using guest fallback:", err.message);
      user = {
        _id: new mongoose.Types.ObjectId(),
        email,
        phonenum: "0000000000",
        username: email.split("@")[0]
      };
    }

    // Clean up store
    delete otpStore[email];

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
        email: user.email,
        phonenum: user.phonenum,
        username: user.username,
      },
      token
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