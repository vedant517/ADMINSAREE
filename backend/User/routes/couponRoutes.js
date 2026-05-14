import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { applyCoupon, markCouponUsed, getActiveCoupons, getCouponByCode } from "../controllers/couponController.js";

const router = express.Router();

router.post("/apply", protect, applyCoupon);
router.post("/mark-used", protect, markCouponUsed);
router.get("/", getActiveCoupons);
router.get("/:code", getCouponByCode);

export default router;
