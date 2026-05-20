import jwt from "jsonwebtoken";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

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

const getProductImage = (product, fallback) => {
  const first = Array.isArray(product?.images) ? product.images[0] : null;
  if (typeof first === "string") return first;
  return first?.secure_url || first?.url || first?.path || product?.image || fallback;
};

const getProductPrice = (product) => {
  return Number(product?.discountPrice || product?.discounted_price || product?.price || 0);
};

const mapWishlistItem = async (item) => {
  const product = await Product.findById(item.productId).lean().catch(() => null);
  if (!product) return item;

  const current = {
    name: product.name,
    price: getProductPrice(product),
    image: getProductImage(product, item.image),
    rating: product.ratings || product.rating || item.rating || 4,
    description: product.description || item.description,
  };

  if (
    item.name !== current.name ||
    item.price !== current.price ||
    item.image !== current.image ||
    item.description !== current.description
  ) {
    await Wishlist.updateOne({ _id: item._id }, { $set: current });
  }

  const plainItem = typeof item.toObject === "function" ? item.toObject() : item;
  return { ...plainItem, ...current };
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
    const wishlistItems = await Wishlist.find({ userId });
    const wishlist = await Promise.all(wishlistItems.map(mapWishlistItem));
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
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const exists = await Wishlist.findOne({ userId, productId });
    if (exists) {
      return res.status(400).json({ success: false, message: "Item already in wishlist" });
    }
    await Wishlist.create({
      userId,
      productId,
      name: product.name,
      price: getProductPrice(product),
      image: getProductImage(product, req.body.image),
      rating: product.ratings || product.rating || 4,
      description: product.description,
    });
    const wishlistItems = await Wishlist.find({ userId });
    const wishlist = await Promise.all(wishlistItems.map(mapWishlistItem));
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
