import express from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
  applyCoupon,
  markCouponUsed,
} from "../controllers/Couponcontroller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// protect all admin-only routes
// Admin routes
router.get("/", getAllCoupons);
router.post("/", protect, authorize('admin'), createCoupon);
router.get("/:id", protect, authorize('admin'), getCouponById);
router.put("/:id", protect, authorize('admin'), updateCoupon);
router.delete("/:id", protect, authorize('admin'), deleteCoupon);
router.patch("/:id/toggle", protect, authorize('admin'), toggleCoupon);

// User/Checkout routes
router.post("/apply", protect, applyCoupon);
router.post("/mark-used", protect, markCouponUsed);

export default router;