import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  quantity: { type: Number, default: 1 },
  selectedVariant: {
    name: String,
    value: String,
  },
});

const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    ...cartItemSchema.obj, // Embed the item fields directly for simplicity
  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);