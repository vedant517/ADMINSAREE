// models/Offer.js
import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variantId: {
    type: String, // Storing as String since it's an ID within the Product variants array
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  discountPercent: {
    type: Number,
    required: true,
    min: 1,
    max: 99,
  },
  tag: {
    type: String,
    enum: ['HOT', 'SALE', 'NEW', 'TOP', 'DEAL'],
    default: 'HOT',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Offer || mongoose.model('Offer', OfferSchema);