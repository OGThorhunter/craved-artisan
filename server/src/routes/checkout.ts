import express from 'express';
import { requireAuth } from '../middleware/auth';
import { 
  createCheckoutSession,
  getCheckoutSessionStatus,
  processMultiVendorTransfers,
  calculateCommissionBreakdown
} from '../controllers/checkout';

const router = express.Router();

// Checkout session endpoints
router.post('/checkout/session', requireAuth, createCheckoutSession);
router.get('/checkout/session/:sessionId/status', requireAuth, getCheckoutSessionStatus);
router.post('/checkout/transfers', requireAuth, processMultiVendorTransfers);
router.get('/checkout/commission-breakdown', requireAuth, calculateCommissionBreakdown);

export default router; 