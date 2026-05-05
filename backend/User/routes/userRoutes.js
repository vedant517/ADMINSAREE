import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";

const router = express.Router();

// @desc    Get current user orders
// @route   GET /api/user/orders
// @access  Private
router.get("/orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: orders 
    });
  } catch (err) {
    console.error("Get user orders error:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Server error fetching orders." 
    });
  }
});

export default router;
