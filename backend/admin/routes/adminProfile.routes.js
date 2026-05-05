import express from "express";
import {
  getProfile,
  updateProfile,
  updatePassword,
} from "../controllers/adminProfile.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// protect all routes and ensure only admin
router.use(protect);
router.use(authorize('admin'));

router.get("/",          getProfile);
router.put("/",          updateProfile);
router.put("/password",  updatePassword);

export default router;