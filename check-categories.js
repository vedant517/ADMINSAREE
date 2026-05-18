import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const categorySchema = new mongoose.Schema({
  name: String,
  isMain: Boolean,
}, { strict: false });

const Category = mongoose.model('Category', categorySchema);

const cats = await Category.find().lean();
console.log('Categories in DB:', JSON.stringify(cats, null, 2));

process.exit(0);
