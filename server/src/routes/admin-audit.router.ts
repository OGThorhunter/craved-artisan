import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';
import { prisma } from '../db';
import { logger } from '../logger';
import { AuditScope, Severity } from '@prisma/client';

const router = Router();

// Validation schemas
const listAuditEventsSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  scope: z.nativeEnum(AuditScope).optional(),
  action: z.string().optional(),
  actorId: z.string().optional(),
  targetType: z.string().optional(),
  targetId: z.string().optional(),
  severity: z.nativeEnum(Severity).optional(),
  requestId: z.string().optional(),
  traceId: z.string().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('50'),
});

const exportAuditEventsSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  scope: z.nativeEnum(AuditScope).optional(),
  action: z.string().optional(),
  format: z.enum(['csv', 'jsonl']).optional().default('csv'),
});

const verifyChainSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  tenantId: z.string().optional(),
});

// GET /api/admin/audit - List audit events with filters
export const listAuditEvents = async (req: Request, res: Response) => {
  try {
    const {
      from,
      to,
      scope,
      action,
      actorId,
      targetType,
      targetId,
      severity,
      requestId,
      traceId,
      page,
      limit,
    } = req.query;

    const pageNum = parseInt(page as string || '1');
    const limitNum = parseInt(limit as string || '50');
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (from || to) {
      where.occurredAt = {};
      if (from) where.occurredAt.gte = new Date(from as string);
      if (to) where.occurredAt.lte = new Date(to as string);
    }

    if (scope) where.scope = scope;
    if (action) where.action = action;
    if (actorId) where.actorId = actorId;
    if (targetType) where.targetType = targetType;
    if (targetId) where.targetId = targetId;
    if (severity) where.severity = severity;
    if (requestId) where.requestId = requestId;
    if (traceId) where.traceId = traceId;

    const [events, total] = await Promise.all([
      prisma.auditEvent.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { occurredAt: 'desc' },
        skip: offset,
        take: limitNum,
      }),
      prisma.auditEvent.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error listing audit events');
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// GET /api/admin/audit/:id - Get single event with related events
export const getAuditEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await prisma.auditEvent.findUnique({
      where: { id },
      include: {
        actor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Audit event not found',
      });
    }

    // Fetch related events in the same request
    const relatedEvents = event.requestId
      ? await prisma.auditEvent.findMany({
          where: {
            requestId: event.requestId,
            id: { not: event.id },
          },
          include: {
            actor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { occurredAt: 'asc' },
          take: 20,
        })
      : [];

    res.json({
      success: true,
      data: {
        event,
        relatedEvents,
      },
    });
  } catch (error) {
    logger.error({ error, eventId: req.params.id }, 'Error fetching audit event');
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// POST /api/admin/audit/export - Export audit events
export const exportAuditEvents = async (req: Request, res: Response) => {
  try {
    const { from, to, scope, action, format } = req.body;

    // Build where clause
    const where: any = {};
    if (from || to) {
      where.occurredAt = {};
      if (from) where.occurredAt.gte = new Date(from);
      if (to) where.occurredAt.lte = new Date(to);
    }
    if (scope) where.scope = scope;
    if (action) where.action = action;

    const events = await prisma.auditEvent.findMany({
      where,
      include: {
        actor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { occurredAt: 'desc' },
      take: 10000, // Limit to prevent memory issues
    });

    if (format === 'csv') {
      // Generate CSV
      const csvHeader =
        'Timestamp,Scope,Action,Actor,Target Type,Target ID,Severity,Reason,IP,User Agent,Request ID\n';
      const csvRows = events
        .map((event) => {
          const timestamp = event.occurredAt.toISOString();
          const actorName = event.actor
            ? `${event.actor.firstName} ${event.actor.lastName} (${event.actor.email})`
            : 'SYSTEM';
          return `"${timestamp}","${event.scope}","${event.action}","${actorName}","${event.targetType || ''}","${event.targetId || ''}","${event.severity}","${event.reason || ''}","${event.actorIp || ''}","${event.actorUa || ''}","${event.requestId || ''}"`;
        })
        .join('\n');

      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="audit-export-${new Date().toISOString().split('T')[0]}.csv"`
      );
      res.send(csvContent);
    } else {
      // Generate JSONL
      const jsonlContent = events.map((event) => JSON.stringify(event)).join('\n');

      res.setHeader('Content-Type', 'application/x-ndjson');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="audit-export-${new Date().toISOString().split('T')[0]}.jsonl"`
      );
      res.send(jsonlContent);
    }
  } catch (error) {
    logger.error({ error }, 'Error exporting audit events');
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// POST /api/admin/audit/verify - Verify hash chain integrity
export const verifyChain = async (req: Request, res: Response) => {
  try {
    const { from, to, tenantId } = req.body;

    // Build where clause
    const where: any = {};
    if (from || to) {
      where.occurredAt = {};
      if (from) where.occurredAt.gte = new Date(from);
      if (to) where.occurredAt.lte = new Date(to);
    }
    if (tenantId) where.tenantId = tenantId;

    // Fetch events in order
    const events = await prisma.auditEvent.findMany({
      where,
      orderBy: { occurredAt: 'asc' },
      select: {
        id: true,
        occurredAt: true,
        actorId: true,
        actorType: true,
        requestId: true,
        scope: true,
        action: true,
        targetType: true,
        targetId: true,
        reason: true,
        severity: true,
        diffBefore: true,
        diffAfter: true,
        metadata: true,
        prevHash: true,
        selfHash: true,
      },
    });

    let isValid = true;
    let firstBreakId: string | null = null;
    let checkedCount = 0;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const prevEvent = i > 0 ? events[i - 1] : null;

      // Verify prevHash matches previous event's selfHash
      if (prevEvent && event.prevHash !== prevEvent.selfHash) {
        isValid = false;
        firstBreakId = event.id;
        break;
      }

      // Verify selfHash is correct
      const { createHash } = await import('crypto');
      const canonicalPayload = JSON.stringify({
        occurredAt: event.occurredAt,
        actorId: event.actorId,
        actorType: event.actorType,
        requestId: event.requestId,
        scope: event.scope,
        action: event.action,
        targetType: event.targetType,
        targetId: event.targetId,
        reason: event.reason,
        severity: event.severity,
        diffBefore: event.diffBefore,
        diffAfter: event.diffAfter,
        metadata: event.metadata,
        prevHash: event.prevHash,
      });
      const computedHash = createHash('sha256').update(canonicalPayload).digest('base64');

      if (computedHash !== event.selfHash) {
        isValid = false;
        firstBreakId = event.id;
        break;
      }

      checkedCount++;
    }

    res.json({
      success: true,
      data: {
        isValid,
        checkedCount,
        totalCount: events.length,
        firstBreakId,
        message: isValid
          ? 'Chain integrity verified successfully'
          : `Chain broken at event ${firstBreakId}`,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error verifying audit chain');
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Apply routes
router.use(requireAuth);

// TODO: Add proper admin permission checks
router.get('/', listAuditEvents);
router.get('/:id', getAuditEvent);
router.post('/export', validateRequest(exportAuditEventsSchema), exportAuditEvents);
router.post('/verify', validateRequest(verifyChainSchema), verifyChain);

export default router;

