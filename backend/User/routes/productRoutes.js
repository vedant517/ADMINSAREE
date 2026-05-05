import express from "express";
import Product from "../models/Product.js";
import Offer from "../models/Offer.js";
import User from "../../models/User.js";
import { PRODUCT_MAIN_CATEGORIES, PRODUCT_SUB_CATEGORIES } from "../../admin/config/constants.js";
import { protect as userProtect } from "../middleware/authMiddleware.js";
import { 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from "../../admin/controllers/productController.js";
import { protect as adminProtect, authorize } from "../../admin/middleware/authMiddleware.js";
import upload from "../../admin/middleware/uploadMiddleware.js";

const uploadMiddleware = upload.any();

const router = express.Router();

// ==============================
// ✅ GET CATEGORIES (Separate APIs)
// ==============================
router.get("/main-categories", async (req, res) => {
  try {
    const Category = (await import("../models/Category.js")).default;
    const categories = await Category.find({ isMain: true });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/sub-categories", async (req, res) => {
  try {
    const Category = (await import("../models/Category.js")).default;
    const categories = await Category.find({ isMain: false });
    // If frontend expects strings, map them. But usually objects are better.
    // Based on Filter.jsx, it expects strings for now: setSubCategories(res.data.data.categories);
    res.json({ success: true, data: categories.map(c => c.name) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==============================
// ✅ GET ALL PRODUCTS
// ==============================
router.get("/", async (req, res) => {
  try {
    const { mainCategory, category, search, sort } = req.query;
    let query = { isActive: { $ne: false } }; // Use $ne: false to include undefined/null if any

    if (mainCategory) {
      query.mainCategory = mainCategory;
    }

    if (category) {
      query.categories = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    let products = await Product.find(query).lean();

    // ── Apply Offers ──
    try {
      const now = new Date();
      const activeOffers = await Offer.find({
        startDate: { $lte: now },
        endDate: { $gte: now },
      }).lean();

      products = products.map((product) => {
        const offer = activeOffers.find(
          (o) => o.productId.toString() === product._id.toString()
        );
        if (offer) {
          const discountAmount = (product.price * offer.discountPercent) / 100;
          return {
            ...product,
            discounted_price: Math.floor(product.price - discountAmount),
            offerTag: offer.tag || offer.name,
          };
        }
        return product;
      });
    } catch (offerErr) {
      console.error("OFFER CALC ERROR:", offerErr.message);
    }

    // Sorting (Use discounted_price for price-based sorting if it exists)
    if (sort === "price-asc") {
      products.sort((a, b) => (a.discounted_price || a.price) - (b.discounted_price || b.price));
    } else if (sort === "price-desc") {
      products.sort((a, b) => (b.discounted_price || b.price) - (a.discounted_price || a.price));
    } else if (sort === "rating") {
      products.sort((a, b) => b.rating - a.rating);
    } else if (sort === "newest") {
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({
      success: true,
      data: products,
      products: products, // For compatibility
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: [],
    });
  }
});

// ==============================
// ✅ GET PRODUCT BY ID
// ==============================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let productData = product;

    // ── Apply Offer ──
    try {
      const now = new Date();
      const offer = await Offer.findOne({
        productId: product._id,
        startDate: { $lte: now },
        endDate: { $gte: now },
      }).lean();

      if (offer) {
        const discountAmount = (product.price * offer.discountPercent) / 100;
        productData = {
          ...product,
          discounted_price: Math.floor(product.price - discountAmount),
          offerTag: offer.tag || offer.name,
          offerDetails: offer,
        };
      }
    } catch (offerErr) {
      console.error("OFFER CALC ERROR:", offerErr.message);
    }

    res.json({
      success: true,
      data: productData,
      product: productData, // For compatibility
    });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ==============================
// ✅ SEARCH PRODUCTS
// ==============================
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const products = await Product.find(
      {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { tags: { $in: [new RegExp(q, "i")] } },
        ],
        isActive: true,
      }
    )
      .limit(20)
      .lean();

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("SEARCH PRODUCTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: [],
    });
  }
});

// = =============================
// ✅ ADMIN ROUTES (Management)
// ==============================
router.post("/", adminProtect, authorize('admin'), uploadMiddleware, createProduct);
router.put("/:id", adminProtect, authorize('admin'), uploadMiddleware, updateProduct);
router.delete("/:id", adminProtect, authorize('admin'), deleteProduct);

// ==============================
// ✅ ADD PRODUCT REVIEW (Public/User)
// ==============================
router.post("/:id/reviews", userProtect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "Product already reviewed",
      });
    }

    const dbUser = await User.findById(req.user._id);

    const review = {
      user: req.user._id,
      name: dbUser?.name || dbUser?.email?.split("@")[0] || "Anonymous",
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    // ✅ Also save to standalone Review collection for Admin Panel
    const Review = (await import("../models/Review.js")).default;
    await Review.create({
      user: req.user._id,
      product: product._id,
      rating: Number(rating),
      comment,
    });

    await product.save();
    res.status(201).json({ success: true, message: "Review added" });
  } catch (error) {
    console.error("ADD REVIEW ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
