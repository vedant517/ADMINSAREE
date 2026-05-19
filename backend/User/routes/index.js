import express from "express";
import authRoutes from "./authRoutes.js";
import cartRoutes from "./cartRoutes.js";
import productRoutes from "./productRoutes.js";
import orderRoutes from "./orderRoutes.js";
import wishlistRoutes from "./wishlistRoutes.js";
import addressRoutes from "./addressRoutes.js";
import couponRoutes from "./couponRoutes.js";
import enquiryRoutes from "./enquiryRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import buyNowRoutes from "./buyNowRoutes.js";
import metadataRoutes from "./metadataRoutes.js";
import offerRoutes from "./offerRoutes.js";
import userRoutes from "./userRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import transactionRoutes from "./transactionRoutes.js";
import shippingRoutes from "./shippingRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/addresses", addressRoutes);
router.use("/coupons", couponRoutes);
router.use("/enquiries", enquiryRoutes);
router.use("/reviews", reviewRoutes);
router.use("/buynow", buyNowRoutes);
router.use("/metadata", metadataRoutes);
router.use("/offers", offerRoutes);
router.use("/user", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/transactions", transactionRoutes);
router.use("/shipping", shippingRoutes);

export default router;
