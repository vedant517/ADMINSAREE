import express from "express";
import Review from "../models/Review.js";

const router = express.Router();

/* ==============================
   CREATE REVIEW
============================== */
router.post("/", async (req, res) => {
  try {
    const { user, product, rating, comment } = req.body;

    if (!user || !product || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const review = await Review.create({
      user,
      product,
      rating,
      comment,
    });

    // ✅ Also update the Product's reviews array for backward compatibility
    const Product = (await import("../models/Product.js")).default;
    const User = (await import("../../models/User.js")).default;
    const productDoc = await Product.findById(product);
    if (productDoc) {
      const dbUser = await User.findById(user);
      const productReview = {
        user,
        name: dbUser?.name || "Anonymous",
        rating: Number(rating),
        comment,
      };
      productDoc.reviews.push(productReview);
      productDoc.numReviews = productDoc.reviews.length;
      productDoc.rating =
        productDoc.reviews.reduce((acc, item) => item.rating + acc, 0) /
        productDoc.reviews.length;
      await productDoc.save();
    }

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* ==============================
   GET ALL REVIEWS (Admin Use)
============================== */
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("product", "name image price mainCategory ratings numOfReviews createdAt")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* ==============================
   GET REVIEWS BY PRODUCT
============================== */
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;