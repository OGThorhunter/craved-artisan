import express, { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import {
  calculateKPIs,
  getRevenueTrend,
  getRevenueByRole,
  generateRevenueSnapshot,
} from '../services/revenue/revenueReports';
import {
  queryLedger,
  createAdjustment,
  getOrderLedgerEntries,
} from '../services/revenue/ledger';
import {
  getAllActiveFeeSchedules,
  getFeeScheduleHistory,
} from '../services/revenue/feeResolver';
import {
  calcPlatformFee,
  calcProcessingFee,
} from '../services/revenue/feeCalculator';
import {
  getActivePromos,
  createPromo,
} from '../services/revenue/promoEngine';
import {
  runFullSync,
} from '../services/revenue/stripeSync';
import { FeeScope, PromoScope, LedgerType } from '@prisma/client';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const router = express.Router();

// Middleware to check if user is super admin
function isSuperAdmin(req: Request, res: Response, next: any) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user has ADMIN role
  const user = req.user as any;
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  next();
}

// Apply auth middleware to all routes
router.use(requireAuth);
router.use(isSuperAdmin);

/**
 * GET /api/admin/revenue/overview
 * Get revenue KPIs and trend data
 */
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const { from, to, groupBy = 'daily' } = req.query;

    const fromDate = from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to as string) : new Date();

    const [kpis, trend, revenueByRole] = await Promise.all([
      calculateKPIs(fromDate, toDate, 'accrual'),
      getRevenueTrend(fromDate, toDate, groupBy as any),
      getRevenueByRole(fromDate, toDate),
    ]);

    logger.info('Revenue overview fetched', { fromDate, toDate });

    res.json({
      kpis,
      trend,
      revenueByRole,
      period: { from: fromDate, to: toDate },
    });
  } catch (error: any) {
    logger.error('Error fetching revenue overview', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch revenue overview' });
  }
});

/**
 * GET /api/admin/revenue/ledger
 * Get paginated ledger with filters
 */
router.get('/ledger', async (req: Request, res: Response) => {
  try {
    const {
      type,
      userId,
      orderId,
      fromDate,
      toDate,
      page = '1',
      limit = '50',
    } = req.query;

    const filters: any = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    if (type) {
      if (Array.isArray(type)) {
        filters.type = type as LedgerType[];
      } else {
        filters.type = type as LedgerType;
      }
    }

    if (userId) filters.userId = userId as string;
    if (orderId) filters.orderId = orderId as string;
    if (fromDate) filters.fromDate = new Date(fromDate as string);
    if (toDate) filters.toDate = new Date(toDate as string);

    const result = await queryLedger(filters);

    logger.info('Ledger fetched', { filters, count: result.entries.length });

    res.json(result);
  } catch (error: any) {
    logger.error('Error fetching ledger', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch ledger' });
  }
});

/**
 * POST /api/admin/revenue/adjustments
 * Create manual adjustment
 */
router.post('/adjustments', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      amountCents: z.number(),
      reason: z.string(),
      orderId: z.string(),
      metadata: z.record(z.any()).optional(),
    });

    const data = schema.parse(req.body);
    const adminId = (req.user as any).id;

    const result = await createAdjustment(
      data.amountCents,
      data.reason,
      data.orderId,
      adminId,
      data.metadata
    );

    logger.info('Adjustment created', {
      adjustmentId: result.id,
      orderId: data.orderId,
      adminId,
    });

    res.json({ id: result.id, success: true });
  } catch (error: any) {
    logger.error('Error creating adjustment', { error: error.message });
    res.status(500).json({ error: 'Failed to create adjustment' });
  }
});

/**
 * GET /api/admin/revenue/fees/schedules
 * List all active fee schedules
 */
