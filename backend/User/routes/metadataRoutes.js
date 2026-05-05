import express from 'express';
import Category from '../models/Category.js';
import { PRODUCT_COLORS } from '../../admin/config/constants.js';

const router = express.Router();

// @desc    Get main categories
// @route   GET /api/main-categories
router.get('/main-categories', async (req, res) => {
  try {
    const categories = await Category.find({ isMain: true });
    res.json({
      success: true,
      data: categories
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Get categories (tags/sub-categories)
// @route   GET /api/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isMain: false });
    res.json({
      success: true,
      data: categories.map(c => c.name)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Get all metadata
// @route   GET /api/metadata
router.get('/metadata', async (req, res) => {
  try {
    const mainCategories = await Category.find({ isMain: true });
    const allCategories = await Category.find({});
    
    res.json({
      success: true,
      data: {
        mainCategories: mainCategories,
        categories: allCategories.map(c => c.name),
        colors: PRODUCT_COLORS 
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
