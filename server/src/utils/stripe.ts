import Stripe from 'stripe';
import prisma, { OrderStatus, Role } from '../lib/prisma';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Commission rate (2%)
const COMMISSION_RATE = 0.02;

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  connectClientId: string;
}

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = stripe;
  }

  /**
   * Create a Stripe Connect account for a vendor
   */
  async createConnectAccount(vendorProfileId: string, email: string, businessName: string) {
    try {
      const account = await this.stripe.accounts.create({
        type: 'standard',
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

      // Update vendor profile with Stripe account info
      await prisma.vendorProfile.update({
        where: { id: vendorProfileId },
        data: {
          stripeAccountId: account.id,
          stripeAccountStatus: account.charges_enabled ? 'active' : 'pending',
        },
      });

      return account;
    } catch (error) {
      console.error('Error creating Stripe Connect account:', error);
      throw error;
    }
  }

  /**
   * Generate onboarding URL for vendor to complete Stripe Connect setup
   */
  async createOnboardingUrl(vendorProfileId: string) {
    try {
      const vendorProfile = await prisma.vendorProfile.findUnique({
        where: { id: vendorProfileId },
      });

      if (!vendorProfile?.stripeAccountId) {
        throw new Error('Vendor does not have a Stripe account');
      }

      const accountLink = await this.stripe.accountLinks.create({
        account: vendorProfile.stripeAccountId,
        refresh_url: `${process.env.CLIENT_URL}/vendor/onboarding/refresh`,
        return_url: `${process.env.CLIENT_URL}/vendor/onboarding/complete`,
        type: 'account_onboarding',
      });

      // Update vendor profile with onboarding URL
      await prisma.vendorProfile.update({
        where: { id: vendorProfileId },
        data: {
          stripeOnboardingUrl: accountLink.url,
        },
      });

      return accountLink.url;
    } catch (error) {
      console.error('Error creating onboarding URL:', error);
      throw error;
    }
  }

  /**
   * Create a payment intent for an order with automatic commission calculation
   */
  async createPaymentIntent(orderData: {
    amount: number;
    currency: string;
    orderId: string;
    customerEmail: string;
    metadata: Record<string, string>;
  }) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(orderData.amount * 100), // Convert to cents
        currency: orderData.currency,
        metadata: {
          orderId: orderData.orderId,
          ...orderData.metadata,
        },
        receipt_email: orderData.customerEmail,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Process payment and automatically transfer funds to vendor with 2% commission
   */
  async processPaymentWithCommission(orderId: string, paymentIntentId: string) {
    try {
      // Get order details
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
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
        throw new Error('Order not found');
      }

      // Calculate commission and vendor payout
      const totalAmount = parseFloat(order.total.toString());
      const commissionAmount = totalAmount * COMMISSION_RATE;
      const vendorPayoutAmount = totalAmount - commissionAmount;

      // Group items by vendor for separate transfers
      const vendorGroups = new Map<string, { amount: number; items: any[] }>();
      
      order.orderItems.forEach(item => {
        const vendorId = item.product.vendorProfile.stripeAccountId;
        if (!vendorId) {
          throw new Error(`Vendor ${item.product.vendorProfile.id} not connected to Stripe`);
        }

        const itemTotal = parseFloat(item.total.toString());
        const existing = vendorGroups.get(vendorId);
        
        if (existing) {
          existing.amount += itemTotal;
          existing.items.push(item);
        } else {
          vendorGroups.set(vendorId, { amount: itemTotal, items: [item] });
        }
      });

      // Create transfers to each vendor
      const transfers = [];
      for (const [vendorStripeAccountId, vendorData] of vendorGroups) {
        const vendorCommissionAmount = vendorData.amount * COMMISSION_RATE;
        const vendorPayout = vendorData.amount - vendorCommissionAmount;

        const transfer = await this.stripe.transfers.create({
          amount: Math.round(vendorPayout * 100), // Convert to cents
          currency: 'usd',
          destination: vendorStripeAccountId,
          metadata: {
            orderId: orderId,
            commissionAmount: vendorCommissionAmount.toString(),
            vendorPayoutAmount: vendorPayout.toString(),
          },
        });

        transfers.push(transfer);
      }

      // Update order with payment and transfer information
      await prisma.order.update({
        where: { id: orderId },
        data: {
          stripePaymentIntentId: paymentIntentId,
          stripeTransferId: transfers.map(t => t.id).join(','),
          commissionAmount: commissionAmount,
          vendorPayoutAmount: vendorPayoutAmount,
          status: OrderStatus.CONFIRMED,
        },
      });

      return {
        paymentIntentId,
        transfers,
        commissionAmount,
        vendorPayoutAmount,
      };
    } catch (error) {
      console.error('Error processing payment with commission:', error);
      throw error;
    }
  }

  /**
   * Get vendor's Stripe account status
   */
  async getVendorAccountStatus(vendorProfileId: string) {
    try {
      const vendorProfile = await prisma.vendorProfile.findUnique({
        where: { id: vendorProfileId },
      });

      if (!vendorProfile?.stripeAccountId) {
        return { status: 'not_connected' };
      }

      const account = await this.stripe.accounts.retrieve(vendorProfile.stripeAccountId);
      
      return {
        status: account.charges_enabled ? 'active' : 'pending',
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      };
    } catch (error) {
      console.error('Error getting vendor account status:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'account.updated':
          await this.handleAccountUpdated(event.data.object as Stripe.Account);
          break;
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'transfer.created':
          await this.handleTransferCreated(event.data.object as Stripe.Transfer);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  private async handleAccountUpdated(account: Stripe.Account) {
    // Update vendor profile when Stripe account is updated
    await prisma.vendorProfile.updateMany({
      where: { stripeAccountId: account.id },
      data: {
        stripeAccountStatus: account.charges_enabled ? 'active' : 'pending',
      },
    });
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    if (orderId) {
      await this.processPaymentWithCommission(orderId, paymentIntent.id);
    }
  }

  private async handleTransferCreated(transfer: Stripe.Transfer) {
    // Log transfer creation for audit purposes
    console.log(`Transfer created: ${transfer.id} for amount: ${transfer.amount}`);
  }

  /**
   * Get commission rate
   */
  getCommissionRate() {
    return COMMISSION_RATE;
  }

  /**
   * Calculate commission amount
   */
  calculateCommission(amount: number) {
    return amount * COMMISSION_RATE;
  }

  /**
   * Calculate vendor payout amount
   */
  calculateVendorPayout(amount: number) {
    return amount - this.calculateCommission(amount);
  }
}

export const stripeService = new StripeService();
export default stripe; 