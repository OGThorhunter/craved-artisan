import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const prisma = new PrismaClient();

interface StripePaymentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  fee: number;
  net: number;
  transfer_data?: {
    destination: string;
  };
  metadata?: {
    vendorProfileId?: string;
    orderId?: string;
  };
}

interface StripeBalanceTransaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  created: number;
  fee: number;
  net: number;
  source: string;
  description?: string;
}

interface StripePayout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrival_date: number;
  created: number;
  description?: string;
}

interface ReconciliationResult {
  syncedPayments: number;
  syncedPayouts: number;
  syncedFees: number;
  errors: string[];
  nextPayoutDate?: string;
  nextPayoutAmount?: number;
}

/**
 * Reconciles Stripe payment data with local database
 * This function would typically be called by a scheduled job or webhook
 */
export async function reconcileStripePayments(
  vendorProfileId: string,
  dateFrom: Date,
  dateTo: Date
): Promise<ReconciliationResult> {
  const result: ReconciliationResult = {
    syncedPayments: 0,
    syncedPayouts: 0,
    syncedFees: 0,
    errors: []
  };

  try {
    // Get vendor's Stripe account ID
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId },
      select: { stripeAccountId: true }
    });

    if (!vendorProfile?.stripeAccountId) {
      result.errors.push('No Stripe account ID found for vendor');
      return result;
    }

    // In a real implementation, this would call Stripe API
    // For now, we'll simulate the data and show the structure
    const mockStripeData = await getMockStripeData(vendorProfileId, dateFrom, dateTo);
    
    // Sync payments
    for (const payment of mockStripeData.payments) {
      try {
        await syncPaymentToDatabase(payment, vendorProfileId);
        result.syncedPayments++;
      } catch (error: any) {
        result.errors.push(`Failed to sync payment ${payment.id}: ${error.message}`);
      }
    }

    // Sync balance transactions (fees)
    for (const transaction of mockStripeData.balanceTransactions) {
      try {
        await syncBalanceTransactionToDatabase(transaction, vendorProfileId);
        result.syncedFees++;
      } catch (error: any) {
        result.errors.push(`Failed to sync transaction ${transaction.id}: ${error.message}`);
      }
    }

    // Sync payouts
    for (const payout of mockStripeData.payouts) {
      try {
        await syncPayoutToDatabase(payout, vendorProfileId);
        result.syncedPayouts++;
      } catch (error: any) {
        result.errors.push(`Failed to sync payout ${payout.id}: ${error.message}`);
      }
    }

    // Get next payout information
    const nextPayout = mockStripeData.payouts.find(p => p.status === 'pending');
    if (nextPayout) {
      result.nextPayoutDate = new Date(nextPayout.arrival_date * 1000).toISOString().split('T')[0];
      result.nextPayoutAmount = nextPayout.amount / 100; // Convert from cents
    }

    logger.info({
      vendorProfileId,
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
      result
    }, 'Stripe reconciliation completed');

    return result;

  } catch (error: any) {
    logger.error({
      vendorProfileId,
      error: error.message,
      stack: error.stack
    }, 'Stripe reconciliation failed');

    result.errors.push(`Reconciliation failed: ${error.message}`);
    return result;
  }
}

/**
 * Syncs a Stripe payment to the local database
 */
async function syncPaymentToDatabase(payment: StripePaymentData, vendorProfileId: string): Promise<void> {
  // TODO: Implement when Stripe models are available
  // Check if payment already exists
  // const existingPayment = await prisma.stripePayment.findUnique({
  //   where: { stripePaymentId: payment.id }
  // });

  // if (existingPayment) {
  //   // Update existing payment
  //   await prisma.stripePayment.update({
  //     where: { stripePaymentId: payment.id },
  //     data: {
  //       amount: payment.amount / 100, // Convert from cents
  //       fee: payment.fee / 100,
  //       net: payment.net / 100,
  //       status: payment.status,
  //       updatedAt: new Date()
  //     }
  //   });
  // } else {
  //   // Create new payment record
  //   await prisma.stripePayment.create({
  //     data: {
  //       stripePaymentId: payment.id,
  //       vendorProfileId,
  //       orderId: payment.metadata?.orderId || null,
  //       amount: payment.amount / 100,
  //       fee: payment.fee / 100,
  //       net: payment.net / 100,
  //       currency: payment.currency,
  //       status: payment.status,
  //       createdAt: new Date(payment.created * 1000),
  //       updatedAt: new Date()
  //     }
  //   });
  // }
  
  // For now, just log the payment sync
  logger.info({
    vendorProfileId,
    paymentId: payment.id,
    amount: payment.amount / 100
  }, 'Payment sync simulated (Stripe models not available)');
}

