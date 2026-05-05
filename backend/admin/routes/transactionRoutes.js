import express from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  getTransactions,
  getTransactionById,
  getTransactionStats,
  refundTransaction,
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Transaction Flow
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);

// Admin / Management Routes
router.get('/', protect, authorize('admin'), getTransactions);
router.get('/stats', protect, authorize('admin'), getTransactionStats);
router.get('/:id', protect, getTransactionById);
router.post('/:id/refund', protect, authorize('admin'), refundTransaction);

export default router;