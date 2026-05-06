import express from "express";
import { 
  registerUser, 
  sendOTP, 
  verifyOTP, 
  logoutUser 
} from "../../admin/controllers/userAuthController.js";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Create a new user account
 */
router.post("/register", registerUser);

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to user mobile number
 */
router.post("/send-otp", sendOTP);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and return user + token (Login)
 */
router.post("/verify-otp", verifyOTP);

/**
 * @route   POST /api/auth/logout
 */
router.post("/logout", logoutUser);

export default router;