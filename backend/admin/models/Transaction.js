import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
  },
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  // Razorpay specific fields
  razorpayOrderId: {
    type: String,
    required: true,
  },
  razorpayPaymentId: {
    type: String,
  },
  razorpaySignature: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'refunded', 'failed', 'initiated', 'cod'],
    default: 'created',
  },
  paymentMethod: {
    type: String,
    default: 'razorpay',
  },
  receipt: {
    type: String,
  },
  notes: {
    type: mongoose.Schema.Types.Mixed,
  },
  refundId: {
    type: String,
  },
  refundAmount: {
    type: Number,
  },
}, {
  timestamps: true,
});

// Auto-generate transactionId before saving
transactionSchema.pre('save', function () {
  if (!this.transactionId) {
    this.transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
});

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
