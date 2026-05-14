import express from "express";
import { 
  getProducts, 
  getProductById, 
  searchProducts, 
  addProductReview,
  getMainCategories,
  getSubCategories
} from "../controllers/productController.js";
import { protect as userProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/main-categories", getMainCategories);
router.get("/sub-categories", getSubCategories);
router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/:id", getProductById);
router.post("/:id/reviews", userProtect, addProductReview);

export default router;
