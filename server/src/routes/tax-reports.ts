import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  generateTaxReport,
  generateForm1099K,
  getTaxReportSummary
} from '../controllers/tax-reports';

const router = express.Router();

// Tax Report Routes
router.get('/:vendorId/:year', requireAuth, requireRole(['VENDOR', 'ADMIN']), generateTaxReport);
router.get('/:vendorId/:year/1099k', requireAuth, requireRole(['VENDOR', 'ADMIN']), generateForm1099K);
router.get('/:vendorId/summary', requireAuth, requireRole(['VENDOR', 'ADMIN']), getTaxReportSummary);

export default router; 