/**
 * Syncs a Stripe balance transaction to the local database
 */
async function syncBalanceTransactionToDatabase(
  transaction: StripeBalanceTransaction,
  vendorProfileId: string
): Promise<void> {
  // TODO: Implement when Stripe models are available
  // Check if transaction already exists
  // const existingTransaction = await prisma.stripeBalanceTransaction.findUnique({
  //   where: { stripeTransactionId: transaction.id }
  // });

  // if (existingTransaction) {
  //   // Update existing transaction
  //   await prisma.stripeBalanceTransaction.update({
  //     where: { stripeTransactionId: transaction.id },
  //     data: {
  //       amount: transaction.amount / 100,
  //       fee: transaction.fee / 100,
  //       net: transaction.net / 100,
  //       type: transaction.type,
  //       description: transaction.description,
  //       updatedAt: new Date()
  //     }
  //   });
  // } else {
  //   // Create new transaction record
  //   await prisma.stripeBalanceTransaction.create({
  //     data: {
  //       stripeTransactionId: transaction.id,
  //       vendorProfileId,
  //       amount: transaction.amount / 100,
  //       fee: transaction.fee / 100,
  //       net: transaction.net / 100,
  //       currency: transaction.currency,
  //       type: transaction.type,
  //       description: transaction.description,
  //       source: transaction.source,
  //       createdAt: new Date(transaction.created * 1000),
  //       updatedAt: new Date()
  //     }
  //   });
  // }
  
  // For now, just log the transaction sync
  logger.info({
    vendorProfileId,
    transactionId: transaction.id,
    amount: transaction.amount / 100
  }, 'Transaction sync simulated (Stripe models not available)');
}

/**
 * Syncs a Stripe payout to the local database
 */
async function syncPayoutToDatabase(payout: StripePayout, vendorProfileId: string): Promise<void> {
  // TODO: Implement when Stripe models are available
  // Check if payout already exists
  // const existingPayout = await prisma.stripePayout.findUnique({
  //   where: { stripePayoutId: payout.id }
  // });

  // if (existingPayout) {
  //   // Update existing payout
  //   await prisma.stripePayout.update({
  //     where: { stripePayoutId: payout.id },
  //     data: {
  //       amount: payout.amount / 100,
  //       status: payout.status,
  //       description: payout.description,
  //       updatedAt: new Date()
  //     }
  //   });
  // } else {
  //   // Create new payout record
  //   await prisma.stripePayout.create({
  //     data: {
  //       stripePayoutId: payout.id,
  //       vendorProfileId,
  //       amount: payout.amount / 100,
  //       currency: payout.currency,
  //       status: payout.status,
  //       description: payout.description,
  //       arrivalDate: new Date(payout.arrival_date * 1000),
  //       createdAt: new Date(payout.created * 1000),
  //       updatedAt: new Date()
  //     }
  //   });
  // }
  
  // For now, just log the payout sync
  logger.info({
    vendorProfileId,
    payoutId: payout.id,
    amount: payout.amount / 100
  }, 'Payout sync simulated (Stripe models not available)');
}

/**
 * Mock Stripe data for development/testing
 * In production, this would be replaced with actual Stripe API calls
 */
async function getMockStripeData(
  vendorProfileId: string,
  dateFrom: Date,
  dateTo: Date
): Promise<{
  payments: StripePaymentData[];
  balanceTransactions: StripeBalanceTransaction[];
  payouts: StripePayout[];
}> {
  // Generate mock data based on actual orders in the database
  const orders = await prisma.order.findMany({
    where: {
      orderItems: {
        some: { vendorProfileId }
      },
      createdAt: { gte: dateFrom, lte: dateTo },
      status: 'PAID'
    },
    include: {
      orderItems: {
        where: { vendorProfileId }
      }
    }
  });

  const payments: StripePaymentData[] = orders.map((order, index) => {
    const totalAmount = order.orderItems.reduce((sum, item) => sum + item.total, 0);
    const fee = totalAmount * 0.029 + 0.30; // 2.9% + $0.30
    const net = totalAmount - fee;

    return {
      id: `pi_mock_${order.id}`,
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      status: 'succeeded',
      created: Math.floor(order.createdAt.getTime() / 1000),
      fee: Math.round(fee * 100),
      net: Math.round(net * 100),
      metadata: {
        vendorProfileId,
        orderId: order.id
      }
    };
  });

  const balanceTransactions: StripeBalanceTransaction[] = payments.map((payment, index) => ({
    id: `txn_mock_${payment.id}`,
    amount: payment.amount,
    currency: 'usd',
    type: 'charge',
    created: payment.created,
    fee: payment.fee,
    net: payment.net,
    source: payment.id,
    description: `Payment for order ${payment.metadata?.orderId}`
  }));

  // Mock payouts (weekly)
  const payouts: StripePayout[] = [];
  const startDate = new Date(dateFrom);
  while (startDate <= dateTo) {
    const payoutDate = new Date(startDate);
    payoutDate.setDate(payoutDate.getDate() + 7); // Weekly payouts
    
    if (payoutDate <= dateTo) {
      const weekPayments = payments.filter(p => {
        const paymentDate = new Date(p.created * 1000);
        return paymentDate >= startDate && paymentDate < payoutDate;
      });
      
      const totalAmount = weekPayments.reduce((sum, p) => sum + p.net, 0);
      
      if (totalAmount > 0) {
        payouts.push({
          id: `po_mock_${payoutDate.getTime()}`,
          amount: totalAmount,
          currency: 'usd',
          status: 'paid',
          arrival_date: Math.floor(payoutDate.getTime() / 1000),
          created: Math.floor(payoutDate.getTime() / 1000),
          description: `Weekly payout for ${startDate.toDateString()} - ${payoutDate.toDateString()}`
        });
      }
    }
    
    startDate.setDate(startDate.getDate() + 7);
  }

  return {
    payments,
    balanceTransactions,
    payouts
  };
}

