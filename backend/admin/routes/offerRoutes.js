import express from "express";
const router = express.Router();

import {
  createOffer,
  getOffersByProduct,
  getAllOffers, // ✅ NEW
  updateOffer,
  deleteOffer
} from "../controllers/offer.controller.js";

// ✅ ROUTES
router.post("/", createOffer);

// 🔥 NEW ROUTE (must be ABOVE /:productId)
router.get("/", getAllOffers);

router.get("/:productId", getOffersByProduct);
router.put("/:id", updateOffer);
router.delete("/:id", deleteOffer);

export default router;