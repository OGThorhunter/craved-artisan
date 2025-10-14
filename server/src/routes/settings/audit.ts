import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { loadAccountContext, requireAccountContext, canViewSensitiveData } from '../../middleware/account-auth';
import { prisma } from '../../db';
import { logger } from '../../logger';

const router = Router();

// GET /api/settings/audit
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const { 
      entityType = '', 
      action = '', 
      q = '', 
      page = '1' 
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limit = 50;
    const offset = (pageNum - 1) * limit;

    const where: any = { accountId };
    
    if (entityType) {
      where.entityType = entityType;
    }
    
    if (action) {
      where.action = action;
    }

    if (q) {
      where.OR = [
        { action: { contains: q as string } },
        { entityType: { contains: q as string } },
        { entityId: { contains: q as string } }
      ];
    }

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        auditLogs,
        pagination: {
          page: pageNum,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error fetching audit logs');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// GET /api/settings/audit/export
export const exportAuditLogs = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const { entityType = '', action = '', q = '' } = req.query;

    const where: any = { accountId };
    
    if (entityType) {
      where.entityType = entityType;
    }
    
    if (action) {
      where.action = action;
    }

    if (q) {
      where.OR = [
        { action: { contains: q as string } },
        { entityType: { contains: q as string } },
        { entityId: { contains: q as string } }
      ];
    }

    const auditLogs = await prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Convert to CSV format
    const csvHeader = 'Date,Action,Entity Type,Entity ID,Actor,IP Address,User Agent\n';
    const csvRows = auditLogs.map(log => {
      const date = log.createdAt.toISOString();
      const action = log.action;
      const entityType = log.entityType;
      const entityId = log.entityId;
      const actor = `${log.actor.firstName} ${log.actor.lastName} (${log.actor.email})`;
      const ip = log.ip || '';
      const userAgent = log.userAgent || '';
      
      return `"${date}","${action}","${entityType}","${entityId}","${actor}","${ip}","${userAgent}"`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error exporting audit logs');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Apply middleware and routes
router.use(requireAuth);
router.use(loadAccountContext);
router.use(requireAccountContext);

router.get('/', canViewSensitiveData, getAuditLogs);
router.get('/export', canViewSensitiveData, exportAuditLogs);

export const auditRoutes = router;






















