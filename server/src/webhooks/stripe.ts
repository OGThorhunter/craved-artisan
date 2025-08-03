import express from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2024-12-18.acacia' 
});

// Commission rate (2%)
const COMMISSION_RATE = 0.02;

/**
 * Handle Stripe webhook events
 * Processes payment success, transfer completion, and other events
 */
export const handleStripeWebhook = async (req: express.Request, res: express.Response) => {
  const sig = req.headers['stripe-signature'];

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`Received webhook event: ${event.type}`);

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer);
        break;

      case 'transfer.paid':
        await handleTransferPaid(event.data.object as Stripe.Transfer);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Handle checkout session completion
 * Updates order status, processes vendor transfers, sends notifications
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`Processing checkout session completion: ${session.id}`);

  try {
    // Extract order information from session metadata
    const orderId = session.metadata?.orderId;
    const orderNumber = session.metadata?.orderNumber;
    const customerId = session.metadata?.customerId;
    const isMultiVendor = session.metadata?.multiVendor === 'true';

    if (!orderId) {
      console.error('No order ID found in session metadata');
      return;
    }

    // Get the order from database
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
      console.error(`Order not found: ${orderId}`);
      return;
    }

    // Update order status to 'paid'
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'paid',
        paidAt: new Date(),
        stripePaymentIntentId: session.payment_intent as string,
      },
    });

    console.log(`Order ${orderId} marked as paid`);

    // Handle single vendor vs multi-vendor orders
    if (isMultiVendor) {
      await handleMultiVendorOrderCompletion(order, session);
    } else {
      await handleSingleVendorOrderCompletion(order, session);
    }

    // Send customer confirmation email
    await sendCustomerConfirmationEmail(order, session);

    // Send vendor notification emails
    await sendVendorNotifications(order, session);

    console.log(`Successfully processed checkout session: ${session.id}`);

  } catch (error) {
    console.error('Error handling checkout session completion:', error);
    throw error;
  }
}

/**
 * Handle single vendor order completion
 * Transfer is already handled by Stripe via transfer_data
 */
async function handleSingleVendorOrderCompletion(order: any, session: Stripe.Checkout.Session) {
  console.log(`Processing single vendor order: ${order.id}`);

  const vendorProfile = order.orderItems[0].product.vendorProfile;
  const totalAmount = session.amount_total || 0;
  const commissionAmount = Math.round(totalAmount * COMMISSION_RATE);
  const vendorPayoutAmount = totalAmount - commissionAmount;

  // Update order with transfer information
  await prisma.order.update({
    where: { id: order.id },
    data: {
      commissionAmount,
      vendorPayoutAmount,
      stripeTransferId: session.payment_intent as string, // Single transfer
    },
  });

  console.log(`Single vendor transfer completed for order ${order.id}`);
}

/**
 * Handle multi-vendor order completion
 * Process manual transfers to each vendor
 */
async function handleMultiVendorOrderCompletion(order: any, session: Stripe.Checkout.Session) {
  console.log(`Processing multi-vendor order: ${order.id}`);

  // Get payment intent to access the charge
  const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
  
  if (!paymentIntent.latest_charge) {
    console.error('No charge found for payment intent');
    return;
  }

  // Group order items by vendor
  const vendorGroups = order.orderItems.reduce((groups: any, item: any) => {
    const vendorId = item.product.vendorProfile.id;
    if (!groups[vendorId]) {
      groups[vendorId] = {
        vendor: item.product.vendorProfile,
        items: [],
        totalAmount: 0,
      };
    }
    groups[vendorId].items.push(item);
    groups[vendorId].totalAmount += item.price * item.quantity;
    return groups;
  }, {});

  // Process transfers for each vendor
  const transfers = [];
  for (const [vendorId, group] of Object.entries(vendorGroups)) {
    const vendorAmount = (group as any).totalAmount;
    const commissionAmount = Math.round(vendorAmount * COMMISSION_RATE);
    const vendorPayoutAmount = vendorAmount - commissionAmount;

    try {
      const transfer = await stripe.transfers.create({
        amount: vendorPayoutAmount,
        currency: 'usd',
        destination: (group as any).vendor.stripeAccountId,
        source_transaction: paymentIntent.latest_charge as string,
        metadata: {
          orderId: order.id,
          vendorId: vendorId,
          commissionAmount: commissionAmount.toString(),
          vendorPayoutAmount: vendorPayoutAmount.toString(),
        },
      });

      transfers.push({
        vendorId,
        vendorName: (group as any).vendor.storeName,
        amount: vendorAmount,
        commissionAmount,
        vendorPayoutAmount,
        transferId: transfer.id,
      });

      console.log(`Transfer created for vendor ${vendorId}: ${transfer.id}`);

    } catch (error) {
      console.error(`Failed to create transfer for vendor ${vendorId}:`, error);
    }
  }

  // Update order with transfer information
  await prisma.order.update({
    where: { id: order.id },
    data: {
      stripeTransferId: transfers.map(t => t.transferId).join(','),
      vendorPayoutAmount: transfers.reduce((sum, t) => sum + t.vendorPayoutAmount, 0),
    },
  });

  console.log(`Multi-vendor transfers completed for order ${order.id}`);
}

