import { prisma } from '../../db';
import { LedgerType } from '@prisma/client';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export interface RevenueKPIs {
  gmvCents: number; // Gross Merchandise Volume
  platformRevenueCents: number;
  marketplaceFeeCents: number;
  eventFeeCents: number;
  subscriptionFeeCents: number;
  takeRateBps: number;
  netRevenueCents: number;
  processingCostCents: number;
  refundsCents: number;
  disputesCents: number;
  payoutsPendingCents: number;
  payoutsInTransitCents: number;
  payoutsCompletedCents: number;
  taxCollectedCents: number;
}

export type AccountingMode = 'accrual' | 'cash';

/**
 * Calculate revenue KPIs for a date range
 */
export async function calculateKPIs(
  fromDate: Date,
  toDate: Date,
  mode: AccountingMode = 'accrual'
): Promise<RevenueKPIs> {
  logger.info('Calculating revenue KPIs', { fromDate, toDate, mode });

  // Get all ledger entries for the period
  const entries = await prisma.ledgerEntry.findMany({
    where: {
      occurredAt: {
        gte: fromDate,
        lte: toDate,
      },
    },
  });

  // Calculate totals by type
  const totals = entries.reduce(
    (acc, entry) => {
      switch (entry.type) {
        case 'ORDER_FEE':
          acc.marketplaceFeeCents += entry.amountCents;
          break;
        case 'EVENT_FEE':
          acc.eventFeeCents += entry.amountCents;
          break;
        case 'SUBSCRIPTION_FEE':
          acc.subscriptionFeeCents += entry.amountCents;
          break;
        case 'PROCESSING_FEE':
          acc.processingCostCents += Math.abs(entry.amountCents);
          break;
        case 'REFUND':
          acc.refundsCents += Math.abs(entry.amountCents);
          break;
        case 'DISPUTE_HOLD':
        case 'DISPUTE_LOSS':
          acc.disputesCents += Math.abs(entry.amountCents);
          break;
        case 'TAX_COLLECTED':
          acc.taxCollectedCents += entry.amountCents;
          break;
      }
      return acc;
    },
    {
      marketplaceFeeCents: 0,
      eventFeeCents: 0,
      subscriptionFeeCents: 0,
      processingCostCents: 0,
      refundsCents: 0,
      disputesCents: 0,
      taxCollectedCents: 0,
    }
  );

  // Platform revenue = sum of all fee types
  const platformRevenueCents =
    totals.marketplaceFeeCents +
    totals.eventFeeCents +
    totals.subscriptionFeeCents;

  // Get GMV from orders
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
      status: mode === 'cash' ? 'PAID' : undefined, // In cash mode, only count paid orders
    },
    select: {
      total: true,
      tax: true,
    },
  });

  const gmvCents = orders.reduce(
    (sum, order) => sum + Math.round((order.total - order.tax) * 100),
    0
  );

  // Calculate take rate
  const takeRateBps = gmvCents > 0 
    ? Math.round((platformRevenueCents / gmvCents) * 10000)
    : 0;

  // Net revenue = platform revenue - costs
  const netRevenueCents =
    platformRevenueCents -
    totals.processingCostCents -
    totals.refundsCents -
    totals.disputesCents;

  // Get payout stats
  const payouts = await prisma.revenuePayout.findMany({
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    },
  });

  const payoutsPendingCents = payouts
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.netCents, 0);

  const payoutsInTransitCents = payouts
    .filter((p) => p.status === 'IN_TRANSIT')
    .reduce((sum, p) => sum + p.netCents, 0);

  const payoutsCompletedCents = payouts
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.netCents, 0);

  const kpis: RevenueKPIs = {
    gmvCents,
    platformRevenueCents,
    marketplaceFeeCents: totals.marketplaceFeeCents,
    eventFeeCents: totals.eventFeeCents,
    subscriptionFeeCents: totals.subscriptionFeeCents,
    takeRateBps,
    netRevenueCents,
    processingCostCents: totals.processingCostCents,
    refundsCents: totals.refundsCents,
    disputesCents: totals.disputesCents,
    payoutsPendingCents,
    payoutsInTransitCents,
    payoutsCompletedCents,
    taxCollectedCents: totals.taxCollectedCents,
  };

  logger.info('Revenue KPIs calculated', { kpis, mode });

  return kpis;
}

/**
 * Generate and save revenue snapshot for a specific date
 */
export async function generateRevenueSnapshot(date: Date): Promise<void> {
  logger.info('Generating revenue snapshot', { date });

  // Calculate KPIs for the date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const kpis = await calculateKPIs(startOfDay, endOfDay, 'accrual');

  // Save snapshot
  await prisma.revenueSnapshot.upsert({
    where: { date: startOfDay },
    create: {
      date: startOfDay,
      ...kpis,
    },
    update: {
      ...kpis,
    },
  });

  logger.info('Revenue snapshot saved', { date: startOfDay });
}

/**
 * Get revenue trend data
 */
export async function getRevenueTrend(
  fromDate: Date,
  toDate: Date,
  granularity: 'daily' | 'weekly' | 'monthly' = 'daily'
) {
  const snapshots = await prisma.revenueSnapshot.findMany({
    where: {
      date: {
        gte: fromDate,
        lte: toDate,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  logger.info('Revenue trend retrieved', {
    fromDate,
    toDate,
    granularity,
    count: snapshots.length,
  });

  return snapshots;
}

/**
 * Get revenue by role (vendor, event coordinator, etc.)
 */
export async function getRevenueByRole(fromDate: Date, toDate: Date) {
  // Get all fee entries
  const entries = await prisma.ledgerEntry.findMany({
    where: {
      occurredAt: {
        gte: fromDate,
        lte: toDate,
      },
      type: {
        in: ['ORDER_FEE', 'EVENT_FEE', 'SUBSCRIPTION_FEE'],
      },
    },
  });

  // Group by role based on userId
  const revenueByRole: Record<string, number> = {
    vendors: 0,
    events: 0,
    subscriptions: 0,
  };

  for (const entry of entries) {
    switch (entry.type) {
      case 'ORDER_FEE':
        revenueByRole.vendors += entry.amountCents;
        break;
      case 'EVENT_FEE':
        revenueByRole.events += entry.amountCents;
        break;
      case 'SUBSCRIPTION_FEE':
        revenueByRole.subscriptions += entry.amountCents;
        break;
    }
  }

  logger.info('Revenue by role calculated', { revenueByRole });

  return revenueByRole;
}

