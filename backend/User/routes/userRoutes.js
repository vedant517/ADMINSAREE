import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";

const router = express.Router();

// @desc    Notification badge count (undelivered orders for logged-in user)
// @route   GET /api/user/notifications/count
// @access  Private
router.get("/notifications/count", protect, async (req, res) => {
  try {
    const count = await Order.countDocuments({
      user: req.user._id,
      isDelivered: { $ne: true },
    });
    res.json({ success: true, count });
  } catch (err) {
    console.error("Notification count error:", err.message);
    res.status(500).json({ success: false, message: "Server error fetching notifications." });
  }
});

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
