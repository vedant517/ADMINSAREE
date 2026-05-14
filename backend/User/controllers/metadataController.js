import Category from '../models/Category.js';
import { PRODUCT_COLORS } from '../../admin/config/constants.js';

// GET MAIN CATEGORIES
export const getMainCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isMain: true });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET SUB CATEGORIES
export const getSubCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isMain: false });
    res.json({ success: true, data: categories.map(c => c.name) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL METADATA
export const getMetadata = async (req, res) => {
  try {
    const mainCategories = await Category.find({ isMain: true });
    const allCategories = await Category.find({});
    res.json({
      success: true,
      data: {
        mainCategories,
        categories: allCategories.map(c => c.name),
        colors: PRODUCT_COLORS 
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
