import express from "express";
import { getCategories } from "../../admin/controllers/categoryController.js";

const router = express.Router();

// PUBLIC: GET /api/categories
router.get("/", getCategories);

export default router;
