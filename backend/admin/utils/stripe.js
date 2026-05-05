import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (orderItems, orderId) => {
  const line_items = orderItems.map((item) => ({
    price_data: {
      currency: 'inr',
      product_data: {
        name: item.name,
        images: [item.image],
      },
      unit_amount: Math.round(item.price * 100), // Stripe expects paise for INR
    },
    quantity: item.qty,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/order/${orderId}/success`,
    cancel_url: `${process.env.FRONTEND_URL}/order/${orderId}/cancel`,
    metadata: { orderId },
  });

  return session;
};

export default stripe;
