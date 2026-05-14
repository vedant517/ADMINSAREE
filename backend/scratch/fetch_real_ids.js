import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../User/models/Product.js";

dotenv.config();

const fetchRealData = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find().limit(2).select("_id name price");
  console.log("Real Products:", JSON.stringify(products, null, 2));
  process.exit();
};

fetchRealData();
