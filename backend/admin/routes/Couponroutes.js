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

// protect all routes
router.use(protect);

// Admin routes
router.get("/", authorize('admin'), getAllCoupons);
router.post("/", authorize('admin'), createCoupon);
router.get("/:id", authorize('admin'), getCouponById);
router.put("/:id", authorize('admin'), updateCoupon);
router.delete("/:id", authorize('admin'), deleteCoupon);
router.patch("/:id/toggle", authorize('admin'), toggleCoupon);

// User/Checkout routes
router.post("/apply", applyCoupon);
router.post("/mark-used", markCouponUsed);

export default router;