import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin';
import {
  getWalletBalanceController,
  getWalletTransactionsController,
  addFundsController,
  calculateLabelCostController,
  processLabelPrintController,
  getLabelPrintStatusController,
  downloadLabelFileController,
  getLabelPrintHistoryController,
  getLabelPrintStatsController,
  refundLabelPrintController,
  exportLabelPrintHistoryController
} from '../controllers/wallet';

const router = express.Router();

// Wallet routes
router.get('/vendor/:vendorId/balance', requireAuth, isVendorOwnerOrAdmin, getWalletBalanceController);
router.get('/vendor/:vendorId/transactions', requireAuth, isVendorOwnerOrAdmin, getWalletTransactionsController);

// Admin-only wallet operations
router.post('/vendor/:vendorId/add-funds', requireAuth, requireRole(['ADMIN']), addFundsController);

// Label print routes
router.get('/label/cost', requireAuth, calculateLabelCostController);
router.post('/vendor/:vendorId/label/print', requireAuth, isVendorOwnerOrAdmin, processLabelPrintController);
router.get('/label/:labelPrintId/status', requireAuth, getLabelPrintStatusController);
router.get('/label/:labelPrintId/download', requireAuth, downloadLabelFileController);
router.get('/vendor/:vendorId/label/history', requireAuth, isVendorOwnerOrAdmin, getLabelPrintHistoryController);
router.get('/vendor/:vendorId/label/stats', requireAuth, isVendorOwnerOrAdmin, getLabelPrintStatsController);
router.get('/vendor/:vendorId/label/export', requireAuth, isVendorOwnerOrAdmin, exportLabelPrintHistoryController);

// Admin-only label operations
router.post('/label/:labelPrintId/refund', requireAuth, requireRole(['ADMIN']), refundLabelPrintController);

export default router; 