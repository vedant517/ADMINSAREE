import express from "express";
import {
  createAddress,
  getAddresses,
  getAddressesByUser,
  updateAddress,
  deleteAddress,
} from "../controllers/address.controller.js";
import { protect } from "../../User/middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createAddress);
router.get("/", getAddresses);
router.get("/user/:userId", getAddressesByUser);
router.put("/:id", updateAddress);
router.delete("/:userId/:id", deleteAddress);

export default router;