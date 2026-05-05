import express from "express";
import jwt from "jsonwebtoken";
import Wishlist from "../models/Wishlist.js";

const router = express.Router();

//  GET USER ID FROM TOKEN
const getUserId = (req) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;  
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    return null;
  }
};


// ==============================
// ✅ GET WISHLIST
// ==============================
router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not logged in",
        wishlist: [],
      });
    }

    const wishlist = await Wishlist.find({ userId });

    res.json({
      success: true,
      wishlist,
    });

  } catch (error) {
    console.log("GET WISHLIST ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// ==============================
// ✅ ADD TO WISHLIST
// ==============================
router.post("/add", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not logged in",
      });
    }

    const { productId, name, price, image, rating, description } = req.body;

    if (!productId || !name || !price) {
      return res.status(400).json({
        success: false,
        message: "productId, name, price required",
      });
    }

    const exists = await Wishlist.findOne({ userId, productId });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Item already in wishlist",
      });
    }

    await Wishlist.create({
      userId,
      productId,
      name,
      price,
      image,
      rating: rating || 4,
      description,
    });

    const wishlist = await Wishlist.find({ userId });

    res.status(201).json({
      success: true,
      message: "Item added to wishlist",
      wishlist,
    });

  } catch (error) {
    console.log("ADD WISHLIST ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// ==============================
// ✅ REMOVE SINGLE ITEM
// ==============================
router.delete("/remove/:productId", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not logged in",
      });
    }

    const result = await Wishlist.deleteOne({
      userId,
      productId: req.params.productId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found in wishlist",
      });
    }

    const wishlist = await Wishlist.find({ userId });

    res.json({
      success: true,
      message: "Item removed from wishlist",
      wishlist,
    });

  } catch (error) {
    console.log("REMOVE WISHLIST ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// ==============================
// ✅ CLEAR ENTIRE WISHLIST
// ==============================
router.delete("/clear", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not logged in",
      });
    }

    await Wishlist.deleteMany({ userId });

    res.json({
      success: true,
      message: "Wishlist cleared",
      wishlist: [],
    });

  } catch (error) {
    console.log("CLEAR WISHLIST ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;