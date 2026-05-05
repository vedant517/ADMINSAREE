import mongoose from 'mongoose';
import { PRODUCT_MAIN_CATEGORY_NAMES, PRODUCT_SUB_CATEGORIES } from '../config/constants.js';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  images: [
    {
      url: {
        type: String,
        required: true
      },
      public_id: {
        type: String,
        required: true
      }
    }
  ],
  image: { // Keep for backward compatibility if needed
    type: String,
    default: 'no-photo.jpg',
  },
  mainCategory: {
    type: String,
    required: [true, 'Please add a main category'],
    enum: PRODUCT_MAIN_CATEGORY_NAMES,
  },
  categories: {
    type: [String],
    required: [true, 'Please add at least one category'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Please add at least one category'
    },
    enum: PRODUCT_SUB_CATEGORIES,
  },
  variants: [
    {
      color: { type: String, required: true },
      price: { type: Number, required: true },
      fabric: { type: String, required: true },
      stock: { type: Number, default: 0 },
      sku: { type: String },
      image: { type: String }
    }
  ],
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  taxIncluded: {
    type: Boolean,
    default: true,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  bufferCommands: false,
});

productSchema.index({ mainCategory: 1 });
productSchema.index({ categories: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ createdAt: -1 });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
