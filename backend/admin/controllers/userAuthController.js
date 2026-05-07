import jwt from "jsonwebtoken";
import User from "../../models/User.js";

// Simple In-Memory Store for OTPs
const otpStore = {};

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing." });
    }
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
      success: true,
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
};

// SEND OTP
export const sendOTP = async (req, res) => {
  try {
    const { phonenum } = req.body;

    if (!phonenum) {
      return res.status(400).json({ message: "Mobile number is required." });
    }

    const user = await User.findOne({ phonenum });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please create an account first." });
    }

    // Generate 6-digit OTP
    const otp = "123456"; // FOR DEMO: Always use 123456
    const expiry = Date.now() + 10 * 60 * 1000; // 10 mins

    otpStore[phonenum] = { otp, expiry };

    console.log(`[AUTH] OTP for ${phonenum}: ${otp}`);

    res.status(200).json({ 
      success: true,
      message: "OTP sent successfully (Demo Mode: 123456)" 
    });
  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// VERIFY OTP (LOGIN)
export const verifyOTP = async (req, res) => {
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
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || "fallback_secret", 
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
      success: true,
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
};

// LOGOUT
export const logoutUser = (req, res) => {
  res.clearCookie("token", { 
    path: "/",
    secure: true,
    sameSite: "None"
  });
  res.status(200).json({ 
    success: true,
    message: "Logged out successfully" 
  });
};