router.get('/fees/schedules', async (req: Request, res: Response) => {
  try {
    const schedules = await getAllActiveFeeSchedules();

    logger.info('Fee schedules fetched', { count: schedules.length });

    res.json({ schedules });
  } catch (error: any) {
    logger.error('Error fetching fee schedules', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch fee schedules' });
  }
});

/**
 * POST /api/admin/revenue/fees/schedules
 * Create new fee schedule version
 */
router.post('/fees/schedules', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string(),
      scope: z.enum(['GLOBAL', 'ROLE', 'VENDOR', 'EVENT', 'CATEGORY', 'ORDER']),
      scopeRefId: z.string().optional(),
      takeRateBps: z.number().optional(),
      feeFloorCents: z.number().optional(),
      feeCapCents: z.number().optional(),
      activeFrom: z.string(),
      activeTo: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const adminId = (req.user as any).id;

    // Get the next version number for this scope
    const existing = await prisma.feeSchedule.findFirst({
      where: {
        scope: data.scope as FeeScope,
        scopeRefId: data.scopeRefId || null,
      },
      orderBy: { version: 'desc' },
    });

    const nextVersion = (existing?.version || 0) + 1;

    const schedule = await prisma.feeSchedule.create({
      data: {
        name: data.name,
        scope: data.scope as FeeScope,
        scopeRefId: data.scopeRefId || null,
        takeRateBps: data.takeRateBps || null,
        feeFloorCents: data.feeFloorCents || null,
        feeCapCents: data.feeCapCents || null,
        activeFrom: new Date(data.activeFrom),
        activeTo: data.activeTo ? new Date(data.activeTo) : null,
        createdById: adminId,
        version: nextVersion,
      },
    });

    logger.info('Fee schedule created', {
      scheduleId: schedule.id,
      version: nextVersion,
      adminId,
    });

    res.json({ schedule });
  } catch (error: any) {
    logger.error('Error creating fee schedule', { error: error.message });
    res.status(500).json({ error: 'Failed to create fee schedule' });
  }
});

/**
 * GET /api/admin/revenue/fees/preview
 * Preview fee change impact
 */
