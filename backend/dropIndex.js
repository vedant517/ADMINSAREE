import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import dns from "node:dns";
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (err) {
  console.warn("⚠️ DNS setServers failed:", err.message);
}

const dropIndex = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("MONGODB_URI not found in .env");
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const collection = mongoose.connection.collection('users');
    
    // Check if index exists
    const indexes = await collection.indexes();
    const hasEmailIndex = indexes.some(idx => idx.name === 'email_1');

    if (hasEmailIndex) {
      console.log("Dropping index 'email_1'...");
      await collection.dropIndex('email_1');
      console.log("Index 'email_1' dropped successfully.");
    } else {
      console.log("Index 'email_1' does not exist.");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error dropping index:", error);
    process.exit(1);
  }
};

dropIndex();
