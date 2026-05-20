import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import nodemailer from "nodemailer";

// Simple In-Memory Store for OTPs
const otpStore = {};

const normalizeIdentifier = ({ phonenum, email, identifier }) => {
  const raw = String(identifier || email || phonenum || "").trim();
  if (!raw) return null;
  const isEmail = raw.includes("@");
  return {
    key: isEmail ? raw.toLowerCase() : raw.replace(/\D/g, ""),
    type: isEmail ? "email" : "mobile",
  };
};

const findUserByIdentifier = ({ key, type }) => {
  return type === "email"
    ? User.findOne({ email: key })
    : User.findOne({ phonenum: key });
};

const sendEmailOtp = async (email, otp) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Your Sheetalya login OTP",
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
  });
  return true;
};

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing." });
    }
    const { name, phonenum, email } = req.body;

    if (!name || !phonenum || !email) {
      return res.status(400).json({ message: "Name, Mobile number, and Email are required." });
    }

    // Check if user already exists with mobile
    const existingMobile = await User.findOne({ phonenum });
    if (existingMobile) {
      return res.status(400).json({ message: "User already exists with this mobile number. Please login." });
    }

    // Check if user already exists with email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "User already exists with this email address." });
    }

    // Create user
    const user = await User.create({
      name,
      phonenum,
      email,
      role: 'user'
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully. Please login with OTP.",
      user: {
        id: user._id,
        name: user.name,
        phonenum: user.phonenum,
        email: user.email
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
    const identifier = normalizeIdentifier(req.body || {});

    if (!identifier?.key) {
      return res.status(400).json({ message: "Mobile number or email is required." });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({ message: "User not found. Please create an account first." });
    }

    // Generate 6-digit OTP
    const otp = "123456"; // FOR DEMO: Always use 123456
    const expiry = Date.now() + 10 * 60 * 1000; // 10 mins

    otpStore[identifier.key] = { otp, expiry, type: identifier.type };

    let delivered = false;
    if (identifier.type === "email") {
      try {
        delivered = await sendEmailOtp(identifier.key, otp);
      } catch (mailError) {
        console.warn(`[AUTH] Email OTP delivery failed for ${identifier.key}:`, mailError.message);
      }
    }

    console.log(`[AUTH] OTP for ${identifier.type} ${identifier.key}: ${otp}`);

    res.status(200).json({ 
      success: true,
      channel: identifier.type,
      delivered,
      message: `OTP sent successfully to ${identifier.type} (Demo Mode: 123456)` 
    });
  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// VERIFY OTP (LOGIN)
export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const identifier = normalizeIdentifier(req.body || {});
    const sanitizedOtp = String(otp || "").trim().replace(/\s/g, "");

    if (!identifier?.key || !otp) {
      return res.status(400).json({ message: "Mobile number/email and OTP are required" });
    }

    const stored = otpStore[identifier.key];
    const isMaster = sanitizedOtp === "123456";

    if (!isMaster) {
      if (!stored) {
        return res.status(400).json({ message: "OTP not found or session expired. Please resend code." });
      }
      if (stored.otp !== sanitizedOtp) {
        return res.status(400).json({ message: "Invalid OTP code. Please try again." });
      }
      if (Date.now() > stored.expiry) {
        delete otpStore[identifier.key];
        return res.status(400).json({ message: "OTP has expired. Please resend code." });
      }
    }

    // OTP Verified -> Get User
    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({ message: "User record lost. Please register again." });
    }

    // Clean up store
    delete otpStore[identifier.key];

    // Create JWT
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role }, 
      process.env.JWT_SECRET || "fallback_secret", 
      { expiresIn: "7d" }
    );

    // Set Cookie
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // Only secure in production
      sameSite: isProduction ? "None" : "Lax", // None requires Secure, Lax is fine for local
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,  // ✅ Return token in body for cross-origin (Render) environments
      user: {
        id: user._id,
        name: user.name,
        phonenum: user.phonenum,
        email: user.email,
        role: user.role,
        token,  // ✅ Also embed in user object so frontend can read it easily
      }
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// LOGOUT
export const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("token", { 
    path: "/",
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax"
  });
  res.status(200).json({ 
    success: true,
    message: "Logged out successfully" 
  });
};
