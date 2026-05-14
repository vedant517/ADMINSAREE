import express from "express";
import { 
  getCartBreakdown, 
  getCart, 
  addToCart, 
  updateCart, 
  removeFromCart, 
  clearCart 
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/breakdown", getCartBreakdown);
router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update/:id", updateCart);
router.delete("/remove/:id", removeFromCart);
router.delete("/clear", clearCart);

export default router;