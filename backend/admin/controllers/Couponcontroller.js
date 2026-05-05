import Coupon from "../models/couponModel.js";

/* helper */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ================= ADMIN ================= */

const createCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const exists = await Coupon.findOne({ code: code?.toUpperCase()?.trim() });
  if (exists) {
    return res.status(400).json({ success: false, message: "Coupon code already exists" });
  }

  const coupon = await Coupon.create(req.body);

  res.status(201).json({ success: true, data: coupon });
});

const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, data: coupons });
});

const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
  res.json({ success: true, data: coupon });
});


const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: coupon });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Coupon deleted" });
});

const toggleCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  res.json({ success: true, data: coupon });
});

/* ================= USER ================= */

const applyCoupon = asyncHandler(async (req, res) => {
  const { code, orderTotal, userId } = req.body;

  if (!code || orderTotal == null) {
    return res.status(400).json({ success: false, message: "Coupon code and order total are required" });
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });

  if (!coupon) {
    return res.status(404).json({ success: false, message: "Invalid or inactive coupon" });
  }

  const now = new Date();
  if (now < coupon.validFrom) {
    return res.status(400).json({ success: false, message: "Coupon is not yet valid" });
  }
  if (now > coupon.validUntil) {
    return res.status(400).json({ success: false, message: "Coupon has expired" });
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
  }

  if (orderTotal < coupon.minOrderValue) {
    return res.status(400).json({ 
      success: false, 
      message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon` 
    });
  }

  // Check usage per user
  if (userId && coupon.usagePerUser) {
    const userUsageCount = coupon.usedBy.filter(u => u.userId.toString() === userId.toString()).length;
    if (userUsageCount >= coupon.usagePerUser) {
      return res.status(400).json({ success: false, message: "You have already used this coupon maximum times" });
    }
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (orderTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  // Discount shouldn't exceed order total
  discountAmount = Math.min(discountAmount, orderTotal);

  const finalTotal = orderTotal - discountAmount;

  res.json({
    success: true,
    data: {
      code: coupon.code,
      discountAmount,
      finalTotal,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    },
  });
});

const markCouponUsed = asyncHandler(async (req, res) => {
  const { code, userId } = req.body;

  const coupon = await Coupon.findOne({ code: code?.toUpperCase()?.trim() });
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

  coupon.usedCount += 1;
  if (userId) {
    coupon.usedBy.push({ userId, usedAt: new Date() });
  }
  await coupon.save();

  res.json({ success: true, message: "Coupon marked as used" });
}); //

export {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
  applyCoupon,
  markCouponUsed,
};
