import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create a Razorpay order
// @route   POST /api/transactions/create-order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  console.log('--- RECV: createRazorpayOrder (Transactions) ---');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  try {
    const { amount, currency = 'INR', orderId, notes = {} } = req.body;

    if (!amount && !orderId) {
      return res.status(400).json({ success: false, message: 'Amount or Order ID is required' });
    }

    let paymentAmount = amount;
    
    // Security: If orderId is provided, fetch amount from DB to prevent client-side manipulation
    if (orderId) {
      // Validate if it's a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ success: false, message: 'Invalid Order ID format' });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      paymentAmount = order.totalPrice;
    }

    const razorpay = getRazorpayInstance();

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

    // Create a transaction record in status 'created'
    const transaction = await Transaction.create({
      user: req.user?._id,
      order: orderId || undefined,
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
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
        transactionId: transaction.transactionId
      },
    });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/transactions/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  console.log('--- RECV: verifyPayment (Transactions) ---');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'All payment fields are required' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;
    

    if (!isAuthentic) {
      // Mark transaction as failed
      await Transaction.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'failed' }
      );
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update transaction as captured/paid
    const transaction = await Transaction.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'captured',
      },
      { new: true }
    );

    // Update the linked Order
    if (transaction && transaction.order) {
      await Order.findByIdAndUpdate(transaction.order, {
        isPaid: true,
        paidAt: Date.now(),
        paymentResult: {
          id: razorpay_payment_id,
          status: 'captured',
          update_time: new Date().toISOString(),
        },
      });
    }

    res.json({
      success: true,
      message: 'Payment verified and updated successfully',
      data: transaction,
    });
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
