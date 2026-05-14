import express from "express";
import { 
  registerUser, 
  sendOTP, 
  verifyOTP, 
  logoutUser 
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/logout", logoutUser);

export default router;