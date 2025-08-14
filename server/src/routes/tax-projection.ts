import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin';
import {
  getQuarterlyProjection,
  getAllProjections,
  getUpcomingObligations,
  sendTaxReminderController,
  getTaxSettingsController,
  updateTaxSettings,
  initializeTaxSettingsController,
  getTaxAlertsController,
  confirmTaxPaymentController,
  getTaxSummary,
  bulkSendTaxReminders
} from '../controllers/tax-projection';
import { manualTaxReminderCheck, getCronStatus } from '../services/taxReminderCron';

const router = express.Router();

// Tax projection routes
router.get('/vendor/:vendorId/projection', requireAuth, isVendorOwnerOrAdmin, getQuarterlyProjection);
router.get('/vendor/:vendorId/projections', requireAuth, isVendorOwnerOrAdmin, getAllProjections);
router.get('/vendor/:vendorId/obligations', requireAuth, isVendorOwnerOrAdmin, getUpcomingObligations);
router.get('/vendor/:vendorId/summary', requireAuth, isVendorOwnerOrAdmin, getTaxSummary);

// Tax reminder routes
router.post('/vendor/:vendorId/reminder', requireAuth, isVendorOwnerOrAdmin, sendTaxReminderController);
router.post('/vendor/:vendorId/confirm-payment', requireAuth, isVendorOwnerOrAdmin, confirmTaxPaymentController);

// Tax alerts routes
router.get('/vendor/:vendorId/alerts', requireAuth, isVendorOwnerOrAdmin, getTaxAlertsController);

// Tax settings routes (admin only)
router.get('/settings', requireAuth, requireRole(['ADMIN']), getTaxSettingsController);
router.put('/settings', requireAuth, requireRole(['ADMIN']), updateTaxSettings);
router.post('/settings/initialize', requireAuth, requireRole(['ADMIN']), initializeTaxSettingsController);

// Bulk operations (admin only)
router.post('/bulk-reminders', requireAuth, requireRole(['ADMIN']), bulkSendTaxReminders);

// CRON job management (admin only)
router.post('/cron/trigger', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await manualTaxReminderCheck();
    return res.json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Failed to trigger tax reminder check'
    });
  }
});

router.get('/cron/status', requireAuth, requireRole(['ADMIN']), (req, res) => {
  try {
    const status = getCronStatus();
    return res.json({
      success: true,
      status
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Failed to get CRON status'
    });
  }
});

export default router; 