import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";
import Address from "../../models/Address.js";

const shouldSaveAddress = (body) => {
  return Boolean(
    body.saveAddress ||
    body.saveForFuture ||
    body.saveForFutureUse ||
    body.saveAddressForFuture ||
    body.saveThisAddress
  );
};

const splitName = (fullName = "") => {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || parts[0] || "",
  };
};

const buildSavedAddress = (body, shippingAddress, userId) => {
  const nameParts = splitName(body.fullName || shippingAddress?.fullName);
  return {
    user: userId,
    firstName: body.firstName || shippingAddress?.firstName || nameParts.firstName,
    lastName: body.lastName || shippingAddress?.lastName || nameParts.lastName,
    email: body.email || shippingAddress?.email,
    phoneNumber: body.phoneNumber || body.phone || shippingAddress?.phone || shippingAddress?.phoneNumber,
    address: body.address || shippingAddress?.address,
    country: body.country || shippingAddress?.country || "India",
    state: body.state || shippingAddress?.state,
    city: body.city || shippingAddress?.city,
    zipCode: body.zipCode || body.postalCode || shippingAddress?.zipCode || shippingAddress?.postalCode,
  };
};

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    // 1. Handle flexible items input (items or orderItems)
    const orderItems = req.body.orderItems || req.body.items;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // 2. Handle flexible shipping address input
    let shippingAddress = req.body.shippingAddress;
    
    // If shippingAddress is missing but flat fields are present, map them
    if (!shippingAddress && (req.body.address || req.body.city || req.body.zipCode)) {
      shippingAddress = {
        fullName: `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim() || undefined,
        address: req.body.address,
        city: req.body.city,
        postalCode: req.body.zipCode || req.body.postalCode,
        country: req.body.country,
        state: req.body.state,
        phone: req.body.phoneNumber || req.body.phone
      };
    }

    // Calculate items price securely and GST
    let calculatedItemsPrice = 0;
    
    // We recreate orderItems with secure prices from the DB
    const secureOrderItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      // Use price from DB if available, otherwise fallback to item.price (for custom/manual orders)
      const priceToUse = product ? (product.discountPrice > 0 ? product.discountPrice : product.price) : item.price;
      
      secureOrderItems.push({
        ...item,
        price: priceToUse
      });
      
      calculatedItemsPrice += (priceToUse * item.qty);
      
      if (product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.qty }
        });
      }
    }

    const itemsPrice = calculatedItemsPrice;

    // Calculate shipping charge
    let shippingPrice = req.body.shippingPrice;
    
    if (shippingPrice === undefined || shippingPrice === null) {
      if (itemsPrice < 500) {
        shippingPrice = 50;
      } else if (itemsPrice >= 500 && itemsPrice < 1000) {
        shippingPrice = 30;
      } else {
        shippingPrice = 0;
      }
    }

    // Calculate GST (18%) from backend
    const taxPrice = Number((itemsPrice * 0.18).toFixed(2));

    const totalPrice = itemsPrice + shippingPrice + taxPrice;
    
    // Extract payment method from request, default to COD
    const paymentMethod = req.body.paymentMethod?.trim() || 'COD';
    const isPaidInitially = paymentMethod === 'Razorpay' ? false : (paymentMethod === 'COD' ? false : false);

    const orderData = {
      ...req.body,
      orderId: "#ORD" + Date.now(),
      orderItems: secureOrderItems,
      shippingAddress, // Use the normalized/mapped address
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentMethod: paymentMethod,
      isPaid: isPaidInitially,
      status: "Pending"
    };

    if (req.user?.id) {
      orderData.user = req.user.id;
    }

    const order = await Order.create(orderData);

    if (req.user?.id && shouldSaveAddress(req.body)) {
      const addressData = buildSavedAddress(req.body, shippingAddress, req.user.id);
      const hasRequiredAddressFields = [
        "firstName",
        "lastName",
        "email",
        "phoneNumber",
        "address",
        "country",
        "state",
        "city",
        "zipCode",
      ].every((field) => Boolean(addressData[field]));

      if (hasRequiredAddressFields) {
        await Address.create(addressData);
      } else {
        console.warn("Address not saved from checkout because required fields were missing:", addressData);
      }
    }
    
    // Create transaction based on payment method
    if (paymentMethod.toUpperCase() === 'COD' || paymentMethod.toLowerCase().includes('cash on delivery')) {
       await Transaction.create({
         transactionId: 'TXNCOD' + Date.now(),
         order: order._id,
         user: order.user,
         razorpayOrderId: 'COD_' + order.orderId,
         amount: totalPrice,
         currency: 'INR',
         status: 'captured',
         paymentMethod: 'COD',
       });
    } else if (paymentMethod === 'Razorpay') {
       // Razorpay transaction will be created when payment is initiated
       await Transaction.create({
         transactionId: 'TXN_' + Date.now(),
         order: order._id,
         user: order.user,
         razorpayOrderId: 'PENDING_' + order.orderId, // Required by model
         amount: totalPrice,
         currency: 'INR',
         status: 'created', // 'initiated' is not in enum
         paymentMethod: 'Razorpay',
       });
    }

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error("Order Creation Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET USER ORDERS
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user?.id });

    res.json({
      success: true,
      data: orders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CANCEL ORDER (USER)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId, user: req.user?.id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.qty }
      });
    }

    order.status = "Cancelled";
    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
