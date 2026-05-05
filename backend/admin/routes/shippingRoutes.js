import express from "express";
import { calculateShippingCharge } from "../controllers/shippingChargeController.js";

const router = express.Router();

router.post("/calculate", calculateShippingCharge);

export default router;
