import mongoose from "mongoose";

const buyNowSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    selectedVariant: {
      type: Object,
    },

    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      default: null,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const BuyNow = mongoose.models.BuyNow || mongoose.model("BuyNow", buyNowSchema);
export default BuyNow;
