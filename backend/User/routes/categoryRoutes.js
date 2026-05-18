import express from "express";
import { getActiveCategories } from "../../admin/controllers/categoryController.js";

const router = express.Router();

// PUBLIC: GET /api/categories
router.get("/", getActiveCategories);

export default router;
