import BuyNow from "../models/BuyNow.js";
import jwt from "jsonwebtoken";
import Product from "../models/Product.js";

const getProductImage = (product, fallback = "") => {
  const firstImage = Array.isArray(product?.images) ? product.images[0] : null;
  if (typeof firstImage === "string") return firstImage;
  return firstImage?.secure_url || firstImage?.url || firstImage?.path || product?.image || fallback;
};

const getSelectedVariant = (product, selectedVariant = {}) => {
  const variantKey = selectedVariant._id || selectedVariant.id || selectedVariant.value || selectedVariant.name;
  if (!variantKey) return null;
  return (product?.variants || []).find((variant) =>
    String(variant._id || variant.id || variant.color || variant.fabric || variant.name) === String(variantKey) ||
    String(variant.color || "").toLowerCase() === String(variantKey).toLowerCase() ||
    String(variant.fabric || "").toLowerCase() === String(variantKey).toLowerCase()
  );
};

export const createBuyNow = async (req, res) => {
  try {
    // Get user from cookie token
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
      return res.status(401).json({ success: false, message: "Login required to Buy Now" });
    }

    const {
      productId,
      quantity,
      selectedVariant,
      addressId,
    } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Missing required field productId",
      });
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const variant = getSelectedVariant(product, selectedVariant);
    const price = Number(variant?.price || product.discountPrice || product.discounted_price || product.price || 0);
    const totalAmount = price * (quantity || 1);

    const order = await BuyNow.create({
      user: userId,
      productId,
      name: product.name,
      image: getProductImage(product, req.body.image),
      price,
      quantity: quantity || 1,
      selectedVariant,
      addressId: addressId || null,
      totalAmount,
    });

    res.status(201).json({
      success: true,
      message: "Buy Now order created successfully",
      order,
    });
  } catch (error) {
    console.error("Buy Now Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBuyNowOrders = async (req, res) => {
  try {
    const orders = await BuyNow.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBuyNowByUser = async (req, res) => {
  try {
    const orders = await BuyNow.find({ user: req.params.userId }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
