import express from "express";
import adminRoutes from "./adminRoutes.js";
import productRoutes from "./productRoutes.js";
import configRoutes from "./configRoutes.js";
import orderRoutes from "./orderRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import transactionRoutes from "./transactionRoutes.js";
import customerRoutes from "./customer.routes.js";
import addressRoutes from "./address.routes.js";
import offerRoutes from "./offerRoutes.js";
import adminProfileRoutes from "./adminProfile.routes.js";
import couponRoutes from "./Couponroutes.js";
import categoryRoutes from "./categoryRoutes.js";
import adminEnquiryRoutes from "./adminEnquiryRoutes.js";
import shippingRoutes from "./shippingRoutes.js";

const router = express.Router();

router.use("/", adminRoutes); // This handles /login etc.
router.use("/products", productRoutes);
router.use("/config", configRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/transactions", transactionRoutes);
router.use("/customers", customerRoutes);
router.use("/addresses", addressRoutes);
router.use("/offers", offerRoutes);
router.use("/profile", adminProfileRoutes);
router.use("/coupons", couponRoutes);
router.use("/categories", categoryRoutes);
router.use("/enquiries", adminEnquiryRoutes);
router.use("/shipping", shippingRoutes);

export default router;
