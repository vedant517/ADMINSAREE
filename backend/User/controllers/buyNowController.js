import BuyNow from "../models/BuyNow.js";

export const createBuyNow = async (req, res) => {
  try {
    const {
      user,
      productId,
      name,
      image,
      price,
      quantity,
      selectedVariant,
      addressId,
    } = req.body;

    if (!user || !productId || !name || !price) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (user, productId, name, price)",
      });
    }

    const totalAmount = price * (quantity || 1);

    const order = await BuyNow.create({
      user,
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
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
