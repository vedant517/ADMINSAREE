import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './admin/models/Admin.js';

import dns from 'node:dns';

dotenv.config();

// Fix for MongoDB SRV DNS resolution issues
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (err) {
  console.warn("⚠️ DNS setServers failed, proceeding with system default:", err.message);
}


const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const email = 'admin@gmail.com';
    const password = 'admin123';

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await Admin.create({
      name: 'Admin',
      email,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
