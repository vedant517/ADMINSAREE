import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import dns from "node:dns";
import { fileURLToPath } from "url";

// Fix for ES Modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import models using corrected relative paths
import User from "../models/User.js";
import Product from "../admin/models/Product.js";
import Address from "../models/Address.js";

// Fix for MongoDB SRV DNS resolution issues
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (err) {
  console.warn("DNS setServers failed:", err.message);
}

dotenv.config({ path: path.join(__dirname, "../.env") });

const fetchData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI not found in .env");
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log("Connected to MongoDB");

    const user = await User.findOne().select("_id name");
    const product = await Product.findOne().select("_id name price images");
    const address = await Address.findOne().select("_id");

    console.log("REAL_DATA_START");
    console.log(JSON.stringify({
      user: user || "No User Found",
      product: product || "No Product Found",
      address: address || "No Address Found"
    }, null, 2));
    console.log("REAL_DATA_END");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error fetching data:", error);
    process.exit(1);
  }
};

fetchData();
