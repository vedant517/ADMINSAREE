import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductMetadata
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Use upload.any() to handle dynamic field names like variantImage_0, variantImage_1, etc.
const uploadMiddleware = upload.any();

router.get('/metadata', getProductMetadata);

router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), uploadMiddleware, createProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), uploadMiddleware, updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.route('/:id/reviews').post(protect, createProductReview);

export default router;
