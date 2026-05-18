import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { 
  applyCoupon, 
  markCouponUsed, 
  getActiveCoupons, 
  getCouponByCode,
  getAllCoupons,
  toggleCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon
} from "../controllers/couponController.js";

const router = express.Router();

// ✅ PUBLIC: Get active coupons (used by storefront)
router.get("/", getActiveCoupons);

// ✅ PUBLIC: Apply a coupon (userId passed in body, no cookie needed for Render)
router.post("/apply", applyCoupon);

// ✅ PUBLIC: Get coupon by code
router.get("/:code", getCouponByCode);

// ─── Admin-only routes ────────────────────────────────────
// ✅ Admin: Get all coupons (including inactive)
router.get("/admin/all", protect, authorize('admin'), getAllCoupons);

// ✅ Admin: Create coupon
router.post("/", protect, authorize('admin'), createCoupon);

// ✅ Admin: Update coupon
router.put("/:id", protect, authorize('admin'), updateCoupon);

// ✅ Admin: Delete coupon
router.delete("/:id", protect, authorize('admin'), deleteCoupon);

// ✅ Admin: Toggle coupon active status
router.patch("/:id/toggle", protect, authorize('admin'), toggleCoupon);

// ✅ Protected: Mark coupon as used (called after successful order)
router.post("/mark-used", protect, markCouponUsed);

export default router;
