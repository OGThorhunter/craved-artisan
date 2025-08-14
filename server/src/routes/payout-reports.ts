import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { Role } from '../lib/prisma';
import {
  generatePayoutReport,
  generateMonthlyPayoutReport
} from '../controllers/payout-reports';

const router = express.Router();

// Payout Report Routes
router.get('/:vendorId', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), generatePayoutReport);
router.get('/:vendorId/monthly', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), generateMonthlyPayoutReport);

export default router; 
