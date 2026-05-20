import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Transaction from "../../admin/models/Transaction.js";
import { calculateDiscount } from "./couponController.js";
import { calculateShippingCharges } from "../../services/shiprocketService.js";
import Coupon from "../models/Coupon.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const { termsAccepted, couponCode, pincode } = req.body;

    // Validate Terms & Conditions
    if (termsAccepted !== true && termsAccepted !== "true") {
      return res.status(400).json({ 
        success: false, 
        message: "You must accept the Terms and Conditions to proceed." 
      });
    }

    // 1. Handle flexible items input (items or orderItems)
    const orderItems = req.body.orderItems || req.body.items;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // 2. Handle flexible shipping address input
    let shippingAddress = req.body.shippingAddress;
    
    // If shippingAddress is missing but flat fields are present, map them
    if (!shippingAddress && (req.body.address || req.body.city || req.body.zipCode)) {
      shippingAddress = {
        fullName: `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim() || undefined,
        address: req.body.address,
        city: req.body.city,
        postalCode: req.body.zipCode || req.body.postalCode,
        country: req.body.country,
        state: req.body.state,
        phone: req.body.phoneNumber || req.body.phone
      };
    }

    // Calculate items price securely and GST
    let calculatedItemsPrice = 0;
    let totalWeight = 0;
    
    // We recreate orderItems with secure prices from the DB
    const secureOrderItems = [];

    for (const item of orderItems) {
      const productId = item.product || item.productId || item._id;
      const quantity = parseInt(item.qty || item.quantity || 1);

      if (!productId) {
        console.warn("Skipping item without product ID:", item);
        continue;
      }

      const product = await Product.findById(productId);
      const priceToUse = product ? (product.discountPrice > 0 ? product.discountPrice : product.price) : (item.price || 0);
      
      secureOrderItems.push({
        ...item,
        product: productId,
        qty: quantity,
        price: priceToUse,
        name: product ? product.name : (item.name || "Unknown Product"),
        image: product ? (product.images?.[0]?.url || product.image) : (item.image || "")
      });
      
      calculatedItemsPrice += (priceToUse * quantity);
      totalWeight += (0.5 * quantity); // Mock weight
      
      if (product) {
        await Product.findByIdAndUpdate(productId, {
          $inc: { stock: -quantity }
        });
      }
    }

    const itemsPrice = calculatedItemsPrice;

    // 3. Discount Calculation
    let discountPrice = 0;
    if (couponCode) {
      try {
        const discResult = await calculateDiscount(couponCode, itemsPrice, req.user?.id);
        discountPrice = discResult.discountAmount;
      } catch (err) {
        console.warn("Coupon validation failed during checkout:", err.message);
      }
    }

    // 4. Shipping Calculation (Shiprocket)
    let shippingPrice = 0;
    const deliveryZip = pincode || shippingAddress?.postalCode;
    
    if (deliveryZip) {
      const shipResult = await calculateShippingCharges({ delivery_postcode: deliveryZip, weight: totalWeight });
      shippingPrice = shipResult.success ? shipResult.data.shipping_cost : 50;
    } else {
      shippingPrice = itemsPrice < 500 ? 50 : 0;
    }

    // 5. Tax Calculation (18% GST)
    const taxableAmount = itemsPrice - discountPrice;
    const taxPrice = Number((taxableAmount * 0.18).toFixed(2));

    const totalPrice = taxableAmount + shippingPrice + taxPrice;
    
    // Extract payment method from request, default to COD
    const paymentMethod = req.body.paymentMethod?.trim() || 'COD';
    const isPaidInitially = paymentMethod === 'Razorpay' ? false : (paymentMethod === 'COD' ? false : false);

    const orderData = {
      ...req.body,
      orderId: "#ORD" + Date.now(),
      orderItems: secureOrderItems,
      shippingAddress,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice, // Add discount field
      totalPrice,
      paymentMethod,
      isPaid: isPaidInitially,
      status: "Pending"
    };

    if (req.user?.id) {
      orderData.user = req.user.id;
    }

    const order = await Order.create(orderData);
    
    // Create transaction based on payment method
    if (paymentMethod.toUpperCase() === 'COD' || paymentMethod.toLowerCase().includes('cash on delivery')) {
       await Transaction.create({
         transactionId: 'TXNCOD' + Date.now(),
         order: order._id,
         user: order.user,
         razorpayOrderId: 'COD_' + order.orderId,
         amount: totalPrice,
         currency: 'INR',
         status: 'captured',
         paymentMethod: 'COD',
       });
    } else if (paymentMethod === 'Razorpay') {
       // Razorpay transaction will be created when payment is initiated
       await Transaction.create({
         transactionId: 'TXN_' + Date.now(),
         order: order._id,
         user: order.user,
         razorpayOrderId: 'PENDING_' + order.orderId, // Required by model
         amount: totalPrice,
         currency: 'INR',
         status: 'created', // 'initiated' is not in enum
         paymentMethod: 'Razorpay',
       });
    }

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error("Order Creation Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET USER ORDERS
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user?.id });

    res.json({
      success: true,
      data: orders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CANCEL ORDER (USER)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId, user: req.user?.id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.qty }
      });
    }

    order.status = "Cancelled";
    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE ORDER (USER)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found." });

    res.json({ success: true, data: order });
  } catch (err) {
    console.error("Get order error:", err.message);
    res.status(500).json({ success: false, message: "Server error fetching order." });
  }
};

// SECURE ORDER CALCULATION
export const calculateOrder = async (req, res) => {
  try {
    const { orderItems, couponCode, pincode } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: "No items provided" });
    }

    let itemsPrice = 0;
    let totalWeight = 0;
    const items = [];

    for (const item of orderItems) {
      const productId = item.product || item.productId || item._id;
      const product = await Product.findById(productId);
      if (!product) continue;
      
      const price = product.discountPrice > 0 ? product.discountPrice : product.price;
      const qty = parseInt(item.qty || item.quantity || 1);
      
      itemsPrice += price * qty;
      totalWeight += (0.5 * qty); // Mock weight 0.5kg per item

      items.push({
        product: productId,
        name: product.name,
        price: price,
        qty: qty,
        total: price * qty
      });
    }

    // 1. Shipping Calculation (Shiprocket)
    let shippingPrice = 0;
    let shippingInfo = null;
    if (pincode) {
      const shipResult = await calculateShippingCharges({ delivery_postcode: pincode, weight: totalWeight });
      if (shipResult.success) {
        shippingPrice = shipResult.data.shipping_cost;
        shippingInfo = shipResult.data;
      } else {
        shippingPrice = 50; // Fallback
      }
    } else {
      shippingPrice = itemsPrice < 999 ? 99 : 0; // Simple fallback
    }

    // 2. Discount Calculation (Coupon)
    let discount = 0;
    let couponInfo = null;
    if (couponCode) {
      try {
        const discResult = await calculateDiscount(couponCode, itemsPrice, req.user?.id);
        discount = discResult.discountAmount;
        couponInfo = discResult;
      } catch (err) {
        // We don't fail the whole calculation, just return the coupon error
        couponInfo = { error: err.message };
      }
    }

    // 3. Tax Calculation (18% GST on items after discount)
    const taxableAmount = itemsPrice - discount;
    const taxPrice = Number((taxableAmount * 0.18).toFixed(2));

    const totalPrice = taxableAmount + shippingPrice + taxPrice;

    res.json({
      success: true,
      data: {
        items,
        summary: {
          itemsPrice,
          discount,
          taxableAmount,
          taxPrice,
          shippingPrice,
          totalPrice,
        },
        coupon: couponInfo,
        shipping: shippingInfo,
        pincode
      }
    });
  } catch (error) {
    console.error("Order calculation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
