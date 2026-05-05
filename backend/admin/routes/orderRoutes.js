import express from "express";
import {
  getOrders,
  updateOrder,
  getOrderStats
} from "../controllers/orderController.js";
import { createOrder } from "../controllers/userOrderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Order creation and list
router.route("/")
  .get(protect, getOrders) // getOrders controller will handle Admin vs User logic
  .post(protect, createOrder);

router.get("/stats", protect, authorize('admin'), getOrderStats);

// Admin-only write routes
router.put("/:orderId", protect, authorize('admin'), updateOrder);


export default router;
