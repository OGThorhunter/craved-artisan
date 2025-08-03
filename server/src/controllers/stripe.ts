import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { stripeService } from '../utils/stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2024-12-18.acacia' 
});

/**
 * Create Stripe Connect onboarding for vendor
 * Creates a new Stripe Connect Standard account and generates onboarding link
 */
export const createStripeOnboarding = async (req: any, res: any) => {
  try {
    const { vendorProfileId, email, businessName } = req.body;

    // Validate required fields
    if (!vendorProfileId || !email || !businessName) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'vendorProfileId, email, and businessName are required'
      });
    }

    // Verify vendor profile belongs to authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId },
      include: { user: true },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Vendor profile does not exist'
      });
    }

    if (vendorProfile.userId !== req.session.userId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only create Connect accounts for your own vendor profile'
      });
    }

    // Check if account already exists
    if (vendorProfile.stripeAccountId) {
      return res.status(400).json({
        error: 'Account already exists',
        message: 'Stripe Connect account already exists for this vendor'
      });
    }

    // Create Stripe Connect Standard account
    const account = await stripe.accounts.create({ 
      type: "standard",
      country: 'US',
      email,
      business_type: 'individual',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: businessName,
        url: `${process.env.CLIENT_URL}/vendor/${vendorProfileId}`,
      },
    });

    // Generate onboarding link
    const link = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.CLIENT_URL}/vendor/onboarding/refresh`,
      return_url: `${process.env.CLIENT_URL}/vendor/onboarding/complete`,
      type: "account_onboarding"
    });

    // Save account.id to vendor profile in DB
    await prisma.vendorProfile.update({ 
      where: { id: vendorProfileId }, 
      data: { 
        stripeAccountId: account.id,
        stripeAccountStatus: account.charges_enabled ? 'active' : 'pending',
        stripeOnboardingUrl: link.url
      } 
    });

    res.json({ 
      url: link.url,
      accountId: account.id,
      status: account.charges_enabled ? 'active' : 'pending',
      message: 'Stripe Connect account created successfully'
    });

  } catch (error) {
    console.error('Error creating Stripe onboarding:', error);
    res.status(500).json({
      error: 'Onboarding creation failed',
      message: 'Unable to create Stripe Connect onboarding'
    });
  }
};

/**
 * Get vendor onboarding status
 */
export const getOnboardingStatus = async (req: any, res: any) => {
  try {
    const { vendorProfileId } = req.params;

    // Verify vendor profile belongs to authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId },
      include: { user: true },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Vendor profile does not exist'
      });
    }

    if (vendorProfile.userId !== req.session.userId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only access onboarding status for your own vendor profile'
      });
    }

    if (!vendorProfile.stripeAccountId) {
      return res.json({
        hasAccount: false,
        status: 'not_created',
        message: 'No Stripe Connect account found'
      });
    }

    // Get account status from Stripe
    const account = await stripe.accounts.retrieve(vendorProfile.stripeAccountId);

    res.json({
      hasAccount: true,
      accountId: account.id,
      status: account.charges_enabled ? 'active' : 'pending',
      requirements: account.requirements,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      onboardingUrl: vendorProfile.stripeOnboardingUrl
    });

  } catch (error) {
    console.error('Error getting onboarding status:', error);
    res.status(500).json({
      error: 'Status retrieval failed',
      message: 'Unable to get onboarding status'
    });
  }
};

/**
 * Refresh onboarding link
 */
export const refreshOnboardingLink = async (req: any, res: any) => {
  try {
    const { vendorProfileId } = req.params;

    // Verify vendor profile belongs to authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId },
      include: { user: true },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Vendor profile does not exist'
      });
    }

    if (vendorProfile.userId !== req.session.userId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only refresh onboarding for your own vendor profile'
      });
    }

    if (!vendorProfile.stripeAccountId) {
      return res.status(400).json({
        error: 'No Stripe account',
        message: 'Please create a Stripe Connect account first'
      });
    }

    // Generate new onboarding link
    const link = await stripe.accountLinks.create({
      account: vendorProfile.stripeAccountId,
      refresh_url: `${process.env.CLIENT_URL}/vendor/onboarding/refresh`,
      return_url: `${process.env.CLIENT_URL}/vendor/onboarding/complete`,
      type: "account_onboarding"
    });

    // Update vendor profile with new onboarding URL
    await prisma.vendorProfile.update({
      where: { id: vendorProfileId },
      data: {
        stripeOnboardingUrl: link.url,
      },
    });

    res.json({
      url: link.url,
      message: 'Onboarding link refreshed successfully'
    });

  } catch (error) {
    console.error('Error refreshing onboarding link:', error);
    res.status(500).json({
      error: 'Link refresh failed',
      message: 'Unable to refresh onboarding link'
    });
  }
};

/**
 * Complete onboarding process
 */
export const completeOnboarding = async (req: any, res: any) => {
  try {
    const { vendorProfileId } = req.params;

    // Verify vendor profile belongs to authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId },
      include: { user: true },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Vendor profile does not exist'
      });
    }

    if (vendorProfile.userId !== req.session.userId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only complete onboarding for your own vendor profile'
      });
    }

    if (!vendorProfile.stripeAccountId) {
      return res.status(400).json({
        error: 'No Stripe account',
        message: 'Please create a Stripe Connect account first'
      });
    }

    // Get updated account status from Stripe
    const account = await stripe.accounts.retrieve(vendorProfile.stripeAccountId);

    // Update vendor profile with current status
    await prisma.vendorProfile.update({
      where: { id: vendorProfileId },
      data: {
        stripeAccountStatus: account.charges_enabled ? 'active' : 'pending',
      },
    });

    res.json({
      accountId: account.id,
      status: account.charges_enabled ? 'active' : 'pending',
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements,
      message: account.charges_enabled 
        ? 'Onboarding completed successfully!' 
        : 'Onboarding in progress. Please complete all requirements.'
    });

  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({
      error: 'Onboarding completion failed',
      message: 'Unable to complete onboarding process'
    });
  }
};

/**
 * Get commission rate and calculation info
 */
export const getCommissionInfo = async (req: any, res: any) => {
  try {
    const commissionRate = stripeService.getCommissionRate();
    
    res.json({
      commissionRate,
      description: '2% commission on all transactions',
      calculation: 'Commission = Total Amount × 0.02',
      vendorPayout: 'Vendor receives 98% of transaction amount'
    });

  } catch (error) {
    console.error('Error getting commission info:', error);
    res.status(500).json({
      error: 'Commission info retrieval failed',
      message: 'Unable to get commission information'
    });
  }
};

/**
 * Calculate commission for a given amount
 */
export const calculateCommission = async (req: any, res: any) => {
  try {
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be a positive number'
      });
    }

    const commission = stripeService.calculateCommission(amount);
    const vendorPayout = stripeService.calculateVendorPayout(amount);

    res.json({
      originalAmount: amount,
      commissionAmount: commission,
      vendorPayoutAmount: vendorPayout,
      commissionRate: stripeService.getCommissionRate(),
      breakdown: {
        total: amount,
        commission: commission,
        vendorPayout: vendorPayout
      }
    });

  } catch (error) {
    console.error('Error calculating commission:', error);
    res.status(500).json({
      error: 'Commission calculation failed',
      message: 'Unable to calculate commission'
    });
  }
}; 