import express from "express";
import Razorpay from "razorpay";
import { protect } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";
import crypto from "crypto";
import Transaction from "../../admin/models/Transaction.js";
import mongoose from "mongoose";

const router = express.Router();

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

// @route   POST /api/payments/create-order
// @desc    Create a Razorpay order
// @access  Private
router.post("/create-order", protect, async (req, res) => {
  try {
    const { amount, currency = "INR", orderId } = req.body;
    console.log(`[RAZORPAY-DEBUG] Creating order. Received Amount: ${amount}`);

    let paymentAmount = Number(amount);
    let dbOrderId = undefined;

    if (orderId) {
      const dbOrder = mongoose.Types.ObjectId.isValid(orderId)
        ? await Order.findById(orderId)
        : await Order.findOne({ orderId });

      if (dbOrder) {
        dbOrderId = dbOrder._id;
        paymentAmount = Number(dbOrder.totalPrice);
      }
    }

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    const options = {
      amount: Math.round(paymentAmount * 100), // Razorpay expects amount in paise
      currency,
      receipt: orderId || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
    }

    // Create a transaction record so Admin panel can show it
    try {
      await Transaction.create({
        user: req.user._id,
        order: dbOrderId,
        razorpayOrderId: order.id,
        amount: paymentAmount,
        currency,
        status: "created",
        receipt: options.receipt,
      });
    } catch (txnError) {
      console.error("CRITICAL: Failed to create transaction record in /create-order:");
      console.error("Error details:", txnError);
      console.error("Transaction data attempted:", {
        user: req.user._id,
        order: dbOrderId,
        razorpayOrderId: order.id,
        amount: paymentAmount,
        currency,
        status: "created",
        receipt: options.receipt,
      });
    }

    res.json(order);
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment signature
// @access  Private
router.post("/verify", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret");

    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    console.log(`[PAYMENT-VERIFY] Expected: ${generated_signature}`);
    console.log(`[PAYMENT-VERIFY] Received: ${razorpay_signature}`);

    if (generated_signature === razorpay_signature) {
      // Payment verified
      if (orderId) {
        let dbOrderId = orderId;
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
          const dbOrder = await Order.findOne({ orderId: orderId });
          if (dbOrder) dbOrderId = dbOrder._id;
        }
        
        await Order.findByIdAndUpdate(dbOrderId, {
          paymentStatus: "completed",
          paymentResult: {
            id: razorpay_payment_id,
            status: "completed",
            update_time: Date.now().toString(),
          },
          isPaid: true,
          paidAt: Date.now(),
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
        });
      }

      // Update Transaction to captured
      try {
        let transaction = await Transaction.findOne({ razorpayOrderId: razorpay_order_id });
        
        if (transaction) {
          transaction.razorpayPaymentId = razorpay_payment_id;
          transaction.razorpaySignature = razorpay_signature;
          transaction.status = "captured";
          await transaction.save();
          console.log(`[PAYMENT-SUCCESS] Transaction ${transaction._id} updated to captured.`);
        } else {
          // Fallback: Create transaction if it wasn't created during /create-order
          console.log(`[PAYMENT-WARNING] Transaction not found for Order ${razorpay_order_id}. Creating fallback record.`);
          
          let dbOrderId = orderId;
          if (orderId && !mongoose.Types.ObjectId.isValid(orderId)) {
            const dbOrder = await Order.findOne({ orderId: orderId });
            if (dbOrder) dbOrderId = dbOrder._id;
          }

          transaction = await Transaction.create({
            user: req.user._id,
            order: dbOrderId,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            amount: req.body.amount || 0, // Fallback amount
            status: "captured",
          });
          console.log(`[PAYMENT-SUCCESS] Fallback transaction created: ${transaction._id}`);
        }
      } catch (txnUpdateError) {
        console.error("CRITICAL: Failed to update/create transaction record in /verify:");
        console.error(txnUpdateError);
      }

      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Razorpay verification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
