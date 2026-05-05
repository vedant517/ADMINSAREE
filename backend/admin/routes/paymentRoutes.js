import express from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  getRazorpayKey,
} from '../controllers/paymentController.js';
import { protect } from "../../User/middleware/authMiddleware.js";

const router = express.Router();

// Public - get Razorpay key for frontend
router.get('/key', getRazorpayKey);

// Protected - create order & verify payment
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);

export default router;

