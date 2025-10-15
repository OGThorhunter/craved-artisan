import { prisma } from '../../db';
import { LedgerType, Prisma } from '@prisma/client';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export interface LedgerEntryInput {
  type: LedgerType;
  amountCents: number; // positive=credit to platform, negative=debit
  currency?: string;
  userId?: string;
  orderId?: string;
  eventId?: string;
  payoutId?: string;
  stripeChargeId?: string;
  metadata?: Prisma.InputJsonValue;
  createdById: string; // system or admin user id
  occurredAt?: Date;
}

export interface LedgerQueryFilters {
  type?: LedgerType | LedgerType[];
  userId?: string;
  orderId?: string;
  eventId?: string;
  payoutId?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Append a single ledger entry (immutable, append-only)
 */
export async function appendEntry(
  entry: LedgerEntryInput
): Promise<{ id: string }> {
  logger.info('Appending ledger entry', { entry });

  const created = await prisma.ledgerEntry.create({
    data: {
      type: entry.type,
      amountCents: entry.amountCents,
      currency: entry.currency || 'usd',
      userId: entry.userId,
      orderId: entry.orderId,
      eventId: entry.eventId,
      payoutId: entry.payoutId,
      stripeChargeId: entry.stripeChargeId,
      metadata: entry.metadata,
      createdById: entry.createdById,
      occurredAt: entry.occurredAt || new Date(),
    },
  });

  logger.info('Ledger entry created', { id: created.id, type: entry.type });

  return { id: created.id };
}

/**
 * Append multiple ledger entries in a transaction
 */
export async function appendMany(
  entries: LedgerEntryInput[]
): Promise<{ ids: string[] }> {
  logger.info('Appending multiple ledger entries', { count: entries.length });

  const results = await prisma.$transaction(
    entries.map((entry) =>
      prisma.ledgerEntry.create({
        data: {
          type: entry.type,
          amountCents: entry.amountCents,
          currency: entry.currency || 'usd',
          userId: entry.userId,
          orderId: entry.orderId,
          eventId: entry.eventId,
          payoutId: entry.payoutId,
          stripeChargeId: entry.stripeChargeId,
          metadata: entry.metadata,
          createdById: entry.createdById,
          occurredAt: entry.occurredAt || new Date(),
        },
      })
    )
  );

  const ids = results.map((r) => r.id);

  logger.info('Multiple ledger entries created', {
    count: ids.length,
    ids,
  });

  return { ids };
}

/**
 * Query ledger with filters and pagination
 */
export async function queryLedger(filters: LedgerQueryFilters) {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: Prisma.LedgerEntryWhereInput = {};

  if (filters.type) {
    if (Array.isArray(filters.type)) {
      where.type = { in: filters.type };
    } else {
      where.type = filters.type;
    }
  }

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.orderId) {
    where.orderId = filters.orderId;
  }

  if (filters.eventId) {
    where.eventId = filters.eventId;
  }

  if (filters.payoutId) {
    where.payoutId = filters.payoutId;
  }

  if (filters.fromDate || filters.toDate) {
    where.occurredAt = {};
    if (filters.fromDate) {
      where.occurredAt.gte = filters.fromDate;
    }
    if (filters.toDate) {
      where.occurredAt.lte = filters.toDate;
    }
  }

  const [entries, total] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.ledgerEntry.count({ where }),
  ]);

  logger.info('Ledger queried', {
    filters,
    page,
    limit,
    total,
    returned: entries.length,
  });

  return {
    entries,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get ledger balance for a user (sum of all entries)
 */
export async function getUserLedgerBalance(userId: string): Promise<number> {
  const result = await prisma.ledgerEntry.aggregate({
    where: { userId },
    _sum: { amountCents: true },
  });

  const balance = result._sum.amountCents || 0;

  logger.info('User ledger balance calculated', { userId, balance });

  return balance;
}

/**
 * Get platform ledger balance (sum of all entries)
 */
export async function getPlatformLedgerBalance(): Promise<number> {
  const result = await prisma.ledgerEntry.aggregate({
    _sum: { amountCents: true },
  });

  const balance = result._sum.amountCents || 0;

  logger.info('Platform ledger balance calculated', { balance });

  return balance;
}

/**
 * Get ledger entries for a specific order
 */
export async function getOrderLedgerEntries(orderId: string) {
  const entries = await prisma.ledgerEntry.findMany({
    where: { orderId },
    orderBy: { occurredAt: 'asc' },
  });

  logger.info('Order ledger entries retrieved', {
    orderId,
    count: entries.length,
  });

  return entries;
}

/**
 * Create adjustment ledger entry (for fee recalculation, manual adjustments)
 */
export async function createAdjustment(
  amountCents: number,
  reason: string,
  orderId: string,
  adminId: string,
  metadata?: Prisma.InputJsonValue
): Promise<{ id: string }> {
  logger.info('Creating adjustment entry', {
    amountCents,
    reason,
    orderId,
    adminId,
  });

  return appendEntry({
    type: 'ADJUSTMENT',
    amountCents,
    orderId,
    createdById: adminId,
    metadata: {
      ...(typeof metadata === 'object' && metadata !== null ? metadata : {}),
      reason,
    } as Prisma.InputJsonValue,
  });
}