router.get('/fees/preview', async (req: Request, res: Response) => {
  try {
    const { takeRateBps, feeFloorCents, feeCapCents } = req.query;

    // Get recent orders to preview impact
    const recentOrders = await prisma.order.findMany({
      where: {
        status: 'PAID',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    const preview = recentOrders.map((order) => {
      const subtotalCents = Math.round((order.total - order.tax) * 100);
      
      // Calculate with new rate
      const rawFee = Math.round(
        (subtotalCents * parseInt(takeRateBps as string || '1000')) / 10000
      );
      const withFloor = Math.max(
        rawFee,
        parseInt(feeFloorCents as string || '0')
      );
      const withCap = feeCapCents
        ? Math.min(withFloor, parseInt(feeCapCents as string))
        : withFloor;

      return {
        orderId: order.id,
        orderTotal: subtotalCents,
        newFee: withCap,
      };
    });

    const estimatedDelta = preview.reduce((sum, p) => sum + p.newFee, 0);

    logger.info('Fee preview generated', {
      ordersAnalyzed: preview.length,
      estimatedDelta,
    });

    res.json({
      preview: preview.slice(0, 10), // Return sample
      estimatedDelta,
      ordersAnalyzed: preview.length,
    });
  } catch (error: any) {
    logger.error('Error generating fee preview', { error: error.message });
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

/**
 * GET /api/admin/revenue/promos
 * List active promos
 */
router.get('/promos', async (req: Request, res: Response) => {
  try {
    const { appliesTo } = req.query;

    const promos = await getActivePromos(
      appliesTo ? (appliesTo as PromoScope) : undefined
    );

    logger.info('Promos fetched', { count: promos.length });

    res.json({ promos });
  } catch (error: any) {
    logger.error('Error fetching promos', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch promos' });
  }
});

/**
 * POST /api/admin/revenue/promos
 * Create new promo/credit
 */
router.post('/promos', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      code: z.string(),
      appliesTo: z.enum(['PLATFORM_FEE', 'SUBSCRIPTION', 'EVENT']),
      percentOffBps: z.number().optional(),
      amountOffCents: z.number().optional(),
      startsAt: z.string(),
      endsAt: z.string().optional(),
      audienceTag: z.string().optional(),
      maxRedemptions: z.number().optional(),
    });

    const data = schema.parse(req.body);

    const promo = await createPromo({
      ...data,
      appliesTo: data.appliesTo as PromoScope,
      startsAt: new Date(data.startsAt),
      endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
    });

    logger.info('Promo created', { promoId: promo.id, code: promo.code });

    res.json({ promo });
  } catch (error: any) {
    logger.error('Error creating promo', { error: error.message });
    res.status(500).json({ error: 'Failed to create promo' });
  }
});

/**
 * POST /api/admin/revenue/recalc/:orderId
 * Recalculate fees for an order and post adjustment
 */
router.post('/recalc/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const adminId = (req.user as any).id;

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get existing fee entries
    const existingEntries = await getOrderLedgerEntries(orderId);
    const existingFee = existingEntries
      .filter((e) => e.type === 'ORDER_FEE')
      .reduce((sum, e) => sum + e.amountCents, 0);

    // Recalculate with current fee schedule
    const subtotalCents = Math.round((order.total - order.tax) * 100);
    const vendorId = order.orderItems[0]?.vendorProfileId;

    const feeResult = await calcPlatformFee(subtotalCents, {
      orderId: order.id,
      vendorId,
      orderDate: order.createdAt,
    });

    if (!feeResult) {
      return res.status(400).json({ error: 'Could not calculate fee' });
    }

    const newFee = feeResult.effective;
    const delta = newFee - existingFee;

    if (delta !== 0) {
      // Create adjustment
      await createAdjustment(
        delta,
        `Fee recalculation: ${existingFee} -> ${newFee}`,
        orderId,
        adminId,
        {
          oldFee: existingFee,
          newFee,
          scheduleId: feeResult.scheduleId,
          scheduleVersion: feeResult.scheduleVersion,
        }
      );
    }

    logger.info('Fee recalculated', {
      orderId,
      existingFee,
      newFee,
      delta,
      adminId,
    });

    res.json({
      existingFee,
      newFee,
      delta,
      adjustmentCreated: delta !== 0,
    });
  } catch (error: any) {
    logger.error('Error recalculating fee', { error: error.message });
    res.status(500).json({ error: 'Failed to recalculate fee' });
  }
});

/**
 * GET /api/admin/revenue/payouts
 * List payouts with status
 */
router.get('/payouts', async (req: Request, res: Response) => {
  try {
    const { status, userId, page = '1', limit = '50' } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [payouts, total] = await Promise.all([
      prisma.revenuePayout.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.revenuePayout.count({ where }),
    ]);

    logger.info('Payouts fetched', { count: payouts.length, total });

    res.json({
      payouts,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    logger.error('Error fetching payouts', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

/**
 * POST /api/admin/revenue/payouts/sync
 * Sync payouts from Stripe
 */
router.post('/payouts/sync', async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate } = req.body;

    const result = await runFullSync(
      fromDate ? new Date(fromDate) : undefined,
      toDate ? new Date(toDate) : undefined
    );

    logger.info('Stripe sync completed', result);

    res.json({ success: true, synced: result });
  } catch (error: any) {
    logger.error('Error syncing Stripe data', { error: error.message });
    res.status(500).json({ error: 'Failed to sync Stripe data' });
  }
});

/**
 * POST /api/admin/revenue/snapshots/generate
 * Generate revenue snapshot for a date
 */
router.post('/snapshots/generate', async (req: Request, res: Response) => {
  try {
    const { date } = req.body;
    const snapshotDate = date ? new Date(date) : new Date();

    await generateRevenueSnapshot(snapshotDate);

    logger.info('Revenue snapshot generated', { date: snapshotDate });

    res.json({ success: true, date: snapshotDate });
  } catch (error: any) {
    logger.error('Error generating snapshot', { error: error.message });
    res.status(500).json({ error: 'Failed to generate snapshot' });
  }
});

export default router;

