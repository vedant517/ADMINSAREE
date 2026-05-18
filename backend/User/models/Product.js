import mongoose from "mongoose";
import { PRODUCT_MAIN_CATEGORY_NAMES, PRODUCT_SUB_CATEGORIES } from "../../admin/config/constants.js";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, lowercase: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    original_price: { type: Number },
    discounted_price: { type: Number },
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
    image: { type: String },
    images: [mongoose.Schema.Types.Mixed], // Support strings or Cloudinary objects
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        rating: Number,
        comment: String,
        date: { type: Date, default: Date.now },
      },
    ],
    stock: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },

    tags: [String],
    variants: [
      {
        color: { type: String },
        price: { type: Number },
        fabric: { type: String },
        image: { type: String }, // Optional variant image
        images: [String], // Optional variant images array
      },


    ],
    sku: { type: String, unique: true, sparse: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);
