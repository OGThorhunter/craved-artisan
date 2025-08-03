import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin';
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
router.post('/validate', requireAuth, requireRole(['VENDOR', 'ADMIN']), validateProductMargin);
router.post('/analysis', requireAuth, requireRole(['VENDOR', 'ADMIN']), getProductMarginAnalysis);
router.post('/calculate-minimum-price', requireAuth, requireRole(['VENDOR', 'ADMIN']), calculateMinimumPriceForMargin);

// Vendor margin settings routes
router.get('/vendor/:vendorId/settings', requireAuth, isVendorOwnerOrAdmin, getVendorMarginSettings);
router.put('/vendor/:vendorId/settings', requireAuth, isVendorOwnerOrAdmin, updateVendorMarginSettings);

// System margin settings routes (admin only)
router.get('/system/settings', requireAuth, requireRole(['ADMIN']), getSystemMarginSettingsController);
router.put('/system/settings', requireAuth, requireRole(['ADMIN']), updateSystemMarginSettings);
router.post('/system/initialize', requireAuth, requireRole(['ADMIN']), initializeSystemSettingsController);

// Product margin analysis routes
router.get('/vendor/:vendorId/low-margin-products', requireAuth, isVendorOwnerOrAdmin, getLowMarginProducts);
router.get('/vendor/:vendorId/bulk-validate', requireAuth, isVendorOwnerOrAdmin, bulkValidateMargins);

export default router; 