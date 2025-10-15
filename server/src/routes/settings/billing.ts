import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { loadAccountContext, requireAccountContext, canViewSensitiveData } from '../../middleware/account-auth';
import { prisma } from '../../db';
import { logger } from '../../logger';
import Stripe from 'stripe';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

// GET /api/settings/billing/summary
export const getBillingSummary = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;

    // Get or create billing profile
    let billingProfile = await prisma.billingProfile.findUnique({
      where: { accountId }
    });

    if (!billingProfile) {
      // Create Stripe customer
      const account = await prisma.account.findUnique({
        where: { id: accountId }
      });

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      const stripeCustomer = await stripe.customers.create({
        email: account.primaryEmail,
        name: account.name,
        metadata: {
          accountId: accountId
        }
      });

      billingProfile = await prisma.billingProfile.create({
        data: {
          accountId,
          stripeCustomerId: stripeCustomer.id,
          currency: 'USD'
        }
      });
    }

    // Get subscriptions and invoices
    const [subscriptions, invoices] = await Promise.all([
      prisma.subscription.findMany({
        where: { accountId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.invoice.findMany({
        where: { accountId },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    res.json({
      success: true,
      data: {
        billingProfile,
        subscriptions,
        invoices
      }
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error fetching billing summary');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// POST /api/settings/billing/portal
export const createBillingPortal = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;

    // Get billing profile
    const billingProfile = await prisma.billingProfile.findUnique({
      where: { accountId }
    });

    if (!billingProfile?.stripeCustomerId) {
      return res.status(404).json({
        success: false,
        message: 'Billing profile not found'
      });
    }

    // Create Stripe customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: billingProfile.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/settings/billing`
    });

    res.json({
      success: true,
      data: {
        url: portalSession.url
      }
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error creating billing portal');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Apply middleware and routes
router.use(requireAuth);
router.use(loadAccountContext);
router.use(requireAccountContext);

router.get('/summary', canViewSensitiveData, getBillingSummary);
router.post('/portal', canViewSensitiveData, createBillingPortal);

export const billingRoutes = router;























