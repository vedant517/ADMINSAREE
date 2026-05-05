import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './User/models/Category.js';
import { PRODUCT_MAIN_CATEGORIES, PRODUCT_SUB_CATEGORIES } from './admin/config/constants.js';
import dns from 'node:dns';

// Fix for MongoDB SRV DNS resolution issues
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (err) {
  console.warn("⚠️ DNS setServers failed:", err.message);
}

dotenv.config();

const seedCategories = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("MONGODB_URI not found");
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log("Connected to MongoDB...");

    // Clear existing categories
    await Category.deleteMany({});
    console.log("Cleared existing categories.");

    // Seed Main Categories
    const mainCats = PRODUCT_MAIN_CATEGORIES.map(cat => ({
      name: cat.name,
      slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
      image: cat.image,
      isMain: true
    }));

    // Seed Sub Categories
    const subCats = PRODUCT_SUB_CATEGORIES.map(name => ({
      name: name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      isMain: false
    }));

    await Category.insertMany([...mainCats, ...subCats]);
    console.log("Seeded categories successfully!");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
};

seedCategories();
