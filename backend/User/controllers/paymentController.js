import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Transaction from "../../admin/models/Transaction.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

// CREATE RAZORPAY ORDER
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", orderId } = req.body;
    if (!amount) return res.status(400).json({ success: false, message: "Amount is required" });

    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: orderId || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).json({ success: false, message: "Failed to create Razorpay order" });

    // Create transaction record
    try {
      let dbOrderId = undefined;
      if (orderId) {
        if (mongoose.Types.ObjectId.isValid(orderId)) {
          dbOrderId = orderId;
        } else {
          const dbOrder = await Order.findOne({ orderId: orderId });
          if (dbOrder) dbOrderId = dbOrder._id;
        }
      }
      await Transaction.create({
        user: req.user.id,
        order: dbOrderId,
        razorpayOrderId: order.id,
        amount,
        currency,
        status: "created",
        receipt: options.receipt,
      });
    } catch (txnError) {
      console.error("Transaction Record Error:", txnError);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// VERIFY PAYMENT
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret");
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature === razorpay_signature) {
      if (orderId) {
        let dbOrderId = orderId;
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
          const dbOrder = await Order.findOne({ orderId: orderId });
          if (dbOrder) dbOrderId = dbOrder._id;
        }
        await Order.findByIdAndUpdate(dbOrderId, {
          paymentStatus: "completed",
          paymentResult: { id: razorpay_payment_id, status: "completed", update_time: Date.now().toString() },
          isPaid: true,
          paidAt: Date.now(),
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
        });
      }

      const transaction = await Transaction.findOne({ razorpayOrderId: razorpay_order_id });
      if (transaction) {
        transaction.razorpayPaymentId = razorpay_payment_id;
        transaction.razorpaySignature = razorpay_signature;
        transaction.status = "captured";
        await transaction.save();
      }

      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
