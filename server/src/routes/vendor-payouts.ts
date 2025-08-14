import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { Role } from '../lib/prisma';
import {
  getVendorPayoutHistory,
  getVendorPayoutSummary,
  getVendorStripeDashboardUrl,
  getVendorAccountStatus,
  getStripeExpressDashboardUrl
} from '../controllers/vendor-payouts';

const router = express.Router();

// Vendor payout history routes
router.get('/history/:vendorId', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), getVendorPayoutHistory);
router.get('/summary/:vendorId', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), getVendorPayoutSummary);
router.get('/dashboard/:vendorId', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), getVendorStripeDashboardUrl);
router.get('/status/:vendorId', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), getVendorAccountStatus);

// Stripe Express Dashboard routes
router.get('/express-dashboard/:vendorId', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), getStripeExpressDashboardUrl);

export default router; 
