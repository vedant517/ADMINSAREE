import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Coupon from "../models/Coupon.js";

const router = express.Router();

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
router.post("/validate", protect, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid or expired coupon code" });
    }

    // Check dates
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({ success: false, message: "Coupon is not valid at this time" });
    }

    // Check min order value
    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order value for this coupon is ₹${coupon.minOrderValue}` 
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    }

    // Check user usage
    const userUsageCount = coupon.usedBy.filter(id => id.toString() === req.user._id.toString()).length;
    if (userUsageCount >= coupon.usagePerUser) {
      return res.status(400).json({ success: false, message: "You have already used this coupon" });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      success: true,
      message: "Coupon applied successfully",
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
      }
    });

  } catch (err) {
    console.error("Coupon validation error:", err.message);
    res.status(500).json({ success: false, message: "Server error validating coupon" });
  }
});

// @desc    Get all active coupons
// @route   GET /api/coupons
// @access  Public
router.get("/", async (req, res) => {
  try {
    const coupons = await Coupon.find({ 
      isActive: true, 
      validUntil: { $gte: new Date() } 
    }).select("-usedBy -usedCount");
    
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error fetching coupons" });
  }
});

export default router;
