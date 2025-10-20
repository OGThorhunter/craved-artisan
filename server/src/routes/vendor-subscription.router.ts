import { Router, Response } from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/session-simple';
import { 
  createVendorSubscription, 
  checkSubscriptionStatus,
  cancelVendorSubscription,
  reactivateVendorSubscription
} from '../services/vendor-subscription.service';
import { prisma } from '../lib/prisma';
import { logger } from '../logger';
import { AuthenticatedRequest } from '../types/session';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// Create subscription during vendor onboarding
router.post('/create', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
      include: { user: true },
    });
    
    if (!vendorProfile) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }
    
    const result = await createVendorSubscription(vendorProfile.id, vendorProfile.user.email);
    
    res.json({
      success: true,
      subscription: {
        id: result.subscription.id,
        status: result.subscription.status,
        trialEnd: result.trialEndsAt,
        currentPeriodEnd: new Date(result.subscription.current_period_end * 1000),
      },
    });
  } catch (error) {
    logger.error({ error }, 'Failed to create vendor subscription');
    res.status(500).json({ 
      error: 'Failed to create subscription',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get subscription status
router.get('/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }
    
    const status = await checkSubscriptionStatus(vendor.id);
    
    res.json(status);
  } catch (error) {
    logger.error({ error }, 'Failed to get subscription status');
    res.status(500).json({ 
      error: 'Failed to get subscription status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create billing portal session (for payment method updates)
router.post('/billing-portal', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });
    
    if (!vendor?.stripeCustomerId) {
      return res.status(400).json({ error: 'No subscription found' });
    }
    
    const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/vendor/subscription`;
    
    const session = await stripe.billingPortal.sessions.create({
      customer: vendor.stripeCustomerId,
      return_url: returnUrl,
    });
    
    res.json({ url: session.url });
  } catch (error) {
    logger.error({ error }, 'Failed to create billing portal session');
    res.status(500).json({ 
      error: 'Failed to create billing portal',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Cancel subscription
router.post('/cancel', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }
    
    const subscription = await cancelVendorSubscription(vendor.id);
    
    res.json({
      success: true,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  } catch (error) {
    logger.error({ error }, 'Failed to cancel subscription');
    res.status(500).json({ 
      error: 'Failed to cancel subscription',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Reactivate subscription
router.post('/reactivate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }
    
    const subscription = await reactivateVendorSubscription(vendor.id);
    
    res.json({
      success: true,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  } catch (error) {
    logger.error({ error }, 'Failed to reactivate subscription');
    res.status(500).json({ 
      error: 'Failed to reactivate subscription',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

