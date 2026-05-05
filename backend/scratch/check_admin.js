import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../admin/models/Admin.js';
import dns from 'node:dns';

dotenv.config();

// Fix for MongoDB SRV DNS resolution issues
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (err) {
  console.warn("⚠️ DNS setServers failed:", err.message);
}

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const admins = await Admin.find({});
    console.log('Admins found:', admins.length);
    admins.forEach(a => console.log(`- ID: ${a._id}, Email: ${a.email}, Role: ${a.role}`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkAdmin();
