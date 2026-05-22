import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist, 
  clearWishlist 
} from "../controllers/wishlistController.js";

const router = express.Router();

// All wishlist routes require authentication — data scoped to req.user._id
router.use(protect);

router.get("/", getWishlist);
router.post("/add", addToWishlist);
router.delete("/remove/:productId", removeFromWishlist);
router.delete("/clear", clearWishlist);

export default router;
