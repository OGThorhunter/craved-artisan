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

// GET /api/settings/integrations/stripe-connect
export const getStripeConnectStatus = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;

    // Get vendor profile for Stripe Connect
    const vendorProfile = await prisma.vendorProfile.findFirst({
      where: {
        userId: req.user!.userId
      }
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    let stripeAccountStatus = {
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      requirements: [],
      accountId: vendorProfile.stripeAccountId
    };

    if (vendorProfile.stripeAccountId) {
      try {
        const stripeAccount = await stripe.accounts.retrieve(vendorProfile.stripeAccountId);
        stripeAccountStatus = {
          chargesEnabled: stripeAccount.charges_enabled || false,
          payoutsEnabled: stripeAccount.payouts_enabled || false,
          detailsSubmitted: stripeAccount.details_submitted || false,
          requirements: stripeAccount.requirements?.currently_due || [],
          accountId: vendorProfile.stripeAccountId
        };
      } catch (error) {
        logger.error({ error }, 'Error retrieving Stripe account');
      }
    }

    res.json({
      success: true,
      data: stripeAccountStatus
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error fetching Stripe Connect status');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// POST /api/settings/integrations/stripe-connect/onboard-link
export const createStripeOnboardLink = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;

    // Get vendor profile
    const vendorProfile = await prisma.vendorProfile.findFirst({
      where: {
        userId: req.user!.userId
      }
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    let stripeAccountId = vendorProfile.stripeAccountId;

    // Create Stripe account if it doesn't exist
    if (!stripeAccountId) {
      const stripeAccount = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: req.user!.email,
        metadata: {
          vendorProfileId: vendorProfile.id,
          accountId: accountId
        }
      });

      stripeAccountId = stripeAccount.id;

      // Update vendor profile with Stripe account ID
      await prisma.vendorProfile.update({
        where: { id: vendorProfile.id },
        data: { stripeAccountId }
      });
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.CLIENT_URL}/settings/integrations?refresh=true`,
      return_url: `${process.env.CLIENT_URL}/settings/integrations?success=true`,
      type: 'account_onboarding'
    });

    res.json({
      success: true,
      data: {
        url: accountLink.url
      }
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error creating Stripe onboard link');
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

router.get('/stripe-connect', canViewSensitiveData, getStripeConnectStatus);
router.post('/stripe-connect/onboard-link', canViewSensitiveData, createStripeOnboardLink);

export const integrationsRoutes = router;


























