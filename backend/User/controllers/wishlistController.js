import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import { requireAuthUserId } from "../utils/resolveAuthUserId.js";

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

// GET WISHLIST — scoped to req.user / JWT user id only
export const getWishlist = async (req, res) => {
  try {
    const userId = requireAuthUserId(req, res);
    if (!userId) return;

    const wishlistItems = await Wishlist.find({ userId: String(userId) });
    const wishlist = await Promise.all(wishlistItems.map(mapWishlistItem));
    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADD TO WISHLIST
export const addToWishlist = async (req, res) => {
  try {
    const userId = requireAuthUserId(req, res);
    if (!userId) return;

    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const exists = await Wishlist.findOne({ userId: String(userId), productId });
    if (exists) {
      return res.status(400).json({ success: false, message: "Item already in wishlist" });
    }
    await Wishlist.create({
      userId: String(userId),
      productId,
      name: product.name,
      price: getProductPrice(product),
      image: getProductImage(product, req.body.image),
      rating: product.ratings || product.rating || 4,
      description: product.description,
    });
    const wishlistItems = await Wishlist.find({ userId: String(userId) });
    const wishlist = await Promise.all(wishlistItems.map(mapWishlistItem));
    res.status(201).json({ success: true, message: "Item added to wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// REMOVE FROM WISHLIST
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = requireAuthUserId(req, res);
    if (!userId) return;

    const result = await Wishlist.deleteOne({
      userId: String(userId),
      productId: req.params.productId,
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Item not found in wishlist" });
    }
    const wishlist = await Wishlist.find({ userId: String(userId) });
    res.json({ success: true, message: "Item removed from wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CLEAR WISHLIST
export const clearWishlist = async (req, res) => {
  try {
    const userId = requireAuthUserId(req, res);
    if (!userId) return;

    await Wishlist.deleteMany({ userId: String(userId) });
    res.json({ success: true, message: "Wishlist cleared", wishlist: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
