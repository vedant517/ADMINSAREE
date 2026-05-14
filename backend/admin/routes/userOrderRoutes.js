import express from "express";
import {
  createOrder,
  getUserOrders,
  cancelOrder
} from "../../User/controllers/orderController.js";
import { protect } from "../../User/middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, getUserOrders);
router.put("/:orderId", protect, cancelOrder);

export default router;

