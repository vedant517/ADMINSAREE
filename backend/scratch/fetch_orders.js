import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'node:dns';

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (err) {}

dotenv.config();

const fetchOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check both locations for Order model
    const Order = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({ orderId: String, totalPrice: Number }));
    
    const orders = await Order.find({}, 'orderId totalPrice').limit(5);
    
    console.log('--- ORDERS ---');
    orders.forEach(o => console.log(`ID: ${o._id} | Custom Order ID: ${o.orderId} | Total: ${o.totalPrice}`));
    
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fetchOrders();
