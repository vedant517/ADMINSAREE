import express from "express";
import { createBuyNow, getBuyNowOrders, getBuyNowByUser } from "../controllers/buyNowController.js";

const router = express.Router();

// POST /api/buynow - Create a Buy Now order
router.post("/", createBuyNow);

// GET /api/buynow - Get all Buy Now orders
router.get("/", getBuyNowOrders);

// GET /api/buynow/user/:userId - Get orders by user
router.get("/user/:userId", getBuyNowByUser);

export default router;
