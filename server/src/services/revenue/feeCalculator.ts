import { resolveActiveFeeSchedule, FeeContext } from './feeResolver';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export interface PlatformFeeResult {
  raw: number; // Raw fee before discounts/caps
  discounted: number; // After promo discount
  floor: number; // Minimum fee applied
  cap: number | null; // Maximum fee cap (if any)
  effective: number; // Final fee to charge
  scheduleId: string;
  scheduleVersion: number;
}

export interface ProcessingFeeConfig {
  percentBps: number; // e.g., 290 for 2.9%
  fixedCents: number; // e.g., 30 for $0.30
}

/**
 * Calculate platform fee for an order
 */
export async function calcPlatformFee(
  orderSubtotalCents: number,
  context: FeeContext,
  promoDiscountCents: number = 0
): Promise<PlatformFeeResult | null> {
  const schedule = await resolveActiveFeeSchedule(context);

  if (!schedule || schedule.takeRateBps === null) {
    logger.warn('No fee schedule or take rate found', { context });
    return null;
  }

  // Calculate raw fee based on take rate
  const rawFee = Math.round(
    (orderSubtotalCents * schedule.takeRateBps) / 10000
  );

  // Apply floor
  const feeWithFloor = Math.max(
    rawFee,
    schedule.feeFloorCents || 0
  );

  // Apply cap (if set)
  const feeWithCap = schedule.feeCapCents
    ? Math.min(feeWithFloor, schedule.feeCapCents)
    : feeWithFloor;

  // Apply promo discount
  const feeWithPromo = Math.max(feeWithCap - promoDiscountCents, 0);

  logger.info('Platform fee calculated', {
    orderSubtotalCents,
    scheduleId: schedule.id,
    takeRateBps: schedule.takeRateBps,
    raw: rawFee,
    withFloor: feeWithFloor,
    withCap: feeWithCap,
    promoDiscount: promoDiscountCents,
    effective: feeWithPromo,
  });

  return {
    raw: rawFee,
    discounted: feeWithPromo,
    floor: schedule.feeFloorCents || 0,
    cap: schedule.feeCapCents,
    effective: feeWithPromo,
    scheduleId: schedule.id,
    scheduleVersion: schedule.version,
  };
}

/**
 * Calculate Stripe processing fee
 * Default: 2.9% + $0.30 (configurable)
 */
export function calcProcessingFee(
  orderTotalCents: number,
  config: ProcessingFeeConfig = {
    percentBps: 290, // 2.9%
    fixedCents: 30, // $0.30
  }
): number {
  const percentFee = Math.round(
    (orderTotalCents * config.percentBps) / 10000
  );
  const totalFee = percentFee + config.fixedCents;

  logger.info('Processing fee calculated', {
    orderTotalCents,
    config,
    percentFee,
    fixedFee: config.fixedCents,
    totalFee,
  });

  return totalFee;
}

/**
 * Calculate net to vendor
 */
export function calcNetToVendor(
  orderTotalCents: number,
  taxCents: number,
  processingFeeCents: number,
  platformFeeCents: number,
  otherFeesCents: number = 0
): number {
  const netToVendor =
    orderTotalCents -
    taxCents -
    processingFeeCents -
    platformFeeCents -
    otherFeesCents;

  logger.info('Net to vendor calculated', {
    orderTotalCents,
    taxCents,
    processingFeeCents,
    platformFeeCents,
    otherFeesCents,
    netToVendor,
  });

  return Math.max(netToVendor, 0);
}

/**
 * Calculate platform net revenue per order
 */
export function calcPlatformNetRevenue(
  platformFeeCents: number,
  processingFeeCents: number = 0,
  chargebackCents: number = 0,
  platformAbsorbsProcessing: boolean = false
): number {
  let netRevenue = platformFeeCents;

  // If platform absorbs processing fees, deduct from revenue
  if (platformAbsorbsProcessing) {
    netRevenue -= processingFeeCents;
  }

  // Deduct chargebacks
  netRevenue -= chargebackCents;

  logger.info('Platform net revenue calculated', {
    platformFeeCents,
    processingFeeCents,
    chargebackCents,
    platformAbsorbsProcessing,
    netRevenue,
  });

  return Math.max(netRevenue, 0);
}

/**
 * Calculate refund impact
 */
export function calcRefundImpact(
  originalPlatformFeeCents: number,
  refundAmountCents: number,
  originalOrderCents: number,
  refundFeePolicy: 'keep' | 'refund' | 'proportional' = 'proportional'
): {
  platformFeeToRefund: number;
  platformFeeToKeep: number;
} {
  let platformFeeToRefund = 0;

  switch (refundFeePolicy) {
    case 'keep':
      platformFeeToRefund = 0;
      break;
    case 'refund':
      platformFeeToRefund = originalPlatformFeeCents;
      break;
    case 'proportional':
      const refundRatio = refundAmountCents / originalOrderCents;
      platformFeeToRefund = Math.round(
        originalPlatformFeeCents * refundRatio
      );
      break;
  }

  const platformFeeToKeep = originalPlatformFeeCents - platformFeeToRefund;

  logger.info('Refund impact calculated', {
    originalPlatformFeeCents,
    refundAmountCents,
    originalOrderCents,
    policy: refundFeePolicy,
    platformFeeToRefund,
    platformFeeToKeep,
  });

  return {
    platformFeeToRefund,
    platformFeeToKeep,
  };
}

