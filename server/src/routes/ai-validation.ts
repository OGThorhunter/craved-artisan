import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { Role } from '../lib/prisma';
import {
  validateProductPricing,
  validateBulkPricing,
  getMarketInsights
} from '../controllers/ai-validation';

const router = express.Router();

// AI Cost-to-Margin Validation Routes
router.post('/validate-pricing', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), validateProductPricing);
router.post('/validate-bulk-pricing', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), validateBulkPricing);
router.get('/market-insights', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), getMarketInsights);

export default router; 
