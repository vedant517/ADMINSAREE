import Order from "../models/Order.js";


export const calculateShippingCharge = (req, res) => {
  try {
    const { amount } = req.body;

    if (amount === undefined || amount === null) {
      return res.status(400).json({ 
        success: false, 
        message: "Amount is required to calculate shipping charges" 
      });
    }

    let shippingCharge = 0;
    
    if (amount < 500) {
      shippingCharge = 0; // Removed shipping charges
    } else if (amount >= 500 && amount < 1000) {
      shippingCharge = 0; // Removed shipping charges
    } else {
      shippingCharge = 0;
    }

    res.json({
      success: true,
      data: {
        amount,
        shippingCharge,
        isFree: shippingCharge === 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