/**
 * Gets the next scheduled payout for a vendor
 */
export async function getNextPayout(vendorProfileId: string): Promise<{
  date: string | null;
  amount: number | null;
}> {
  try {
    // TODO: Implement when Stripe models are available
    // Check for pending payouts in Stripe
    // const pendingPayout = await prisma.stripePayout.findFirst({
    //   where: {
    //     vendorProfileId,
    //     status: 'pending'
    //   },
    //   orderBy: {
    //     arrivalDate: 'asc'
    //   }
    // });
    
    const pendingPayout = null; // Simulate no pending payout

    if (pendingPayout) {
      return {
        date: pendingPayout.arrivalDate.toISOString().split('T')[0],
        amount: pendingPayout.amount
      };
    }

    // If no pending payout, estimate based on recent activity
    const recentOrders = await prisma.order.findMany({
      where: {
        orderItems: {
          some: { vendorProfileId }
        },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        },
        status: 'PAID'
      },
      include: {
        orderItems: {
          where: { vendorProfileId }
        }
      }
    });

    const totalAmount = recentOrders.reduce((sum, order) => {
      return sum + order.orderItems.reduce((orderSum, item) => orderSum + item.total, 0);
    }, 0);

    const estimatedFee = totalAmount * 0.029 + (recentOrders.length * 0.30);
    const estimatedNet = totalAmount - estimatedFee;

    // Estimate next payout date (typically 2-7 days from now)
    const nextPayoutDate = new Date();
    nextPayoutDate.setDate(nextPayoutDate.getDate() + 3);

    return {
      date: nextPayoutDate.toISOString().split('T')[0],
      amount: estimatedNet > 0 ? estimatedNet : null
    };

  } catch (error: any) {
    logger.error({
      vendorProfileId,
      error: error.message
    }, 'Failed to get next payout');

    return {
      date: null,
      amount: null
    };
  }
}

/**
 * Gets fee breakdown for the last 30 days
 */
export async function getLast30DaysFees(vendorProfileId: string): Promise<{
  platformFees: number;
  paymentFees: number;
  taxCollected: number;
}> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get orders from last 30 days
    const orders = await prisma.order.findMany({
      where: {
        orderItems: {
          some: { vendorProfileId }
        },
        createdAt: { gte: thirtyDaysAgo },
        status: 'PAID'
      },
      include: {
        orderItems: {
          where: { vendorProfileId }
        }
      }
    });

    const grossSales = orders.reduce((sum, order) => {
      return sum + order.orderItems.reduce((orderSum, item) => orderSum + item.total, 0);
    }, 0);

    // Calculate fees
    const platformFees = grossSales * 0.05; // 5% platform commission
    const paymentFees = orders.reduce((sum, order) => {
      const orderTotal = order.orderItems.reduce((orderSum, item) => orderSum + item.total, 0);
      return sum + (orderTotal * 0.029 + 0.30); // 2.9% + $0.30 per transaction
    }, 0);

    const taxCollected = grossSales * 0.08; // Mock 8% tax rate

    return {
      platformFees,
      paymentFees,
      taxCollected
    };

  } catch (error: any) {
    logger.error({
      vendorProfileId,
      error: error.message
    }, 'Failed to get last 30 days fees');

    return {
      platformFees: 0,
      paymentFees: 0,
      taxCollected: 0
    };
  }
}
