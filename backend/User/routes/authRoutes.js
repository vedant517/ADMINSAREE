import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  registerUser,
  sendOTP,
  verifyOTP,
  logoutUser,
  getCurrentUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/logout", logoutUser);
router.get("/me", protect, getCurrentUser);

export default router;
