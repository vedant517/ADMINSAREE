import Review from "../models/Review.js";
import Product from "../models/Product.js";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";

// CREATE REVIEW
export const createReview = async (req, res) => {
  try {
    // 1. Get user from cookie
    const token = req.cookies?.token;
    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
      }
    }
    if (!userId) {
      return res.status(401).json({ success: false, message: "Login required to post a review" });
    }

    // 2. Read product, rating, comment from body
    const { product, rating, comment } = req.body;
    if (!product || !rating || !comment) {
      return res.status(400).json({ success: false, message: "product, rating, and comment are required" });
    }

    const review = await Review.create({ user: userId, product, rating, comment });

    const productDoc = await Product.findById(product);
    if (productDoc) {
      const dbUser = await User.findById(userId);
      productDoc.reviews.push({ user: userId, name: dbUser?.name || "Anonymous", rating: Number(rating), comment });
      productDoc.numReviews = productDoc.reviews.length;
      productDoc.rating = productDoc.reviews.reduce((acc, item) => item.rating + acc, 0) / productDoc.reviews.length;
      await productDoc.save({ validateBeforeSave: false });
    }

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: "You already reviewed this product" });
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET PRODUCT REVIEWS
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL REVIEWS (ADMIN)
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("product", "name image price mainCategory ratings numOfReviews createdAt")
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
