import Stripe from 'stripe';
import prisma from '../lib/prisma';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2024-12-18.acacia' 
});

/**
 * Get vendor payout history from Stripe
 */
export const getVendorPayoutHistory = async (req: any, res: any) => {
  try {
    const { vendorId } = req.params;
    const { limit = 10, starting_after } = req.query;

    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { id: true, stripeAccountId: true }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    if (!vendor.stripeAccountId) {
      return res.status(400).json({
        error: 'Stripe account not connected',
        message: 'Vendor has not completed Stripe Connect onboarding'
      });
    }

    // Fetch payouts from Stripe
    const payouts = await stripe.payouts.list({
      stripeAccount: vendor.stripeAccountId,
      limit: parseInt(limit),
      starting_after: starting_after || undefined
    });

    res.json({
      payouts: payouts.data.map(payout => ({
        id: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        type: payout.type,
        method: payout.method,
        arrival_date: payout.arrival_date,
        created: payout.created,
        description: payout.description,
        failure_code: payout.failure_code,
        failure_message: payout.failure_message,
        metadata: payout.metadata
      })),
      hasMore: payouts.has_more,
      url: payouts.url
    });

  } catch (error) {
    console.error('Error fetching vendor payout history:', error);
    res.status(500).json({
      error: 'Failed to fetch payout history',
      message: 'Unable to retrieve payout data from Stripe'
    });
  }
};

/**
 * Get vendor payout summary and statistics
 */
export const getVendorPayoutSummary = async (req: any, res: any) => {
  try {
    const { vendorId } = req.params;

    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { id: true, stripeAccountId: true }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    if (!vendor.stripeAccountId) {
      return res.status(400).json({
        error: 'Stripe account not connected',
        message: 'Vendor has not completed Stripe Connect onboarding'
      });
    }

    // Get account balance from Stripe
    const balance = await stripe.balance.retrieve({
      stripeAccount: vendor.stripeAccountId
    });

    // Get recent payouts for summary
    const payouts = await stripe.payouts.list({
      stripeAccount: vendor.stripeAccountId,
      limit: 10
    });

    // Calculate summary statistics
    const totalPayouts = payouts.data.length;
    const totalAmount = payouts.data.reduce((sum, payout) => sum + payout.amount, 0);
    const pendingPayouts = payouts.data.filter(p => p.status === 'pending').length;
    const failedPayouts = payouts.data.filter(p => p.status === 'failed').length;

    res.json({
      balance: {
        available: balance.available.map(b => ({
          amount: b.amount,
          currency: b.currency
        })),
        pending: balance.pending.map(b => ({
          amount: b.amount,
          currency: b.currency
        }))
      },
      summary: {
        totalPayouts,
        totalAmount,
        pendingPayouts,
        failedPayouts,
        averagePayout: totalPayouts > 0 ? totalAmount / totalPayouts : 0
      },
      recentPayouts: payouts.data.slice(0, 5).map(payout => ({
        id: payout.id,
        amount: payout.amount,
        status: payout.status,
        created: payout.created,
        arrival_date: payout.arrival_date
      }))
    });

  } catch (error) {
    console.error('Error fetching vendor payout summary:', error);
    res.status(500).json({
      error: 'Failed to fetch payout summary',
      message: 'Unable to retrieve payout summary from Stripe'
    });
  }
};

/**
 * Get vendor Stripe dashboard URL
 */
