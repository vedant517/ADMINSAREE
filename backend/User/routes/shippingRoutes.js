import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/shipping/calculate
// @desc    Calculate shipping charges based on order amount
// @access  Public (or Private if you prefer)
router.post("/calculate", (req, res) => {
  try {
    const { amount } = req.body;

    if (amount === undefined || amount === null) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const numAmount = Number(amount);
    let shippingCharge = 0;

    if (numAmount < 500) {
      shippingCharge = 0; // Removed shipping charges
    } else if (numAmount < 1000) {
      shippingCharge = 0; // Removed shipping charges
    } else {
      shippingCharge = 0;
    }

    res.json({
      success: true,
      amount: numAmount,
      shippingCharge,
      totalWithShipping: numAmount + shippingCharge,
      tiers: {
        below500: 50,
        below1000: 30,
        above1000: 0
      }
    });
  } catch (error) {
    console.error("Shipping calculation error:", error);
    res.status(500).json({ success: false, message: "Server error calculating shipping" });
  }
});

export default router;
