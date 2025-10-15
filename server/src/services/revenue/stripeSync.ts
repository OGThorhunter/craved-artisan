import { prisma } from '../../db';
import { appendEntry, appendMany } from './ledger';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

/**
 * Sync Stripe charges and create PROCESSING_FEE ledger entries
 */
export async function syncCharges(
  fromDate?: Date,
  toDate?: Date
): Promise<{ synced: number }> {
  logger.info('Syncing Stripe charges', { fromDate, toDate });

  // Get Stripe payments that haven't been synced to ledger
  const whereClause: any = {};
  
  if (fromDate || toDate) {
    whereClause.createdAt = {};
    if (fromDate) whereClause.createdAt.gte = fromDate;
    if (toDate) whereClause.createdAt.lte = toDate;
  }

  const payments = await prisma.stripePayment.findMany({
    where: whereClause,
    orderBy: { createdAt: 'asc' },
  });

  // Check which ones already have ledger entries
  const existingEntries = await prisma.ledgerEntry.findMany({
    where: {
      stripeChargeId: {
        in: payments.map((p) => p.stripePaymentId),
      },
      type: 'PROCESSING_FEE',
    },
  });

  const syncedChargeIds = new Set(
    existingEntries.map((e) => e.stripeChargeId)
  );

  // Create ledger entries for new payments
  const entriesToCreate = payments
    .filter((p) => !syncedChargeIds.has(p.stripePaymentId))
    .map((payment) => ({
      type: 'PROCESSING_FEE' as const,
      amountCents: -Math.round(payment.fee * 100), // Negative because it's a cost
      userId: payment.vendorProfileId,
      orderId: payment.orderId || undefined,
      stripeChargeId: payment.stripePaymentId,
      createdById: 'system',
      occurredAt: payment.createdAt,
      metadata: {
        stripePaymentId: payment.stripePaymentId,
        amount: payment.amount,
        fee: payment.fee,
      },
    }));

  if (entriesToCreate.length > 0) {
    await appendMany(entriesToCreate);
  }

  logger.info('Stripe charges synced', {
    total: payments.length,
    synced: entriesToCreate.length,
    skipped: payments.length - entriesToCreate.length,
  });

  return { synced: entriesToCreate.length };
}

/**
 * Sync Stripe payouts
 */
export async function syncPayouts(
  fromDate?: Date,
  toDate?: Date
): Promise<{ synced: number }> {
  logger.info('Syncing Stripe payouts', { fromDate, toDate });

  const whereClause: any = {};
  
  if (fromDate || toDate) {
    whereClause.createdAt = {};
    if (fromDate) whereClause.createdAt.gte = fromDate;
    if (toDate) whereClause.createdAt.lte = toDate;
  }

  const stripePayouts = await prisma.stripePayout.findMany({
    where: whereClause,
    orderBy: { createdAt: 'asc' },
  });

  // Check which ones already exist in RevenuePayout
  const existingPayouts = await prisma.revenuePayout.findMany({
    where: {
      stripePayoutId: {
        in: stripePayouts.map((p) => p.stripePayoutId),
      },
    },
  });

  const syncedPayoutIds = new Set(
    existingPayouts.map((p) => p.stripePayoutId)
  );

  // Create RevenuePayout records and ledger entries
  const payoutsToCreate = stripePayouts.filter(
    (p) => !syncedPayoutIds.has(p.stripePayoutId)
  );

  for (const payout of payoutsToCreate) {
    const amountCents = Math.round(payout.amount * 100);
    
    // Create RevenuePayout record
    const revenuePayout = await prisma.revenuePayout.create({
      data: {
        userId: payout.vendorProfileId,
        grossCents: amountCents,
        feeCents: 0, // Stripe payout fee (if any)
        netCents: amountCents,
        status: payout.status === 'paid' ? 'PAID' : 'PENDING',
        expectedDate: payout.arrivalDate,
        completedAt: payout.status === 'paid' ? payout.arrivalDate : null,
        stripePayoutId: payout.stripePayoutId,
      },
    });

    // Create ledger entry
    await appendEntry({
      type: 'PAYOUT',
      amountCents: -amountCents, // Negative because money is leaving platform
      userId: payout.vendorProfileId,
      payoutId: revenuePayout.id,
      stripeChargeId: payout.stripePayoutId,
      createdById: 'system',
      occurredAt: payout.createdAt,
      metadata: {
        stripePayoutId: payout.stripePayoutId,
        amount: payout.amount,
        arrivalDate: payout.arrivalDate,
      },
    });
  }

  logger.info('Stripe payouts synced', {
    total: stripePayouts.length,
    synced: payoutsToCreate.length,
    skipped: stripePayouts.length - payoutsToCreate.length,
  });

  return { synced: payoutsToCreate.length };
}

/**
 * Sync Stripe disputes
 */
export async function syncDisputes(): Promise<{ synced: number }> {
  logger.info('Syncing Stripe disputes');

  // TODO: Implement dispute sync when Stripe dispute model is available
  // For now, this is a placeholder

  logger.info('Stripe disputes sync - not yet implemented');

  return { synced: 0 };
}

/**
 * Create DISPUTE_HOLD ledger entry
 */
export async function createDisputeHold(
  amountCents: number,
  orderId: string,
  stripeDisputeId: string,
  userId: string
): Promise<{ id: string }> {
  logger.info('Creating dispute hold', {
    amountCents,
    orderId,
    stripeDisputeId,
  });

  return appendEntry({
    type: 'DISPUTE_HOLD',
    amountCents: -amountCents, // Negative because funds are held
    orderId,
    userId,
    stripeChargeId: stripeDisputeId,
    createdById: 'system',
    metadata: {
      stripeDisputeId,
      status: 'held',
    },
  });
}

/**
 * Resolve dispute - create WIN or LOSS entry
 */
export async function resolveDispute(
  amountCents: number,
  orderId: string,
  stripeDisputeId: string,
  userId: string,
  outcome: 'win' | 'loss'
): Promise<{ id: string }> {
  logger.info('Resolving dispute', {
    amountCents,
    orderId,
    stripeDisputeId,
    outcome,
  });

  const type = outcome === 'win' ? 'DISPUTE_WIN' : 'DISPUTE_LOSS';
  
  return appendEntry({
    type,
    amountCents: outcome === 'win' ? amountCents : -amountCents,
    orderId,
    userId,
    stripeChargeId: stripeDisputeId,
    createdById: 'system',
    metadata: {
      stripeDisputeId,
      outcome,
    },
  });
}

/**
 * Run full sync (charges + payouts + disputes)
 */
export async function runFullSync(
  fromDate?: Date,
  toDate?: Date
): Promise<{
  charges: number;
  payouts: number;
  disputes: number;
}> {
  logger.info('Running full Stripe sync', { fromDate, toDate });

  const [chargesResult, payoutsResult, disputesResult] = await Promise.all([
    syncCharges(fromDate, toDate),
    syncPayouts(fromDate, toDate),
    syncDisputes(),
  ]);

  logger.info('Full Stripe sync completed', {
    charges: chargesResult.synced,
    payouts: payoutsResult.synced,
    disputes: disputesResult.synced,
  });

  return {
    charges: chargesResult.synced,
    payouts: payoutsResult.synced,
    disputes: disputesResult.synced,
  };
}

