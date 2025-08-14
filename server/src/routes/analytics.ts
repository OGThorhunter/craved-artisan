import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { Role } from '../lib/prisma';
import { 
  getVendorOverview,
  getVendorBestSellers
} from '../controllers/analytics';

const router = express.Router();

// GET /analytics/vendor/overview
// Get vendor analytics overview with period filtering
router.get('/vendor/overview', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), getVendorOverview);

// GET /analytics/vendor/best-sellers
// Get vendor best sellers with period and limit filtering
router.get('/vendor/best-sellers', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), getVendorBestSellers);

export default router;
