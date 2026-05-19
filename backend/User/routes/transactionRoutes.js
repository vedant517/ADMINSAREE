import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createRazorpayOrder, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

// User Transaction Flow for Storefront Checkout
router.post("/create-order", protect, createRazorpayOrder);
router.post("/verify", protect, verifyPayment);

export default router;
