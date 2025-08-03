import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { stripeService } from '../utils/stripe';
import Stripe from 'stripe';

const router = express.Router();

// Validation schemas
const createPaymentIntentSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('usd'),
});

const createConnectAccountSchema = z.object({
  vendorProfileId: z.string().uuid(),
  email: z.string().email(),
  businessName: z.string().min(1),
});

// POST /api/stripe/create-payment-intent - Create payment intent for order
router.post('/create-payment-intent', requireAuth, requireRole(['CUSTOMER']), async (req, res) => {
  try {
    const validationResult = createPaymentIntentSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.errors
      });
    }

    const { orderId, amount, currency } = validationResult.data;

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        orderItems: {
          include: {
            product: {
              include: {
                vendorProfile: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order does not exist'
      });
    }

    if (order.userId !== req.session.userId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only create payment intents for your own orders'
      });
    }

    // Verify all vendors are connected to Stripe
    const vendorsNotConnected = order.orderItems.filter(item => 
      !item.product.vendorProfile.stripeAccountId
    );

    if (vendorsNotConnected.length > 0) {
      return res.status(400).json({
        error: 'Vendors not connected',
        message: 'Some vendors are not connected to Stripe. Please contact support.',
        vendors: vendorsNotConnected.map(item => ({
          productId: item.product.id,
          vendorId: item.product.vendorProfile.id,
          vendorName: item.product.vendorProfile.storeName,
        }))
      });
    }

    // Create payment intent
    const paymentIntent = await stripeService.createPaymentIntent({
      amount,
      currency,
      orderId,
      customerEmail: order.user.email,
      metadata: {
        orderNumber: order.orderNumber,
        customerId: order.userId,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      error: 'Payment intent creation failed',
      message: 'Unable to create payment intent'
    });
  }
});

// POST /api/stripe/create-connect-account - Create Stripe Connect account for vendor
router.post('/create-connect-account', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const validationResult = createConnectAccountSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.errors
      });
    }

    const { vendorProfileId, email, businessName } = validationResult.data;

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

    // Create Stripe Connect account
    const account = await stripeService.createConnectAccount(
      vendorProfileId,
      email,
      businessName
    );

    res.json({
      accountId: account.id,
      status: account.charges_enabled ? 'active' : 'pending',
      message: 'Stripe Connect account created successfully'
    });
  } catch (error) {
    console.error('Error creating Connect account:', error);
    res.status(500).json({
      error: 'Connect account creation failed',
      message: 'Unable to create Stripe Connect account'
    });
  }
});

// GET /api/stripe/onboarding-url/:vendorProfileId - Get onboarding URL for vendor
router.get('/onboarding-url/:vendorProfileId', requireAuth, requireRole(['VENDOR']), async (req, res) => {
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
        message: 'You can only access onboarding for your own vendor profile'
      });
    }

    if (!vendorProfile.stripeAccountId) {
      return res.status(400).json({
        error: 'No Stripe account',
        message: 'Please create a Stripe Connect account first'
      });
    }

    // Generate onboarding URL
    const onboardingUrl = await stripeService.createOnboardingUrl(vendorProfileId);

    res.json({
      onboardingUrl,
      accountStatus: vendorProfile.stripeAccountStatus,
    });
  } catch (error) {
    console.error('Error generating onboarding URL:', error);
    res.status(500).json({
      error: 'Onboarding URL generation failed',
      message: 'Unable to generate onboarding URL'
    });
  }
});

// GET /api/stripe/account-status/:vendorProfileId - Get vendor's Stripe account status
router.get('/account-status/:vendorProfileId', requireAuth, requireRole(['VENDOR']), async (req, res) => {
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
        message: 'You can only access account status for your own vendor profile'
      });
    }

    // Get account status
    const accountStatus = await stripeService.getVendorAccountStatus(vendorProfileId);

    res.json(accountStatus);
  } catch (error) {
    console.error('Error getting account status:', error);
    res.status(500).json({
      error: 'Account status retrieval failed',
      message: 'Unable to retrieve account status'
    });
  }
});

// POST /api/stripe/webhook - Handle Stripe webhook events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    event = Stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    await stripeService.handleWebhook(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handling failed:', error);
    res.status(500).json({ error: 'Webhook handling failed' });
  }
});

// GET /api/stripe/commission-rate - Get current commission rate
router.get('/commission-rate', async (req, res) => {
  try {
    const commissionRate = stripeService.getCommissionRate();
    res.json({
      commissionRate,
      percentage: (commissionRate * 100).toFixed(1) + '%',
    });
  } catch (error) {
    console.error('Error getting commission rate:', error);
    res.status(500).json({
      error: 'Commission rate retrieval failed',
      message: 'Unable to retrieve commission rate'
    });
  }
});

// POST /api/stripe/calculate-commission - Calculate commission for an amount
router.post('/calculate-commission', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be a positive number'
      });
    }

    const commissionAmount = stripeService.calculateCommission(amount);
    const vendorPayoutAmount = stripeService.calculateVendorPayout(amount);

    res.json({
      originalAmount: amount,
      commissionAmount,
      vendorPayoutAmount,
      commissionRate: stripeService.getCommissionRate(),
      commissionPercentage: (stripeService.getCommissionRate() * 100).toFixed(1) + '%',
    });
  } catch (error) {
    console.error('Error calculating commission:', error);
    res.status(500).json({
      error: 'Commission calculation failed',
      message: 'Unable to calculate commission'
    });
  }
});

export default router; 