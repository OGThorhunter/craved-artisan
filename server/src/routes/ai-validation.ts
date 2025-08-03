import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  validateProductPricing,
  validateBulkPricing,
  getMarketInsights
} from '../controllers/ai-validation';

const router = express.Router();

// AI Cost-to-Margin Validation Routes
router.post('/validate-pricing', requireAuth, requireRole(['VENDOR', 'ADMIN']), validateProductPricing);
router.post('/validate-bulk-pricing', requireAuth, requireRole(['VENDOR', 'ADMIN']), validateBulkPricing);
router.get('/market-insights', requireAuth, requireRole(['VENDOR', 'ADMIN']), getMarketInsights);

export default router; 