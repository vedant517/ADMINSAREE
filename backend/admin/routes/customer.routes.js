import express from "express";
import * as customerController from "../controllers/customer.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// protect all routes
router.use(protect);
router.use(authorize('admin'));

//  Dashboard stats
router.get("/stats", customerController.getCustomerStats);

//  Customer table
router.get("/", customerController.getAllCustomers);

//  Single customer
router.get("/:userId", customerController.getCustomerById);

export default router;