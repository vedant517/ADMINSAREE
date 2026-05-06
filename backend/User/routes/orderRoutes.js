import express from "express";
import { protect as userProtect } from "../middleware/authMiddleware.js";
import { 
  getOrders, 
  updateOrder, 
  getOrderStats 
} from "../../admin/controllers/orderController.js";
import { 
  createOrder, 
  getUserOrders, 
  cancelOrder 
} from "../../admin/controllers/userOrderController.js";
import { protect as adminProtect, authorize } from "../../admin/middleware/authMiddleware.js";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";

const router = express.Router();

// @desc    Calculate order total (Breaking down shipping, tax, discounts)
// @route   POST /api/orders/calculate
// @access  Public (or Private)
router.post("/calculate", async (req, res) => {
  try {
    const { orderItems, couponCode } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: "No items provided" });
    }

    let itemsPrice = 0;
    const items = [];

    // 1. Calculate base items price from DB (Secure)
    for (const item of orderItems) {
      const product = await Product.findById(item.product || item.productId || item._id);
      if (!product) continue;
      
      const price = product.discountPrice > 0 ? product.discountPrice : product.price;
      const qty = parseInt(item.qty || item.quantity || 1);
      
      itemsPrice += price * qty;
      items.push({
        name: product.name,
        price: price,
        qty: qty,
        total: price * qty
      });
    }

    // 2. Calculate Shipping (Standard Logic)
    let shippingPrice = 0;
    if (itemsPrice < 500) {
      shippingPrice = 50;
    } else if (itemsPrice < 1000) {
      shippingPrice = 30;
    } else {
      shippingPrice = 0;
    }

    // 3. Calculate Tax (18% GST)
    const taxPrice = Number((itemsPrice * 0.18).toFixed(2));

    // 4. Handle Coupon
    let discount = 0;
    let couponInfo = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        const now = new Date();
        if (now >= coupon.validFrom && now <= coupon.validUntil) {
          if (coupon.discountType === 'percentage') {
            discount = (itemsPrice * coupon.discountValue) / 100;
          } else {
            discount = coupon.discountValue;
          }
          // Cap discount at itemsPrice
          discount = Math.min(discount, itemsPrice);
          couponInfo = {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue
          };
        }
      }
    }

    const totalPrice = itemsPrice + shippingPrice + taxPrice - discount;

    res.json({
      success: true,
      data: {
        items,
        itemsPrice,
        shippingPrice,
        taxPrice,
        discount,
        totalPrice,
        coupon: couponInfo,
        shippingTiers: {
          below500: 50,
          below1000: 30,
          above1000: 0
        }
      }
    });
  } catch (error) {
    console.error("Order calculation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post("/", userProtect, createOrder);

// ── GET /api/orders/my-orders  — get current user's orders ────────────────────
router.get("/my-orders", userProtect, getUserOrders);

// ── GET /api/orders/:id  — get single order ───────────────────────────────────
router.get("/:id", userProtect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,       // ensures user can only see their own orders
    });

    if (!order)
      return res.status(404).json({ message: "Order not found." });

    res.json({ success: true, data: order });
  } catch (err) {
    console.error("Get order error:", err.message);
    res.status(500).json({ message: "Server error fetching order." });
  }
});

// @desc    Cancel order
// @route   POST /api/orders/cancel/:orderId
// @access  Private
router.post("/cancel/:orderId", userProtect, cancelOrder);

// ==============================
// ✅ ADMIN ROUTES (Management)
// ==============================

// Get all orders (Admin)
router.get("/all", adminProtect, authorize('admin'), getOrders);

// Get order stats (Admin)
router.get("/stats", adminProtect, authorize('admin'), getOrderStats);

// Update order status (Admin)
router.put("/:orderId", adminProtect, authorize('admin'), updateOrder);

export default router;
