import Coupon from "../models/Coupon.js";
import jwt from "jsonwebtoken";


/* Helper: calculate discount amount */
export const calculateDiscount = async (code, orderTotal, userId) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
  if (!coupon) throw new Error("Invalid or inactive coupon");

  const now = new Date();
  if (now < coupon.validFrom) throw new Error("Coupon is not yet valid");
  if (now > coupon.validUntil) throw new Error("Coupon has expired");
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new Error("Coupon usage limit reached");
  if (orderTotal < coupon.minOrderValue) throw new Error(`Minimum order value of ₹${coupon.minOrderValue} required`);

  if (userId && coupon.usagePerUser) {
    const userUsageCount = coupon.usedBy.filter(u => u.userId.toString() === userId.toString()).length;
    if (userUsageCount >= coupon.usagePerUser) throw new Error("Maximum usage reached for this user");
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (orderTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
  } else {
    discountAmount = coupon.discountValue;
  }
  discountAmount = Math.min(discountAmount, orderTotal);

  return {
    code: coupon.code,
    discountAmount: Math.round(discountAmount),
    discountType: coupon.discountType,
    discountValue: coupon.discountValue
  };
};

// APPLY COUPON     
export const applyCoupon = async (req, res) => {
  const { code, orderTotal, userId } = req.body;
  if (!code || orderTotal == null) return res.status(400).json({ success: false, message: "Required fields missing" });
  try {
    const result = await calculateDiscount(code, orderTotal, userId || req.user?.id);
    res.json({
      success: true,
      data: { ...result, finalTotal: orderTotal - result.discountAmount },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// MARK USED
export const markCouponUsed = async (req, res) => {
  const { code, userId } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase()?.trim() });
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

  coupon.usedCount += 1;
  if (userId || req.user?.id) coupon.usedBy.push({ userId: userId || req.user.id, usedAt: new Date() });
  await coupon.save();
  res.json({ success: true, message: "Coupon marked as used" });
};

// GET ACTIVE COUPONS (Visible to users, all visible to admin)
export const getActiveCoupons = async (req, res) => {
  try {
    const token = req.cookies?.token;
    let isAdmin = false;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'admin') isAdmin = true;
      } catch (err) {
        // Ignore token error for public view
      }
    }

    let query = {
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } }
      ]
    };

    // If admin, show everything
    if (isAdmin) {
      query = {};
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// GET COUPON BY CODE (Check details before applying)
export const getCouponByCode = async (req, res) => {
  const { code } = req.params;
  try {
    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true
    }).select("code description discountType discountValue minOrderValue maxDiscount validUntil validFrom usageLimit usedCount usagePerUser");

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found or inactive" });
    }

    const now = new Date();
    const isValid = coupon.isActive &&
                    now >= coupon.validFrom &&
                    now <= coupon.validUntil &&
                    (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit);

    res.json({
      success: true,
      data: {
        ...coupon.toObject(),
        isValid3
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: GET ALL COUPONS
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: TOGGLE COUPON STATUS
export const toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: CREATE COUPON
export const createCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const exists = await Coupon.findOne({ code: code?.toUpperCase()?.trim() });
    if (exists) {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: UPDATE COUPON
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: DELETE COUPON
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



