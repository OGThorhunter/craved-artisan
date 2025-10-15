import { prisma } from '../../db';
import { PromoScope } from '@prisma/client';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export interface PromoContext {
  code: string;
  userId?: string;
  eventId?: string;
  platformFeeScope?: 'PLATFORM_FEE' | 'SUBSCRIPTION' | 'EVENT';
}

export interface PromoResolved {
  id: string;
  code: string;
  appliesTo: PromoScope;
  percentOffBps: number | null;
  amountOffCents: number | null;
  discountCents: number;
}

/**
 * Resolve and validate a promo code
 */
export async function resolvePromo(
  context: PromoContext,
  platformFeeCents: number
): Promise<PromoResolved | null> {
  const now = new Date();

  logger.info('Resolving promo code', { context, platformFeeCents });

  // Find active promo
  const promo = await prisma.platformPromo.findFirst({
    where: {
      code: context.code,
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gte: now } }],
      appliesTo: context.platformFeeScope || 'PLATFORM_FEE',
    },
  });

  if (!promo) {
    logger.warn('Promo code not found or expired', { code: context.code });
    return null;
  }

  // Check redemption limit
  if (
    promo.maxRedemptions !== null &&
    promo.currentUses >= promo.maxRedemptions
  ) {
    logger.warn('Promo code max redemptions reached', {
      code: context.code,
      maxRedemptions: promo.maxRedemptions,
      currentUses: promo.currentUses,
    });
    return null;
  }

  // Check audience targeting (if set)
  if (promo.audienceTag && context.userId) {
    // TODO: Implement audience targeting logic
    // For now, we'll skip this check
    logger.info('Audience targeting check skipped', {
      audienceTag: promo.audienceTag,
    });
  }

  // Calculate discount
  const discountCents = applyPromoDiscount(
    platformFeeCents,
    promo.percentOffBps,
    promo.amountOffCents
  );

  logger.info('Promo code resolved', {
    promoId: promo.id,
    code: promo.code,
    discountCents,
  });

  return {
    id: promo.id,
    code: promo.code,
    appliesTo: promo.appliesTo,
    percentOffBps: promo.percentOffBps,
    amountOffCents: promo.amountOffCents,
    discountCents,
  };
}

/**
 * Apply promo discount to platform fee
 */
export function applyPromoDiscount(
  platformFeeCents: number,
  percentOffBps: number | null,
  amountOffCents: number | null
): number {
  let discount = 0;

  if (percentOffBps !== null) {
    // Percentage discount
    discount = Math.round((platformFeeCents * percentOffBps) / 10000);
  } else if (amountOffCents !== null) {
    // Fixed amount discount
    discount = amountOffCents;
  }

  // Discount cannot exceed the platform fee
  discount = Math.min(discount, platformFeeCents);

  logger.info('Promo discount applied', {
    platformFeeCents,
    percentOffBps,
    amountOffCents,
    discount,
  });

  return discount;
}

/**
 * Increment promo usage count
 */
export async function incrementPromoUsage(promoId: string): Promise<void> {
  await prisma.platformPromo.update({
    where: { id: promoId },
    data: {
      currentUses: { increment: 1 },
    },
  });

  logger.info('Promo usage incremented', { promoId });
}

/**
 * Get active promos
 */
export async function getActivePromos(appliesTo?: PromoScope) {
  const now = new Date();

  const where: any = {
    startsAt: { lte: now },
    OR: [{ endsAt: null }, { endsAt: { gte: now } }],
  };

  if (appliesTo) {
    where.appliesTo = appliesTo;
  }

  const promos = await prisma.platformPromo.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  logger.info('Active promos retrieved', {
    appliesTo,
    count: promos.length,
  });

  return promos;
}

/**
 * Create a new promo
 */
export async function createPromo(data: {
  code: string;
  appliesTo: PromoScope;
  percentOffBps?: number;
  amountOffCents?: number;
  startsAt: Date;
  endsAt?: Date;
  audienceTag?: string;
  maxRedemptions?: number;
}) {
  logger.info('Creating new promo', { code: data.code });

  const promo = await prisma.platformPromo.create({
    data: {
      code: data.code.toUpperCase(),
      appliesTo: data.appliesTo,
      percentOffBps: data.percentOffBps || null,
      amountOffCents: data.amountOffCents || null,
      startsAt: data.startsAt,
      endsAt: data.endsAt || null,
      audienceTag: data.audienceTag || null,
      maxRedemptions: data.maxRedemptions || null,
    },
  });

  logger.info('Promo created', { id: promo.id, code: promo.code });

  return promo;
}

