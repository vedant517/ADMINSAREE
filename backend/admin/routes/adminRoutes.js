import express from "express";
import { loginUser, logoutUser } from "../controllers/adminController.js";

const router = express.Router();

// Auth routes
router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;
