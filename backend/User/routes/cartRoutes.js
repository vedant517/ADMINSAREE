import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  getCartBreakdown, 
  getCart, 
  addToCart, 
  updateCart, 
  removeFromCart, 
  clearCart 
} from "../controllers/cartController.js";

const router = express.Router();

// All cart routes require authentication — cart is always per req.user._id
router.use(protect);

router.get("/breakdown", getCartBreakdown);
router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update/:id", updateCart);
router.delete("/remove/:id", removeFromCart);
router.delete("/clear", clearCart);

export default router;
