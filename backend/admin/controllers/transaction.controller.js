import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';

// Check if Razorpay credentials are available
const hasRazorpayCredentials = process.env.RAZORPAY_KEY_ID && 
                                 process.env.RAZORPAY_KEY_ID !== "rzp_test_placeholder" &&
                                 process.env.RAZORPAY_KEY_SECRET &&
                                 process.env.RAZORPAY_KEY_SECRET !== "placeholder_secret";

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  if (!hasRazorpayCredentials) {
    console.warn("⚠️ Razorpay credentials not configured. Using MOCK MODE for development/testing.");
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Mock Razorpay order creation for testing
const createMockRazorpayOrder = (options) => {
  return {
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    entity: "order",
    amount: options.amount,
    amount_paid: 0,
    amount_due: options.amount,
    currency: options.currency,
    receipt: options.receipt,
    offer_id: null,
    status: "created",
    attempts: 0,
    notes: options.notes,
    created_at: Math.floor(Date.now() / 1000),
  };
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

    let razorpayOrder;
    const razorpay = getRazorpayInstance();

    if (!razorpay) {
      // Use mock Razorpay order in development mode
      console.log("Using MOCK Razorpay order (development mode)");
      razorpayOrder = createMockRazorpayOrder(options);
    } else {
      // Real Razorpay in production
      try {
        razorpayOrder = await razorpay.orders.create(options);
      } catch (razorpayError) {
        console.error('Razorpay API Error:', razorpayError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to create payment order: ' + (razorpayError.message || 'Unknown error') 
        });
      }
    }

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
        key: process.env.RAZORPAY_KEY_ID || "mock_key",
        transactionId: transaction.transactionId
      },
    });
  } catch (error) {
    console.error('Order Creation Error:', error);
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
