import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('CRITICAL ERROR: Razorpay keys are missing from environment variables!');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Create a Razorpay order
export const createRazorpayOrder = async (req, res) => {
  console.log('--- RECV: createRazorpayOrder ---');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  try {
    const { amount, totalPrice, grandTotal, orderTotal, currency = 'INR', orderId, notes = {} } = req.body;
    const razorpay = getRazorpayInstance();

    let paymentAmount = Number(amount ?? totalPrice ?? grandTotal ?? orderTotal);
    let dbOrder = null;

    // 1. Try to fetch amount from DB if orderId is provided
    if (orderId) {
      if (mongoose.Types.ObjectId.isValid(orderId)) {
        dbOrder = await Order.findById(orderId);
      }
      if (!dbOrder) {
        dbOrder = await Order.findOne({ orderId: orderId });
      }
      
      if (dbOrder) {
        paymentAmount = Number(dbOrder.totalPrice);
        console.log(`Found order ${orderId}, using total price from DB: ${paymentAmount}`);
      }
    }

    // 2. Validate that we have a valid amount now
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: orderId && !dbOrder 
          ? `Order ${orderId} not found and no backup amount provided.` 
          : 'Valid amount is required' 
      });
    }

    const options = {
      amount: Math.round(paymentAmount * 100), // Razorpay expects amount in paise
      currency,
      receipt: 'receipt_' + Date.now(),
      notes: {
        orderId: orderId || '',
        userId: req.user?._id?.toString() || '',
        ...notes,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save transaction record
    const transaction = await Transaction.create({
      user: req.user?._id,
      order: dbOrder ? dbOrder._id : (mongoose.Types.ObjectId.isValid(orderId) ? orderId : undefined),
      razorpayOrderId: razorpayOrder.id,
      amount: paymentAmount,
      currency,
      status: 'created',
      receipt: options.receipt,
      notes: options.notes,
    });

    res.status(201).json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        transactionId: transaction.transactionId,
        key: process.env.RAZORPAY_KEY_ID, 
      },
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Razorpay payment signature
export const verifyPayment = async (req, res) => {
  console.log('--- RECV: verifyPayment ---');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'All payment fields are required' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      // Update transaction as failed
      await Transaction.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'failed' }
      );
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update transaction as captured
    let transaction = await Transaction.findOne({ razorpayOrderId: razorpay_order_id });

    if (transaction) {
      transaction.razorpayPaymentId = razorpay_payment_id;
      transaction.razorpaySignature = razorpay_signature;
      transaction.status = 'captured';
      await transaction.save();
      console.log(`[ADMIN-PAYMENT] Transaction ${transaction._id} updated to captured.`);
    } else {
      console.warn(`[ADMIN-PAYMENT-WARNING] Transaction not found for ${razorpay_order_id}. Creating fallback.`);
      transaction = await Transaction.create({
        user: req.user?._id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: req.body.amount || 0,
        status: 'captured',
      });
    }

    // Update linked order as paid if it exists
    const orderToUpdate = transaction.order || req.body.orderId;
    if (orderToUpdate) {
      let dbOrder = null;
      if (mongoose.Types.ObjectId.isValid(orderToUpdate)) {
        dbOrder = await Order.findById(orderToUpdate);
      } else {
        dbOrder = await Order.findOne({ orderId: orderToUpdate });
      }

      if (dbOrder) {
        dbOrder.isPaid = true;
        dbOrder.paidAt = Date.now();
        dbOrder.paymentMethod = 'Razorpay';
        dbOrder.paymentResult = {
          id: razorpay_payment_id,
          status: 'captured',
          update_time: new Date().toISOString(),
        };
        await dbOrder.save();
        console.log(`✅ Order ${dbOrder.orderId} updated successfully.`);
        
        // Ensure transaction is linked to the order if it wasn't
        if (!transaction.order) {
          transaction.order = dbOrder._id;
          await transaction.save();
        }
      }
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: transaction,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Razorpay key (for frontend)
export const getRazorpayKey = (req, res) => {
  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
  });
};

// Get all transactions (Admin)
export const getTransactions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) query.status = status;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('user', 'name email')
      .populate('order', 'orderId totalPrice status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: transactions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single transaction
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('user', 'name email')
      .populate('order', 'orderId totalPrice status orderItems');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get transaction stats (Admin)
export const getTransactionStats = async (req, res) => {
  try {
    const total = await Transaction.countDocuments();
    const captured = await Transaction.countDocuments({ status: 'captured' });
    const failed = await Transaction.countDocuments({ status: 'failed' });
    const pending = await Transaction.countDocuments({ status: 'created' });
    const refunded = await Transaction.countDocuments({ status: 'refunded' });

    const totalRevenue = await Transaction.aggregate([
      { $match: { status: 'captured' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayRevenue = await Transaction.aggregate([
      { $match: { status: 'captured', createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      success: true,
      total,
      captured,
      failed,
      pending,
      refunded,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Initiate refund
export const refundTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status !== 'captured') {
      return res.status(400).json({ success: false, message: 'Only captured payments can be refunded' });
    }

    const razorpay = getRazorpayInstance();
    const refundAmount = req.body.amount || transaction.amount;

    const refund = await razorpay.payments.refund(transaction.razorpayPaymentId, {
      amount: Math.round(refundAmount * 100),
      notes: { reason: req.body.reason || 'Admin initiated refund' },
    });

    transaction.status = 'refunded';
    transaction.refundId = refund.id;
    transaction.refundAmount = refundAmount;
    await transaction.save();

    // Update linked order and restore stock
    if (transaction.order) {
      const order = await Order.findById(transaction.order);
      if (order && order.status !== "Cancelled") {
        for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: item.qty }
            });
        }
        order.status = 'Cancelled';
        order.isPaid = false;
        await order.save();
      }
    }

    res.json({
      success: true,
      message: 'Refund initiated successfully',
      data: transaction,
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
