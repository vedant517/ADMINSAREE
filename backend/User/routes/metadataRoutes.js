import express from 'express';
import { 
  PRODUCT_MAIN_CATEGORIES, 
  PRODUCT_SUB_CATEGORIES, 
  PRODUCT_COLORS 
} from '../../admin/config/constants.js';

const router = express.Router();

// @desc    Get main categories
// @route   GET /api/main-categories
// @access  Public
router.get('/main-categories', (req, res) => {
  res.json({
    success: true,
    data: PRODUCT_MAIN_CATEGORIES
  });
});

// @desc    Get categories (tags)
// @route   GET /api/categories
// @access  Public
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    data: PRODUCT_SUB_CATEGORIES
  });
});

// @desc    Get all metadata
// @route   GET /api/metadata
// @access  Public
router.get('/metadata', (req, res) => {
  res.json({
    success: true,
    data: {
      mainCategories: PRODUCT_MAIN_CATEGORIES,
      categories: PRODUCT_SUB_CATEGORIES,
      colors: PRODUCT_COLORS
    }
  });
});

export default router;
