import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coupon from '../User/models/Coupon.js';
import dns from 'node:dns';

dotenv.config();

// Fix for MongoDB SRV DNS resolution issues
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (err) {}

async function checkCoupons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const coupons = await Coupon.find();
    console.log('TOTAL_COUPONS:', coupons.length);
    console.log(JSON.stringify(coupons, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkCoupons();
