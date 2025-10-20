import { Router } from 'express';
import { requireAdmin, auditAdminAction } from '../middleware/admin-auth';
import { systemHealth } from '../services/system-health';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();
// GET /api/admin/overview - Get all top KPIs and health checks
router.get('/overview', requireAdmin, async (req, res) => {
  try {
    // Simple test response first
    return res.json({
      success: true,
      data: {
        health: { overall: 'OK', summary: { ok: 1, warn: 0, crit: 0 } },
        metrics: {
          vendors: { total: 0, active: 0 },
          orders: { total: 0, pending: 0 },
          revenue: { total: 0, today: 0 },
          messages: { total: 0, unread: 0 }
        },
        topPerformers: { vendors: [] },
        recentActivity: []
      }
    });
    
    // Get system health status
    const healthStatus = await systemHealth.getSystemStatus();
    
    // Get key metrics
    const [
      totalVendors,
      activeVendors,
      totalOrders,
      pendingOrders,
      totalRevenue,
      todayRevenue,
      systemMessages,
      unreadMessages
    ] = await Promise.all([
      prisma.vendorProfile.count(),
      prisma.vendorProfile.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] } } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'COMPLETED' }
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { 
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.systemMessage.count(),
      prisma.systemMessage.count({ where: { readAt: null } })
    ]);

    // Get recent activity
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: {
          select: { storeName: true }
        },
        items: {
          take: 2,
          include: {
            product: {
              select: { name: true }
            }
          }
        }
      }
    });

    const recentVendors = await prisma.vendorProfile.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        storeName: true,
        city: true,
        state: true,
        createdAt: true
      }
    });

    // Get top performing vendors (by revenue)
    const topVendors = await prisma.vendorProfile.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }, // Placeholder - would need revenue calculation
      select: {
        id: true,
        storeName: true,
        city: true,
        state: true,
        ratingAvg: true,
        ratingCount: true
      }
    });

    return res.json({
      success: true,
      data: {
        health: healthStatus,
        metrics: {
          vendors: {
            total: totalVendors,
            active: activeVendors,
            pending: totalVendors - activeVendors
          },
          orders: {
            total: totalOrders,
            pending: pendingOrders,
            completed: totalOrders - pendingOrders
          },
          revenue: {
            total: totalRevenue._sum.totalAmount || 0,
            today: todayRevenue._sum.totalAmount || 0,
            currency: 'USD'
          },
          messages: {
            total: systemMessages,
            unread: unreadMessages
          }
        },
        recentActivity: {
          orders: recentOrders,
          vendors: recentVendors
        },
        topPerformers: {
          vendors: topVendors
        }
      }
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin overview'
    });
  }
});

// GET /api/admin/health - Get detailed system health
router.get('/health', requireAdmin, async (req, res) => {
  try {
    const healthStatus = await systemHealth.getSystemStatus();
    
    return res.json({
      success: true,
      data: healthStatus
    });
  } catch (error) {
    console.error('Admin health check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch system health'
    });
  }
});

// POST /api/admin/health/refresh - Trigger health check refresh
router.post('/health/refresh', requireAdmin, auditAdminAction('health.refresh'), async (req, res) => {
  try {
    const checks = await systemHealth.runAllChecks();
    
    return res.json({
      success: true,
      message: 'Health checks refreshed',
      data: { checks }
    });
  } catch (error) {
    console.error('Health refresh error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh health checks'
    });
  }
});

// GET /api/admin/audit - Get admin audit log
router.get('/audit', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const adminId = req.query.adminId as string;
    const action = req.query.action as string;
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (adminId) where.adminId = adminId;
    if (action) where.action = { contains: action };
    
    const [audits, total] = await Promise.all([
      prisma.adminAudit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.adminAudit.count({ where })
    ]);
    
    return res.json({
      success: true,
      data: {
        audits,
        pagination: {
          page,
          limit,
          total,
          pageCount: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Admin audit log error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch audit log'
    });
  }
});

// GET /api/admin/feature-flags - Get feature flags
router.get('/feature-flags', requireAdmin, async (req, res) => {
  try {
    const flags = await prisma.featureFlag.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    
    return res.json({
      success: true,
      data: { flags }
    });
  } catch (error) {
    console.error('Feature flags error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch feature flags'
    });
  }
});

// POST /api/admin/feature-flags - Create or update feature flag
router.post('/feature-flags', requireAdmin, auditAdminAction('feature-flag.update'), async (req, res) => {
  try {
    const { key, enabled, rules, notes } = req.body;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Feature flag key is required'
      });
    }
    
    const flag = await prisma.featureFlag.upsert({
      where: { key },
      update: {
        enabled: enabled ?? false,
        rules: rules || null,
        notes: notes || null,
        updatedAt: new Date()
      },
      create: {
        key,
        enabled: enabled ?? false,
        rules: rules || null,
        notes: notes || null
      }
    });
    
    return res.json({
      success: true,
      message: 'Feature flag updated',
      data: { flag }
    });
  } catch (error) {
    console.error('Feature flag update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update feature flag'
    });
  }
});

// GET /api/admin/incidents - Get incidents
router.get('/incidents', requireAdmin, async (req, res) => {
  try {
    const status = req.query.status as string;
    const severity = req.query.severity as string;
    
    const where: any = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    
    const incidents = await prisma.incident.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: 50
    });
    
    return res.json({
      success: true,
      data: { incidents }
    });
  } catch (error) {
    console.error('Incidents error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch incidents'
    });
  }
});

// POST /api/admin/incidents - Create incident
router.post('/incidents', requireAdmin, auditAdminAction('incident.create'), async (req, res) => {
  try {
    const { title, severity, affected, runbookId } = req.body;
    
    if (!title || !severity) {
      return res.status(400).json({
        success: false,
        message: 'Title and severity are required'
      });
    }
    
    const incident = await prisma.incident.create({
      data: {
        title,
        severity,
        status: 'OPEN',
        affected: affected || [],
        runbookId: runbookId || null,
        timeline: [{
          timestamp: new Date().toISOString(),
          action: 'created',
          user: req.admin?.email || 'unknown',
          message: 'Incident created'
        }]
      }
    });
    
    return res.json({
      success: true,
      message: 'Incident created',
      data: { incident }
    });
  } catch (error) {
    console.error('Incident creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create incident'
    });
  }
});

// PUT /api/admin/incidents/:id - Update incident
router.put('/incidents/:id', requireAdmin, auditAdminAction('incident.update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, timeline } = req.body;
    
    const incident = await prisma.incident.findUnique({
      where: { id }
    });
    
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }
    
    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'CLOSED') {
        updateData.endedAt = new Date();
      }
    }
    if (timeline) {
      updateData.timeline = timeline;
    }
    
    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: updateData
    });
    
    return res.json({
      success: true,
      message: 'Incident updated',
      data: { incident: updatedIncident }
    });
  } catch (error) {
    console.error('Incident update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update incident'
    });
  }
});

export default router;