/**
 * Handle payment intent success
 * Additional processing for successful payments
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment intent succeeded: ${paymentIntent.id}`);

  try {
    // Find order by payment intent ID
    const order = await prisma.order.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
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
      console.log(`No order found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update order with payment details
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'paid',
        paidAt: new Date(),
      },
    });

    console.log(`Order ${order.id} payment confirmed`);

  } catch (error) {
    console.error('Error handling payment intent success:', error);
  }
}

/**
 * Handle transfer creation
 * Log transfer creation for tracking
 */
async function handleTransferCreated(transfer: Stripe.Transfer) {
  console.log(`Transfer created: ${transfer.id}`);

  try {
    const orderId = transfer.metadata?.orderId;
    const vendorId = transfer.metadata?.vendorId;

    if (orderId && vendorId) {
      console.log(`Transfer ${transfer.id} created for order ${orderId}, vendor ${vendorId}`);
      
      // You could update order status or send notifications here
      // await updateOrderTransferStatus(orderId, transfer.id);
    }

  } catch (error) {
    console.error('Error handling transfer creation:', error);
  }
}

/**
 * Handle transfer paid
 * Transfer has been successfully paid to vendor
 */
async function handleTransferPaid(transfer: Stripe.Transfer) {
  console.log(`Transfer paid: ${transfer.id}`);

  try {
    const orderId = transfer.metadata?.orderId;
    const vendorId = transfer.metadata?.vendorId;

    if (orderId && vendorId) {
      console.log(`Transfer ${transfer.id} paid to vendor ${vendorId} for order ${orderId}`);
      
      // Send vendor payout confirmation
      await sendVendorPayoutConfirmation(vendorId, transfer);
    }

  } catch (error) {
    console.error('Error handling transfer paid:', error);
  }
}

/**
 * Handle account updates
 * Vendor account status changes
 */
async function handleAccountUpdated(account: Stripe.Account) {
  console.log(`Account updated: ${account.id}`);

  try {
    // Find vendor profile by Stripe account ID
    const vendorProfile = await prisma.vendorProfile.findFirst({
      where: { stripeAccountId: account.id },
    });

    if (vendorProfile) {
      // Update vendor account status
      await prisma.vendorProfile.update({
        where: { id: vendorProfile.id },
        data: {
          stripeAccountStatus: account.charges_enabled ? 'active' : 'pending',
        },
      });

      console.log(`Vendor profile ${vendorProfile.id} status updated`);
    }

  } catch (error) {
    console.error('Error handling account update:', error);
  }
}

/**
 * Send customer confirmation email
 */
async function sendCustomerConfirmationEmail(order: any, session: Stripe.Checkout.Session) {
  try {
    // This would integrate with your email service (SendGrid, AWS SES, etc.)
    console.log(`Sending confirmation email to customer: ${order.user.email}`);
    
    // Example email content
    const emailData = {
      to: order.user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      template: 'order-confirmation',
      data: {
        orderNumber: order.orderNumber,
        totalAmount: (session.amount_total || 0) / 100,
        orderItems: order.orderItems,
        commissionAmount: Math.round((session.amount_total || 0) * COMMISSION_RATE) / 100,
      },
    };

    // await emailService.sendEmail(emailData);
    console.log('Customer confirmation email queued');

  } catch (error) {
    console.error('Error sending customer confirmation email:', error);
  }
}

/**
 * Send vendor notification emails
 */
async function sendVendorNotifications(order: any, session: Stripe.Checkout.Session) {
  try {
    // Get unique vendors from order
    const vendors = [...new Set(order.orderItems.map((item: any) => item.product.vendorProfile))];

    for (const vendor of vendors) {
      console.log(`Sending notification to vendor: ${vendor.storeName}`);
      
      // Calculate vendor's portion of the order
      const vendorItems = order.orderItems.filter((item: any) => 
        item.product.vendorProfile.id === vendor.id
      );
      const vendorTotal = vendorItems.reduce((sum: number, item: any) => 
        sum + (item.price * item.quantity), 0
      );
      const vendorCommission = Math.round(vendorTotal * COMMISSION_RATE);
      const vendorPayout = vendorTotal - vendorCommission;

      const emailData = {
        to: vendor.email,
        subject: `New Order Received - ${order.orderNumber}`,
        template: 'vendor-order-notification',
        data: {
          orderNumber: order.orderNumber,
          vendorTotal: vendorTotal,
          vendorCommission: vendorCommission,
          vendorPayout: vendorPayout,
          orderItems: vendorItems,
          customerEmail: order.user.email,
        },
      };

      // await emailService.sendEmail(emailData);
      console.log(`Vendor notification email queued for ${vendor.storeName}`);
    }

  } catch (error) {
    console.error('Error sending vendor notifications:', error);
  }
}

/**
 * Send vendor payout confirmation
 */
async function sendVendorPayoutConfirmation(vendorId: string, transfer: Stripe.Transfer) {
  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
    });

    if (vendorProfile) {
      console.log(`Sending payout confirmation to vendor: ${vendorProfile.storeName}`);
      
      const emailData = {
        to: vendorProfile.email,
        subject: 'Payout Confirmation',
        template: 'vendor-payout-confirmation',
        data: {
          transferId: transfer.id,
          amount: transfer.amount / 100,
          currency: transfer.currency,
          orderId: transfer.metadata?.orderId,
        },
      };

      // await emailService.sendEmail(emailData);
      console.log('Vendor payout confirmation email queued');
    }

  } catch (error) {
    console.error('Error sending vendor payout confirmation:', error);
  }
}

/**
 * Health check endpoint for webhook
 */
export const webhookHealthCheck = (req: express.Request, res: express.Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    webhook_secret_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
  });
}; 