import express from 'express';
const router = express.Router();

router.get('/stripe', (req, res) => {
  res.send(process.env.STRIPE_PUBLISHABLE_KEY);
});

export default router;
