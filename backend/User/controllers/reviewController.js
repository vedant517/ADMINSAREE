import Review from "../models/Review.js";
import Product from "../models/Product.js";
import User from "../../models/User.js";
import { requireAuthUserId } from "../utils/resolveAuthUserId.js";
import {
  formatReviewResponse,
  resolveReviewerName,
} from "../utils/enrichReviews.js";

// CREATE REVIEW
export const createReview = async (req, res) => {
  try {
    const userId = requireAuthUserId(req, res);
    if (!userId) return;

    const { product, rating, comment } = req.body;
    if (!product || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "product, rating, and comment are required",
      });
    }

    const dbUser = await User.findById(userId).select("name email");
    const reviewerName = resolveReviewerName({}, dbUser);

    const review = await Review.create({
      user: userId,
      product,
      rating: Number(rating),
      comment,
      name: reviewerName,
    });

    const productDoc = await Product.findById(product);
    if (productDoc) {
      const alreadyOnProduct = productDoc.reviews?.some(
        (r) => String(r.user) === String(userId)
      );
      if (!alreadyOnProduct) {
        productDoc.reviews.push({
          user: userId,
          name: reviewerName,
          rating: Number(rating),
          comment,
          date: new Date(),
        });
        productDoc.numReviews = productDoc.reviews.length;
        productDoc.rating =
          productDoc.reviews.reduce((acc, item) => item.rating + acc, 0) /
          productDoc.reviews.length;
        await productDoc.save({ validateBeforeSave: false });
      }
    }

    res.status(201).json({
      success: true,
      data: formatReviewResponse({ ...review.toObject(), user: dbUser }),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET PRODUCT REVIEWS — includes reviewer display name
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const data = reviews.map(formatReviewResponse);

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL REVIEWS (ADMIN)
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("product", "name image price mainCategory ratings numOfReviews createdAt")
      .populate("user", "name email phonenum")
      .sort({ createdAt: -1 })
      .lean();

    const data = reviews.map((r) => ({
      ...formatReviewResponse(r),
      product: r.product,
      user: r.user,
    }));

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
