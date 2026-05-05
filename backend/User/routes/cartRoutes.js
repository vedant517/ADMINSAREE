import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";

const router = express.Router();


// =======================
// 🔹 GET USER OR GUEST ID
// =======================
const getUserId = (req) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.id;
    } catch (err) {
      console.log("JWT ERROR:", err.message);
    }
  }

  return (
    req.headers["x-guest-id"] ||
    req.query.guestId ||
    req.body?.guestId ||
    null
  );
};


// =======================
// 🔹 HELPER: GET FULL CART
// =======================
const getFullCart = async (userId) => {
  const cart = await Cart.find({ userId }).sort({ addedAt: -1 });
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  return { cart, totalItems };
};


// =======================
// ✅ GET CART
// =======================
router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.json({
        success: true,
        cart: [],
        totalItems: 0,
      });
    }

    const data = await getFullCart(userId);
    res.json({ success: true, ...data });

  } catch (error) {
    console.error("GET CART ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// =======================
// ✅ ADD TO CART
// =======================
router.post("/add", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "guestId or token required",
      });
    }

    const { productId, name, price, image, quantity = 1, selectedVariant } = req.body;

    if (!productId || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "productId, name, and price are required",
      });
    }

    const existingItem = await Cart.findOne({
      userId,
      productId,
      ...(selectedVariant?.name && {
        "selectedVariant.name": selectedVariant.name,
      }),
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      await Cart.create({
        userId,
        productId,
        name,
        price,
        image,
        quantity,
        selectedVariant,
        addedAt: new Date(),
      });
    }

    const data = await getFullCart(userId);

    res.json({
      success: true,
      message: "Added to cart",
      ...data,
    });

  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// =======================
// ✅ UPDATE CART ITEM
// =======================
router.put("/update/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "guestId or token required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    const updatedItem = await Cart.findOneAndUpdate(
      { _id: id, userId },
      { quantity },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    const data = await getFullCart(userId);

    res.json({
      success: true,
      message: "Cart updated",
      ...data,
    });

  } catch (error) {
    console.error("UPDATE CART ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// =======================
// ✅ REMOVE FROM CART
// =======================
router.delete("/remove/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "guestId or token required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
      });
    }

    const deletedItem = await Cart.findOneAndDelete({ _id: id, userId });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    const data = await getFullCart(userId);

    res.json({
      success: true,
      message: "Removed from cart",
      ...data,
    });

  } catch (error) {
    console.error("REMOVE CART ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// =======================
// ✅ CLEAR CART
// =======================
router.delete("/clear", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "guestId or token required",
      });
    }

    await Cart.deleteMany({ userId });

    res.json({
      success: true,
      message: "Cart cleared",
      cart: [],
      totalItems: 0,
    });

  } catch (error) {
    console.error("CLEAR CART ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;