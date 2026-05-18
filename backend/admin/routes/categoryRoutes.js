import express from "express";
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  toggleCategoryStatus
} from "../controllers/categoryController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// GET /api/categories is PUBLIC (for shop filters)
router.get("/", getCategories);

// Other methods are PROTECTED (Admin only)
router.post("/", protect, authorize('admin'), upload.single('image'), createCategory);
router.put("/:id", protect, authorize('admin'), upload.single('image'), updateCategory);
router.delete("/:id", protect, authorize('admin'), deleteCategory);
router.patch("/:id/toggle-status", protect, authorize('admin'), toggleCategoryStatus);

export default router;
