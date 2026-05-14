import BuyNow from "../models/BuyNow.js";
import jwt from "jsonwebtoken";

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
      name,
      image,
      price,
      quantity,
      selectedVariant,
      addressId,
    } = req.body;

    if (!productId || !name || !price) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (productId, name, price)",
      });
    }

    const totalAmount = price * (quantity || 1);

    const order = await BuyNow.create({
      user: userId,
      productId,
      name,
      image,
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
