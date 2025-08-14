import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { Role } from '../lib/prisma';
import { 
  createStripeOnboarding,
  getOnboardingStatus,
  refreshOnboardingLink,
  completeOnboarding,
  getCommissionInfo,
  calculateCommission
} from '../controllers/stripe';

const router = express.Router();

// Vendor Onboarding Routes
router.post('/onboarding/create', requireAuth, requireRole([Role.VENDOR]), createStripeOnboarding);
router.get('/onboarding/status/:vendorProfileId', requireAuth, requireRole([Role.VENDOR]), getOnboardingStatus);
router.post('/onboarding/refresh/:vendorProfileId', requireAuth, requireRole([Role.VENDOR]), refreshOnboardingLink);
router.post('/onboarding/complete/:vendorProfileId', requireAuth, requireRole([Role.VENDOR]), completeOnboarding);

// Commission Routes
router.get('/commission/info', requireAuth, getCommissionInfo);
router.post('/commission/calculate', requireAuth, calculateCommission);

export default router; 
