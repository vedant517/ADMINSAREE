import express from "express";
import { createReview, getProductReviews, getAllReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", createReview);
router.get("/product/:productId", getProductReviews);
router.get("/", getAllReviews); // Consider moving this to Admin index if it's admin only

export default router;