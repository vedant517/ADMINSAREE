import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const { orderItems } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // Calculate items price securely and GST
    let calculatedItemsPrice = 0;
    
    // We recreate orderItems with secure prices from the DB
    const secureOrderItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      const priceToUse = product ? product.price : item.price;
      
      secureOrderItems.push({
        ...item,
        price: priceToUse
      });
      
      calculatedItemsPrice += (priceToUse * item.qty);
      
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty }
      });
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
    
    // Create transaction based on payment method
    if (paymentMethod === 'COD' || paymentMethod === 'Cash on Delivery') {
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
