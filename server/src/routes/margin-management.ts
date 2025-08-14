import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin';
import { Role } from '../lib/prisma';
import {
  validateProductMargin,
  getProductMarginAnalysis,
  calculateMinimumPriceForMargin,
  getVendorMarginSettings,
  updateVendorMarginSettings,
  getSystemMarginSettingsController,
  updateSystemMarginSettings,
  initializeSystemSettingsController,
  getLowMarginProducts,
  bulkValidateMargins
} from '../controllers/margin-management';

const router = express.Router();

// Margin validation routes
router.post('/validate', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), validateProductMargin);
router.post('/analysis', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), getProductMarginAnalysis);
router.post('/calculate-minimum-price', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), calculateMinimumPriceForMargin);

// Vendor margin settings routes
router.get('/vendor/:vendorId/settings', requireAuth, isVendorOwnerOrAdmin, getVendorMarginSettings);
router.put('/vendor/:vendorId/settings', requireAuth, isVendorOwnerOrAdmin, updateVendorMarginSettings);

// System margin settings routes (admin only)
router.get('/system/settings', requireAuth, requireRole([Role.ADMIN]), getSystemMarginSettingsController);
router.put('/system/settings', requireAuth, requireRole([Role.ADMIN]), updateSystemMarginSettings);
router.post('/system/initialize', requireAuth, requireRole([Role.ADMIN]), initializeSystemSettingsController);

// Product margin analysis routes
router.get('/vendor/:vendorId/low-margin-products', requireAuth, isVendorOwnerOrAdmin, getLowMarginProducts);
router.get('/vendor/:vendorId/bulk-validate', requireAuth, isVendorOwnerOrAdmin, bulkValidateMargins);

export default router; 