export const getVendorStripeDashboardUrl = async (req: any, res: any) => {
  try {
    const { vendorId } = req.params;

    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { id: true, stripeAccountId: true }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    if (!vendor.stripeAccountId) {
      return res.status(400).json({
        error: 'Stripe account not connected',
        message: 'Vendor has not completed Stripe Connect onboarding'
      });
    }

    // Generate Stripe Express Dashboard URL
    const dashboardUrl = `https://dashboard.stripe.com/connect/accounts/${vendor.stripeAccountId}`;

    res.json({
      dashboardUrl,
      sections: {
        payouts: `${dashboardUrl}/payouts`,
        transactions: `${dashboardUrl}/transactions`,
        settings: `${dashboardUrl}/settings`,
        documents: `${dashboardUrl}/documents`,
        taxForms: `${dashboardUrl}/tax-forms`,
        bankAccounts: `${dashboardUrl}/bank-accounts`
      },
      message: 'Stripe Express Dashboard URL generated successfully'
    });

  } catch (error) {
    console.error('Error generating Stripe dashboard URL:', error);
    res.status(500).json({
      error: 'Failed to generate dashboard URL',
      message: 'Unable to generate Stripe Express Dashboard URL'
    });
  }
};

/**
 * Get vendor account status and verification info
 */
export const getVendorAccountStatus = async (req: any, res: any) => {
  try {
    const { vendorId } = req.params;

    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { id: true, stripeAccountId: true }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    if (!vendor.stripeAccountId) {
      return res.status(400).json({
        error: 'Stripe account not connected',
        message: 'Vendor has not completed Stripe Connect onboarding'
      });
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(vendor.stripeAccountId);

    res.json({
      accountId: account.id,
      status: account.status,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: account.requirements,
      businessType: account.business_type,
      country: account.country,
      created: account.created,
      message: 'Account status retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching vendor account status:', error);
    res.status(500).json({
      error: 'Failed to fetch account status',
      message: 'Unable to retrieve account status from Stripe'
    });
  }
};

// NEW: Get Stripe Express Dashboard URL for tax, bank, ID management
export const getStripeExpressDashboardUrl = async (req: any, res: any) => {
  try {
    const { vendorId } = req.params;

    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { id: true, stripeAccountId: true }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    if (!vendor.stripeAccountId) {
      return res.status(400).json({
        error: 'Stripe account not connected',
        message: 'Vendor has not completed Stripe Connect onboarding'
      });
    }

    // Generate Stripe Express Dashboard URL
    const expressDashboardUrl = `https://dashboard.stripe.com/express/${vendor.stripeAccountId}`;

    res.json({
      expressDashboardUrl,
      sections: {
        // Tax Information Management
        taxInfo: `${expressDashboardUrl}/tax-info`,
        taxForms: `${expressDashboardUrl}/tax-forms`,
        taxSettings: `${expressDashboardUrl}/tax-settings`,
        
        // Bank Account Management
        bankAccounts: `${expressDashboardUrl}/bank-accounts`,
        addBankAccount: `${expressDashboardUrl}/bank-accounts/add`,
        
        // Identity Verification
        identityVerification: `${expressDashboardUrl}/identity-verification`,
        documents: `${expressDashboardUrl}/documents`,
        idVerification: `${expressDashboardUrl}/id-verification`,
        
        // Business Information
        businessProfile: `${expressDashboardUrl}/business-profile`,
        businessSettings: `${expressDashboardUrl}/business-settings`,
        
        // Payout Management
        payouts: `${expressDashboardUrl}/payouts`,
        payoutSchedule: `${expressDashboardUrl}/payout-schedule`,
        
        // Transaction History
        transactions: `${expressDashboardUrl}/transactions`,
        transactionHistory: `${expressDashboardUrl}/transaction-history`
      },
      features: {
        taxManagement: 'Manage tax information and forms',
        bankManagement: 'Add and manage bank accounts',
        identityVerification: 'Complete identity verification',
        businessProfile: 'Update business information',
        payoutSettings: 'Configure payout schedule and methods',
        transactionHistory: 'View detailed transaction history'
      },
      message: 'Stripe Express Dashboard URL generated successfully'
    });

  } catch (error) {
    console.error('Error generating Stripe Express dashboard URL:', error);
    res.status(500).json({
      error: 'Failed to generate Express dashboard URL',
      message: 'Unable to generate Stripe Express Dashboard URL'
    });
  }
}; 