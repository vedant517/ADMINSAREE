import jwt from "jsonwebtoken";
import Wishlist from "../models/Wishlist.js";

// GET USER ID FROM TOKEN
const getUserId = (req) => {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    return null;
  }
};

// GET WISHLIST
export const getWishlist = async (req, res) => {
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
    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADD TO WISHLIST
export const addToWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not logged in" });
    }
    const { productId, name, price, image, rating, description } = req.body;
    if (!productId || !name || !price) {
      return res.status(400).json({ success: false, message: "productId, name, price required" });
    }
    const exists = await Wishlist.findOne({ userId, productId });
    if (exists) {
      return res.status(400).json({ success: false, message: "Item already in wishlist" });
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
    res.status(201).json({ success: true, message: "Item added to wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// REMOVE FROM WISHLIST
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not logged in" });
    }
    const result = await Wishlist.deleteOne({ userId, productId: req.params.productId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Item not found in wishlist" });
    }
    const wishlist = await Wishlist.find({ userId });
    res.json({ success: true, message: "Item removed from wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CLEAR WISHLIST
export const clearWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not logged in" });
    }
    await Wishlist.deleteMany({ userId });
    res.json({ success: true, message: "Wishlist cleared", wishlist: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
