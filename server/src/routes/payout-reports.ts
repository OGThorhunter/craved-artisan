import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  generatePayoutReport,
  generateMonthlyPayoutReport
} from '../controllers/payout-reports';

const router = express.Router();

// Payout Report Routes
router.get('/:vendorId', requireAuth, requireRole(['VENDOR', 'ADMIN']), generatePayoutReport);
router.get('/:vendorId/monthly', requireAuth, requireRole(['VENDOR', 'ADMIN']), generateMonthlyPayoutReport);

export default router; 