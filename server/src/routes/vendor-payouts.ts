import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  getVendorPayoutHistory,
  getVendorPayoutSummary,
  getVendorStripeDashboardUrl,
  getVendorAccountStatus,
  getStripeExpressDashboardUrl
} from '../controllers/vendor-payouts';

const router = express.Router();

// Vendor payout history routes
router.get('/history/:vendorId', requireAuth, requireRole(['VENDOR', 'ADMIN']), getVendorPayoutHistory);
router.get('/summary/:vendorId', requireAuth, requireRole(['VENDOR', 'ADMIN']), getVendorPayoutSummary);
router.get('/dashboard/:vendorId', requireAuth, requireRole(['VENDOR', 'ADMIN']), getVendorStripeDashboardUrl);
router.get('/status/:vendorId', requireAuth, requireRole(['VENDOR', 'ADMIN']), getVendorAccountStatus);

// Stripe Express Dashboard routes
router.get('/express-dashboard/:vendorId', requireAuth, requireRole(['VENDOR', 'ADMIN']), getStripeExpressDashboardUrl);

export default router; 