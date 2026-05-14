import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import { calculateDiscount } from "./couponController.js";
import { calculateShippingCharges } from "../../services/shiprocketService.js";

// =======================
// 🔹 GET USER FROM COOKIE
// =======================
const getUserId = (req) => {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    return null;
  }
};

// =======================
// 🔹 HELPER: GET FULL CART
// =======================
const getFullCart = async (userId) => {
  const cart = await Cart.find({ userId }).sort({ addedAt: -1 });
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  return { cart, totalItems };
};

// =======================
// ✅ GET CART BREAKDOWN
// =======================
export const getCartBreakdown = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { couponCode, pincode } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { cart } = await getFullCart(userId);
    if (cart.length === 0) {
      return res.json({
        success: true,
        breakdown: { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0 }
      });
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // 1. Discount
    let discount = 0;
    let couponDetails = null;
    if (couponCode) {
      try {
        const discResult = await calculateDiscount(couponCode, subtotal, userId);
        discount = discResult.discountAmount;
        couponDetails = discResult;
      } catch (err) {
        console.warn("Coupon ignored in breakdown:", err.message);
      }
    }

    // 2. Shipping
    let shipping = 0;
    if (pincode) {
      const totalWeight = cart.reduce((sum, item) => sum + (0.5 * item.quantity), 0); // Mock 0.5kg per item
      const shipResult = await calculateShippingCharges({ delivery_postcode: pincode, weight: totalWeight });
      if (shipResult.success) {
        shipping = shipResult.data.shipping_cost;
      }
    } else {
      shipping = subtotal < 500 ? 50 : 0;
    }

    // 3. Tax (18% GST)
    const taxableAmount = subtotal - discount;
    const tax = Number((taxableAmount * 0.18).toFixed(2));

    const total = taxableAmount + shipping + tax;

    res.json({
      success: true,
      data: {
        subtotal,
        discount,
        couponDetails,
        shipping,
        tax,
        total,
        currency: "INR"
      }
    });

  } catch (error) {
    console.error("BREAKDOWN ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// ✅ GET CART
// =======================
export const getCart = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.json({
        success: true,
        cart: [],
        totalItems: 0,
      });
    }

    const data = await getFullCart(userId);
    res.json({ success: true, ...data });

  } catch (error) {
    console.error("GET CART ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// ✅ ADD TO CART
// =======================
export const addToCart = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "guestId or token required",
      });
    }

    const { productId, name, price, image, quantity = 1, selectedVariant } = req.body;

    if (!productId || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "productId, name, and price are required",
      });
    }

    const existingItem = await Cart.findOne({
      userId,
      productId,
      ...(selectedVariant?.name && {
        "selectedVariant.name": selectedVariant.name,
      }),
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      await Cart.create({
        userId,
        productId,
        name,
        price,
        image,
        quantity,
        selectedVariant,
        addedAt: new Date(),
      });
    }

    const data = await getFullCart(userId);

    res.json({
      success: true,
      message: "Added to cart",
      ...data,
    });

  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// ✅ UPDATE CART ITEM
// =======================
export const updateCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "guestId or token required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    const updatedItem = await Cart.findOneAndUpdate(
      { _id: id, userId },
      { quantity },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    const data = await getFullCart(userId);

    res.json({
      success: true,
      message: "Cart updated",
      ...data,
    });

  } catch (error) {
    console.error("UPDATE CART ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// ✅ REMOVE FROM CART
// =======================
export const removeFromCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "guestId or token required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
      });
    }

    const deletedItem = await Cart.findOneAndDelete({ _id: id, userId });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    const data = await getFullCart(userId);

    res.json({
      success: true,
      message: "Removed from cart",
      ...data,
    });

  } catch (error) {
    console.error("REMOVE CART ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================
// ✅ CLEAR CART
// =======================
export const clearCart = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "guestId or token required",
      });
    }

    await Cart.deleteMany({ userId });

    res.json({
      success: true,
      message: "Cart cleared",
      cart: [],
      totalItems: 0,
    });

  } catch (error) {
    console.error("CLEAR CART ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
