import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  createAddress, 
  getMyAddresses, 
  updateAddress, 
  deleteAddress, 
  lookupPincode 
} from "../controllers/addressController.js";

const router = express.Router();

router.post("/", protect, createAddress);
router.get("/", protect, getMyAddresses);
router.put("/:id", protect, updateAddress);
router.delete("/:id", protect, deleteAddress);
router.get("/pincode/:pincode", lookupPincode);

export default router;
