import express from "express";
import { 
  getOrders, 
  updateOrder, 
  getOrderStats 
} from "../controllers/orderController.js";
import { createOrder, getUserOrders, cancelOrder } from "../../User/controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Order creation and list
router.route("/")
  .get(protect, getOrders) 
  .post(protect, createOrder);

router.get("/my-orders", protect, getUserOrders);
router.post("/cancel/:orderId", protect, cancelOrder);

router.get("/stats", protect, authorize('admin'), getOrderStats);

// Admin-only write routes
router.put("/:orderId", protect, authorize('admin'), updateOrder);


export default router;
