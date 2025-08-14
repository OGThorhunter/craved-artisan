import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { Role } from '../lib/prisma';
import {
  generateTaxReport,
  generateForm1099K,
  getTaxReportSummary
} from '../controllers/tax-reports';

const router = express.Router();

// Tax Report Routes
router.get('/:vendorId/:year', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), generateTaxReport);
router.get('/:vendorId/:year/1099k', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), generateForm1099K);
router.get('/:vendorId/summary', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), getTaxReportSummary);

export default router; 
