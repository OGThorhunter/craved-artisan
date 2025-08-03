import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { 
  createCheckoutSession,
  processMultiVendorTransfers,
  getCheckoutSessionStatus,
  calculateCommissionBreakdown
} from '../controllers/checkout';

const router = express.Router();

// Checkout Session Routes
router.post('/create-session', requireAuth, requireRole(['CUSTOMER']), createCheckoutSession);
router.get('/session/:sessionId', requireAuth, getCheckoutSessionStatus);

// Multi-vendor Transfer Routes
router.post('/transfers/:orderId', requireAuth, requireRole(['CUSTOMER']), processMultiVendorTransfers);

// Commission Calculation Routes
router.get('/commission/:orderId', requireAuth, calculateCommissionBreakdown);

export default router; 