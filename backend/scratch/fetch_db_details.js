import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'node:dns';

// Fix for DNS issues in some environments
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (err) {}

dotenv.config();

const fetchDetails = async () => {
  try {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI not found");
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ name: String, email: String }));
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({ name: String, price: Number }));
    
    const users = await User.find({}, 'name email').limit(5);
    const products = await Product.find({}, 'name price').limit(5);
    
    console.log('--- USERS ---');
    users.forEach(u => console.log(`ID: ${u._id} | Name: ${u.name} | Email: ${u.email}`));
    
    console.log('\n--- PRODUCTS ---');
    products.forEach(p => console.log(`ID: ${p._id} | Name: ${p.name} | Price: ${p.price}`));
    
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fetchDetails();
