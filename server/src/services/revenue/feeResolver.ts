import { prisma } from '../../db';
import { FeeScope } from '@prisma/client';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export interface FeeContext {
  orderId?: string;
  vendorId?: string;
  eventId?: string;
  categoryId?: string;
  role?: string;
  orderDate?: Date;
}

export interface FeeScheduleResolved {
  id: string;
  name: string;
  scope: FeeScope;
  takeRateBps: number | null;
  feeFloorCents: number | null;
  feeCapCents: number | null;
  version: number;
}

/**
 * Resolve the active fee schedule for a given context.
 * Applies the override hierarchy: GLOBAL → ROLE → VENDOR → EVENT → CATEGORY → ORDER
 */
export async function resolveActiveFeeSchedule(
  context: FeeContext
): Promise<FeeScheduleResolved | null> {
  const now = context.orderDate || new Date();

  logger.info('Resolving fee schedule', { context, now });

  // Define scope precedence order (highest priority first for this implementation)
  const scopePrecedence: Array<{
    scope: FeeScope;
    refId: string | undefined;
  }> = [
    { scope: 'ORDER' as FeeScope, refId: context.orderId },
    { scope: 'CATEGORY' as FeeScope, refId: context.categoryId },
    { scope: 'EVENT' as FeeScope, refId: context.eventId },
    { scope: 'VENDOR' as FeeScope, refId: context.vendorId },
    { scope: 'ROLE' as FeeScope, refId: context.role },
    { scope: 'GLOBAL' as FeeScope, refId: undefined },
  ];

  // Try each scope in precedence order
  for (const { scope, refId } of scopePrecedence) {
    const schedule = await prisma.feeSchedule.findFirst({
      where: {
        scope,
        scopeRefId: refId || null,
        activeFrom: { lte: now },
        OR: [{ activeTo: null }, { activeTo: { gte: now } }],
      },
      orderBy: {
        version: 'desc', // Get latest version
      },
    });

    if (schedule) {
      logger.info('Fee schedule resolved', {
        scope,
        refId,
        scheduleId: schedule.id,
        version: schedule.version,
      });

      return {
        id: schedule.id,
        name: schedule.name,
        scope: schedule.scope,
        takeRateBps: schedule.takeRateBps,
        feeFloorCents: schedule.feeFloorCents,
        feeCapCents: schedule.feeCapCents,
        version: schedule.version,
      };
    }
  }

  logger.warn('No fee schedule found for context', { context });
  return null;
}

/**
 * Get all active fee schedules (for admin overview)
 */
export async function getAllActiveFeeSchedules(
  asOfDate?: Date
): Promise<FeeScheduleResolved[]> {
  const now = asOfDate || new Date();

  const schedules = await prisma.feeSchedule.findMany({
    where: {
      activeFrom: { lte: now },
      OR: [{ activeTo: null }, { activeTo: { gte: now } }],
    },
    orderBy: [{ scope: 'asc' }, { version: 'desc' }],
  });

  return schedules.map((s) => ({
    id: s.id,
    name: s.name,
    scope: s.scope,
    takeRateBps: s.takeRateBps,
    feeFloorCents: s.feeFloorCents,
    feeCapCents: s.feeCapCents,
    version: s.version,
  }));
}

/**
 * Get fee schedule history for a specific scope and reference
 */
export async function getFeeScheduleHistory(
  scope: FeeScope,
  scopeRefId?: string
): Promise<FeeScheduleResolved[]> {
  const schedules = await prisma.feeSchedule.findMany({
    where: {
      scope,
      scopeRefId: scopeRefId || null,
    },
    orderBy: {
      version: 'desc',
    },
  });

  return schedules.map((s) => ({
    id: s.id,
    name: s.name,
    scope: s.scope,
    takeRateBps: s.takeRateBps,
    feeFloorCents: s.feeFloorCents,
    feeCapCents: s.feeCapCents,
    version: s.version,
  }));
}

