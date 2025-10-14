import { Router, Request, Response } from 'express';
import { prisma } from '../../db';
import { logger } from '../../logger';
import Stripe from 'stripe';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

// Webhook endpoint for Stripe events
export const handleStripeWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      logger.error({ err }, 'Webhook signature verification failed');
      return res.status(400).send(`Webhook Error: ${err}`);
    }

    logger.info({ eventType: event.type }, 'Processing Stripe webhook');

    // Handle the event
    switch (event.type) {
      case 'customer.created':
      case 'customer.updated':
        await handleCustomerEvent(event.data.object as Stripe.Customer);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionEvent(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.created':
      case 'invoice.updated':
      case 'invoice.paid':
      case 'invoice.payment_failed':
      case 'invoice.voided':
        await handleInvoiceEvent(event.data.object as Stripe.Invoice);
        break;

      default:
        logger.info({ eventType: event.type }, 'Unhandled event type');
    }

    res.json({ received: true });

  } catch (error) {
    logger.error({ error }, 'Error processing Stripe webhook');
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Handle customer events
async function handleCustomerEvent(customer: Stripe.Customer) {
  try {
    const accountId = customer.metadata?.accountId;
    
    if (!accountId) {
      logger.warn({ customerId: customer.id }, 'Customer missing accountId metadata');
      return;
    }

    // Upsert billing profile
    await prisma.billingProfile.upsert({
      where: { accountId },
      update: {
        stripeCustomerId: customer.id,
        currency: customer.currency || 'USD'
      },
      create: {
        accountId,
        stripeCustomerId: customer.id,
        currency: customer.currency || 'USD'
      }
    });

    logger.info({ customerId: customer.id, accountId }, 'Updated billing profile');

  } catch (error) {
    logger.error({ error, customerId: customer.id }, 'Error handling customer event');
  }
}

// Handle subscription events
async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    
    // Find account by Stripe customer ID
    const billingProfile = await prisma.billingProfile.findUnique({
      where: { stripeCustomerId: customerId }
    });

    if (!billingProfile) {
      logger.warn({ customerId, subscriptionId: subscription.id }, 'No billing profile found for customer');
      return;
    }

    const subscriptionData = {
      accountId: billingProfile.accountId,
      stripeSubId: subscription.id,
      status: mapSubscriptionStatus(subscription.status),
      planName: subscription.items.data[0]?.price?.nickname || 'Unknown Plan',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    };

    // Upsert subscription
    await prisma.subscription.upsert({
      where: { stripeSubId: subscription.id },
      update: subscriptionData,
      create: subscriptionData
    });

    logger.info({ subscriptionId: subscription.id, accountId: billingProfile.accountId }, 'Updated subscription');

  } catch (error) {
    logger.error({ error, subscriptionId: subscription.id }, 'Error handling subscription event');
  }
}

// Handle invoice events
async function handleInvoiceEvent(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;
    
    // Find account by Stripe customer ID
    const billingProfile = await prisma.billingProfile.findUnique({
      where: { stripeCustomerId: customerId }
    });

    if (!billingProfile) {
      logger.warn({ customerId, invoiceId: invoice.id }, 'No billing profile found for customer');
      return;
    }

    const invoiceData = {
      accountId: billingProfile.accountId,
      stripeInvoiceId: invoice.id,
      amountDueCents: invoice.amount_due,
      amountPaidCents: invoice.amount_paid,
      status: mapInvoiceStatus(invoice.status),
      hostedUrl: invoice.hosted_invoice_url
    };

    // Upsert invoice
    await prisma.invoice.upsert({
      where: { stripeInvoiceId: invoice.id },
      update: invoiceData,
      create: invoiceData
    });

    logger.info({ invoiceId: invoice.id, accountId: billingProfile.accountId }, 'Updated invoice');

  } catch (error) {
    logger.error({ error, invoiceId: invoice.id }, 'Error handling invoice event');
  }
}

// Map Stripe subscription status to our enum
function mapSubscriptionStatus(status: string | null): 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' | 'INCOMPLETE' {
  switch (status) {
    case 'active':
      return 'ACTIVE';
    case 'past_due':
      return 'PAST_DUE';
    case 'canceled':
      return 'CANCELED';
    case 'trialing':
      return 'TRIALING';
    case 'incomplete':
      return 'INCOMPLETE';
    default:
      return 'INCOMPLETE';
  }
}

// Map Stripe invoice status to our enum
function mapInvoiceStatus(status: string | null): 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE' {
  switch (status) {
    case 'draft':
      return 'DRAFT';
    case 'open':
      return 'OPEN';
    case 'paid':
      return 'PAID';
    case 'void':
      return 'VOID';
    case 'uncollectible':
      return 'UNCOLLECTIBLE';
    default:
      return 'DRAFT';
  }
}

router.post('/', handleStripeWebhook);

export default router;





















