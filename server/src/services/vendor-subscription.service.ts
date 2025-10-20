import Stripe from 'stripe';
import { VendorSubscriptionStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { logger } from '../logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const VENDOR_PRICE_ID = process.env.STRIPE_VENDOR_SUBSCRIPTION_PRICE_ID!;
const TRIAL_DAYS = 14;

export async function createVendorSubscription(vendorProfileId: string, email: string) {
  try {
    logger.info({ vendorProfileId, email }, 'Creating vendor subscription');

    // Check if subscription already exists
    const existingVendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId },
      select: { stripeSubscriptionId: true, stripeCustomerId: true },
    });

    if (existingVendor?.stripeSubscriptionId) {
      logger.warn({ vendorProfileId }, 'Vendor already has a subscription');
      throw new Error('Vendor already has an active subscription');
    }

    // Create or retrieve Stripe Customer
    let customer: Stripe.Customer;
    if (existingVendor?.stripeCustomerId) {
      customer = await stripe.customers.retrieve(existingVendor.stripeCustomerId) as Stripe.Customer;
      logger.info({ customerId: customer.id }, 'Using existing Stripe customer');
    } else {
      customer = await stripe.customers.create({
        email,
        metadata: { vendorProfileId },
      });
      logger.info({ customerId: customer.id }, 'Created new Stripe customer');
    }

    // Create subscription with trial
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: VENDOR_PRICE_ID }],
      trial_period_days: TRIAL_DAYS,
      payment_settings: { 
        save_default_payment_method: 'on_subscription',
      },
      metadata: {
        vendorProfileId,
      },
    });

    logger.info({ 
      subscriptionId: subscription.id, 
      trialEnd: subscription.trial_end 
    }, 'Subscription created');

    // Update vendor profile
    await prisma.vendorProfile.update({
      where: { id: vendorProfileId },
      data: {
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: VendorSubscriptionStatus.TRIALING,
        subscriptionPriceId: VENDOR_PRICE_ID,
        subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      },
    });

    logger.info({ vendorProfileId }, 'Vendor profile updated with subscription info');

    return { 
      customer, 
      subscription,
      trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    };
  } catch (error) {
    logger.error({ error, vendorProfileId }, 'Failed to create vendor subscription');
    throw error;
  }
}

export async function checkSubscriptionStatus(vendorProfileId: string) {
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId },
      select: { 
        subscriptionStatus: true, 
        trialEndsAt: true,
        subscriptionCurrentPeriodEnd: true,
        stripeSubscriptionId: true,
      },
    });

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const now = new Date();
    const isInTrial = vendor.trialEndsAt && vendor.trialEndsAt > now;
    const isActive = vendor.subscriptionStatus === VendorSubscriptionStatus.ACTIVE;

    return { 
      hasAccess: isInTrial || isActive,
      status: vendor.subscriptionStatus,
      isInTrial,
      trialEndsAt: vendor.trialEndsAt,
      currentPeriodEnd: vendor.subscriptionCurrentPeriodEnd,
      subscriptionId: vendor.stripeSubscriptionId,
    };
  } catch (error) {
    logger.error({ error, vendorProfileId }, 'Failed to check subscription status');
    throw error;
  }
}

export async function cancelVendorSubscription(vendorProfileId: string) {
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId },
      select: { stripeSubscriptionId: true },
    });

    if (!vendor?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    // Cancel at period end (allows vendor to use until paid period expires)
    const subscription = await stripe.subscriptions.update(
      vendor.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    logger.info({ vendorProfileId, subscriptionId: subscription.id }, 'Subscription set to cancel');

    return subscription;
  } catch (error) {
    logger.error({ error, vendorProfileId }, 'Failed to cancel subscription');
    throw error;
  }
}

export async function reactivateVendorSubscription(vendorProfileId: string) {
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId },
      select: { stripeSubscriptionId: true },
    });

    if (!vendor?.stripeSubscriptionId) {
      throw new Error('No subscription found');
    }

    // Remove cancellation
    const subscription = await stripe.subscriptions.update(
      vendor.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    logger.info({ vendorProfileId, subscriptionId: subscription.id }, 'Subscription reactivated');

    return subscription;
  } catch (error) {
    logger.error({ error, vendorProfileId }, 'Failed to reactivate subscription');
    throw error;
  }
}

