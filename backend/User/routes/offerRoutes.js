import express from "express";
import Offer from "../models/Offer.js";

const router = express.Router();

// @desc    Get all active offers
// @route   GET /api/offers
// @access  Public
router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate("productId", "name image price discounted_price");

    res.json({ success: true, data: offers });
  } catch (err) {
    console.error("Fetch offers error:", err.message);
    res.status(500).json({ success: false, message: "Server error fetching offers" });
  }
});

// @desc    Get offers for a specific product
// @route   GET /api/offers/product/:productId
// @access  Public
router.get("/product/:productId", async (req, res) => {
  try {
    const now = new Date();
    const offer = await Offer.findOne({
      productId: req.params.productId,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    res.json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error fetching product offer" });
  }
});

export default router;
