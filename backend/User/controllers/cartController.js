import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
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

const getProductImage = (product, fallback) => {
  const first = Array.isArray(product?.images) ? product.images[0] : null;
  if (typeof first === "string") return first;
  return first?.secure_url || first?.url || first?.path || product?.image || fallback;
};

const getCurrentProductPrice = (product, selectedVariant) => {
  const variantKey = selectedVariant?._id || selectedVariant?.id || selectedVariant?.value || selectedVariant?.name;
  const variant = variantKey
    ? (product?.variants || []).find((v) =>
        String(v._id || v.id || v.color || v.fabric || v.name) === String(variantKey) ||
        String(v.color || "").toLowerCase() === String(variantKey).toLowerCase() ||
        String(v.fabric || "").toLowerCase() === String(variantKey).toLowerCase()
      )
    : (product?.variants || []).find((v) =>
        (selectedVariant?.color && String(v.color || "").toLowerCase() === String(selectedVariant.color).toLowerCase()) ||
        (selectedVariant?.fabric && String(v.fabric || "").toLowerCase() === String(selectedVariant.fabric).toLowerCase())
      );

  return Number(variant?.price || product?.discountPrice || product?.discounted_price || product?.price || 0);
};

const refreshCartItemPricing = async (item) => {
  const product = await Product.findById(item.productId).lean().catch(() => null);
  if (!product) return item;

  const current = {
    name: product.name,
    price: getCurrentProductPrice(product, item.selectedVariant),
    image: getProductImage(product, item.image),
  };

  if (item.name !== current.name || item.price !== current.price || item.image !== current.image) {
    await Cart.updateOne({ _id: item._id }, { $set: current });
  }

  const plainItem = typeof item.toObject === "function" ? item.toObject() : item;
  return { ...plainItem, ...current };
};

// =======================
// 🔹 HELPER: GET FULL CART
// =======================
const getFullCart = async (userId) => {
  const cartItems = await Cart.find({ userId }).sort({ addedAt: -1 });
  const cart = await Promise.all(cartItems.map(refreshCartItemPricing));
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

    const { productId, quantity = 1, selectedVariant } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required",
      });
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const currentPrice = getCurrentProductPrice(product, selectedVariant);

    const existingItem = await Cart.findOne({
      userId,
      productId,
      ...(selectedVariant?.name && {
        "selectedVariant.name": selectedVariant.name,
      }),
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.name = product.name;
      existingItem.price = currentPrice;
      existingItem.image = getProductImage(product, existingItem.image);
      await existingItem.save();
    } else {
      await Cart.create({
        userId,
        productId,
        name: product.name,
        price: currentPrice,
        image: getProductImage(product, req.body.image),
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
