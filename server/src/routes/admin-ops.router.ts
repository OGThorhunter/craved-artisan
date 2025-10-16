import { Router } from 'express';
import { requireAdmin, requireSuperAdmin, auditAdminAction } from '../middleware/admin-auth';
import { queueMonitor } from '../services/queue-monitor';
import { dbHealthMonitor } from '../services/db-health';
import { redisCacheService } from '../services/redis-cache.service';
import { emailHealthService } from '../services/email-health.service';
import { costTrackingService } from '../services/cost-tracking.service';
import { webhookManagementService } from '../services/webhook-management.service';
import { searchIndexService } from '../services/search-index.service';
import { logsTracesService } from '../services/logs-traces.service';
import { incidentManagementService } from '../services/incident-management.service';
import { featureFlagsService } from '../services/feature-flags.service';
import { maintenanceModeService } from '../services/maintenance-mode.service';
import { deploymentTrackingService } from '../services/deployment-tracking.service';
import { runbooksService } from '../services/runbooks.service';
import { logger } from '../logger';
import { prisma } from '../db';
import { z } from 'zod';

const router = Router();

// Validation schemas
const queueActionSchema = z.object({
  queueName: z.string(),
  action: z.enum(['pause', 'resume', 'retry', 'remove']),
  jobId: z.string().optional()
});

const maintenanceSchema = z.object({
  action: z.enum(['vacuum', 'analyze', 'reindex']),
  tableName: z.string().optional()
});

// GET /api/admin/ops/queues - Get queue statistics
router.get('/ops/queues', requireAdmin, async (req, res) => {
  try {
    const [queueStats, queueHealth] = await Promise.all([
      queueMonitor.getQueueStats(),
      queueMonitor.getQueueHealth()
    ]);
    
    return res.json({
      success: true,
      data: {
        queues: queueStats,
        health: queueHealth
      }
    });
  } catch (error) {
    console.error('Queue stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch queue statistics'
    });
  }
});

// GET /api/admin/ops/queues/:name/jobs - Get failed jobs for a queue
router.get('/ops/queues/:name/jobs', requireAdmin, async (req, res) => {
  try {
    const { name } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const failedJobs = await queueMonitor.getFailedJobs(name, limit);
    
    return res.json({
      success: true,
      data: { failedJobs, queueName: name }
    });
  } catch (error) {
    console.error('Failed jobs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch failed jobs'
    });
  }
});

// GET /api/admin/ops/queues/:name/performance - Get queue performance data
router.get('/ops/queues/:name/performance', requireAdmin, async (req, res) => {
  try {
    const { name } = req.params;
    const hours = parseInt(req.query.hours as string) || 24;
    
    const performance = await queueMonitor.getQueuePerformance(name, hours);
    
    return res.json({
      success: true,
      data: { performance, queueName: name, hours }
    });
  } catch (error) {
    console.error('Queue performance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch queue performance'
    });
  }
});

// POST /api/admin/ops/queues/action - Perform queue action
router.post('/ops/queues/action', requireAdmin, auditAdminAction('queue.action'), async (req, res) => {
  try {
    const { queueName, action, jobId } = queueActionSchema.parse(req.body);
    
    let success = false;
    
    switch (action) {
      case 'pause':
        success = await queueMonitor.toggleQueuePause(queueName, true);
        break;
      case 'resume':
        success = await queueMonitor.toggleQueuePause(queueName, false);
        break;
      case 'retry':
        if (!jobId) {
          return res.status(400).json({
            success: false,
            message: 'Job ID required for retry action'
          });
        }
        success = await queueMonitor.retryJob(queueName, jobId);
        break;
      case 'remove':
        if (!jobId) {
          return res.status(400).json({
            success: false,
            message: 'Job ID required for remove action'
          });
        }
        success = await queueMonitor.removeJob(queueName, jobId);
        break;
    }
    
    if (success) {
      return res.json({
        success: true,
        message: `Queue action ${action} completed successfully`
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Failed to perform ${action} action`
      });
    }
  } catch (error) {
    console.error('Queue action error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to perform queue action'
    });
  }
});

// GET /api/admin/ops/db/health - Get database health
router.get('/ops/db/health', requireAdmin, async (req, res) => {
  try {
    const [dbStats, dbHealth, vectorStats] = await Promise.all([
      dbHealthMonitor.getDatabaseStats(),
      dbHealthMonitor.getDatabaseHealth(),
      dbHealthMonitor.getVectorStats()
    ]);
    
    return res.json({
      success: true,
      data: {
        stats: dbStats,
        health: dbHealth,
        vector: vectorStats
      }
    });
  } catch (error) {
    console.error('Database health error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch database health'
    });
  }
});

// GET /api/admin/ops/db/tables - Get table statistics
router.get('/ops/db/tables', requireAdmin, async (req, res) => {
  try {
    const dbStats = await dbHealthMonitor.getDatabaseStats();
    
    return res.json({
      success: true,
      data: {
        tables: dbStats.tableStats,
        indexes: dbStats.indexStats
      }
    });
  } catch (error) {
    console.error('Database tables error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch table statistics'
    });
  }
});

// GET /api/admin/ops/db/queries - Get slow queries
router.get('/ops/db/queries', requireAdmin, async (req, res) => {
  try {
    const dbStats = await dbHealthMonitor.getDatabaseStats();
    
    return res.json({
      success: true,
      data: {
        slowQueries: dbStats.slowestQueries
      }
    });
  } catch (error) {
    console.error('Slow queries error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch slow queries'
    });
  }
});

// POST /api/admin/ops/db/maintenance - Trigger database maintenance
router.post('/ops/db/maintenance', requireAdmin, auditAdminAction('db.maintenance'), async (req, res) => {
  try {
    const { action, tableName } = maintenanceSchema.parse(req.body);
    
    const success = await dbHealthMonitor.triggerMaintenance(action, tableName);
    
    if (success) {
      return res.json({
        success: true,
        message: `Database maintenance ${action} completed successfully`
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Failed to perform ${action} maintenance`
      });
    }
  } catch (error) {
    console.error('Database maintenance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to perform database maintenance'
    });
  }
});

// GET /api/admin/ops/vector/health - Get vector database health
router.get('/ops/vector/health', requireAdmin, async (req, res) => {
  try {
    const vectorStats = await dbHealthMonitor.getVectorStats();
    
    return res.json({
      success: true,
      data: vectorStats
    });
  } catch (error) {
    console.error('Vector health error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vector health'
    });
  }
});

// ================================
// HEALTH & INCIDENTS
// ================================

// GET /api/admin/ops/health - All KPI cards
router.get('/ops/health', requireAdmin, async (req, res) => {
  try {
    // Try each service individually to identify which one is failing
    let queueHealth, dbHealth, emailHealth, incidentStats, cacheStats;
    
    try {
      queueHealth = await queueMonitor.getQueueHealth();
    } catch (error) {
      logger.error('Queue health check failed:', error);
      queueHealth = { status: 'CRIT', totalQueues: 0, healthyQueues: 0, warningQueues: 0, criticalQueues: 0, totalJobs: 0, failedJobs: 0, avgWaitTime: 0 };
    }

    try {
      dbHealth = await dbHealthMonitor.getDatabaseHealth();
    } catch (error) {
      logger.error('Database health check failed:', error);
      dbHealth = { status: 'CRIT', connectionHealth: 'CRIT', cacheHealth: 'CRIT', queryHealth: 'CRIT', summary: { connections: 0, cacheHitRatio: 0, slowQueries: 0, deadlocks: 0 } };
    }

    try {
      emailHealth = await emailHealthService.getOverallEmailHealth();
    } catch (error) {
      logger.error('Email health check failed:', error);
      emailHealth = { status: 'CRIT', providers: [] };
    }

    try {
      incidentStats = await incidentManagementService.getIncidentStats();
    } catch (error) {
      logger.error('Incident stats check failed:', error);
      incidentStats = { openCount: 0, mitigatedCount: 0, closedLast30Days: 0, mttr: 0, severity: { sev1: 0, sev2: 0, sev3: 0, sev4: 0 } };
    }

    try {
      cacheStats = await redisCacheService.getMemoryStats();
    } catch (error) {
      logger.error('Cache stats check failed:', error);
      cacheStats = { usedMemory: 0, maxMemory: 0, usedMemoryPercent: 0, evictedKeys: 0, hitRate: 0, missRate: 0 };
    }

    return res.json({
      success: true,
      data: {
        api: {
          status: 'OK', // Would come from actual monitoring
          latencyP95: 245,
          errorRate: 0.05,
          throughput: 1523
        },
        queue: queueHealth,
        database: dbHealth,
        cache: {
          status: cacheStats.usedMemoryPercent > 90 ? 'CRIT' : cacheStats.usedMemoryPercent > 75 ? 'WARN' : 'OK',
          hitRate: cacheStats.hitRate,
          usedMemoryPercent: cacheStats.usedMemoryPercent
        },
        email: emailHealth,
        incidents: {
          open: incidentStats.openCount,
          mitigated: incidentStats.mitigatedCount,
          mttr: incidentStats.mttr
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get health overview:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch health data' });
  }
});

// GET /api/admin/ops/incidents - List incidents
router.get('/ops/incidents', requireAdmin, async (req, res) => {
  try {
    const active = req.query.active === 'true';
    const incidents = active 
      ? await incidentManagementService.listActiveIncidents()
      : await incidentManagementService.listRecentIncidents();

    return res.json({ success: true, data: incidents });
  } catch (error) {
    logger.error('Failed to list incidents:', error);
    return res.status(500).json({ success: false, message: 'Failed to list incidents' });
  }
});

// POST /api/admin/ops/incidents - Create incident
router.post('/ops/incidents', requireAdmin, auditAdminAction('INCIDENT_CREATED'), async (req, res) => {
  try {
    const { title, severity, summary, affected } = req.body;
    
    if (!title || !severity) {
      return res.status(400).json({ success: false, message: 'Title and severity required' });
    }

    const incident = await incidentManagementService.createIncident({
      title,
      severity,
      summary,
      affected
    }, req.admin!.id);

    logger.info({ incidentId: incident.id, severity }, 'Incident created via ops dashboard');

    return res.json({ success: true, data: incident });
  } catch (error) {
    logger.error('Failed to create incident:', error);
    return res.status(500).json({ success: false, message: 'Failed to create incident' });
  }
});

// PATCH /api/admin/ops/incidents/:id - Update incident
router.patch('/ops/incidents/:id', requireAdmin, auditAdminAction('INCIDENT_STATUS_CHANGED'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const incident = await incidentManagementService.updateIncident(id, updates, req.admin!.id);

    logger.info({ incidentId: id, updates }, 'Incident updated');

    return res.json({ success: true, data: incident });
  } catch (error) {
    logger.error('Failed to update incident:', error);
    return res.status(500).json({ success: false, message: 'Failed to update incident' });
  }
});

// POST /api/admin/ops/incidents/:id/timeline - Add timeline entry (Legacy)
router.post('/ops/incidents/:id/timeline', requireAdmin, auditAdminAction('INCIDENT_TIMELINE_ADDED'), async (req, res) => {
  try {
    const { id } = req.params;
    const { type, message } = req.body;

    await incidentManagementService.addTimelineEntry(id, {
      type,
      message,
      actorId: req.admin!.id
    });

    return res.json({ success: true, message: 'Timeline entry added' });
  } catch (error) {
    logger.error('Failed to add timeline entry:', error);
    return res.status(500).json({ success: false, message: 'Failed to add timeline entry' });
  }
});

// GET /api/admin/ops/incidents/kpis - Get incident KPIs
router.get('/ops/incidents/kpis', requireAdmin, async (req, res) => {
  try {
    const kpis = await incidentManagementService.getIncidentKPIs();
    return res.json({ success: true, data: kpis });
  } catch (error) {
    logger.error('Failed to get incident KPIs:', error);
    return res.status(500).json({ success: false, message: 'Failed to get KPIs' });
  }
});

// GET /api/admin/ops/incidents/search - Search incidents with filters
router.get('/ops/incidents/search', requireAdmin, async (req, res) => {
  try {
    const filters: any = {};
    
    if (req.query.status) filters.status = (req.query.status as string).split(',');
    if (req.query.severity) filters.severity = (req.query.severity as string).split(',');
    if (req.query.ownerId) filters.ownerId = req.query.ownerId as string;
    if (req.query.services) filters.services = (req.query.services as string).split(',');
    if (req.query.tags) filters.tags = (req.query.tags as string).split(',');
    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
    if (req.query.hasPostmortem !== undefined) filters.hasPostmortem = req.query.hasPostmortem === 'true';

    const incidents = await incidentManagementService.searchIncidents(filters);
    return res.json({ success: true, data: incidents });
  } catch (error) {
    logger.error('Failed to search incidents:', error);
    return res.json({ success: false, message: 'Failed to search incidents' });
  }
});

// GET /api/admin/ops/incidents/:id/events - Get incident events
router.get('/ops/incidents/:id/events', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const events = await incidentManagementService.getEvents(id);
    return res.json({ success: true, data: events });
  } catch (error) {
    logger.error('Failed to get incident events:', error);
    return res.status(500).json({ success: false, message: 'Failed to get events' });
  }
});

// POST /api/admin/ops/incidents/:id/events - Add event to incident
router.post('/ops/incidents/:id/events', requireAdmin, auditAdminAction('INCIDENT_EVENT_ADDED'), async (req, res) => {
  try {
    const { id } = req.params;
    const { type, summary, details, attachments } = req.body;

    if (!type || !summary) {
      return res.status(400).json({ success: false, message: 'Type and summary required' });
    }

    const event = await incidentManagementService.addEvent(id, {
      type,
      summary,
      details,
      attachments
    }, req.admin!.id);

    logger.info({ incidentId: id, eventType: type }, 'Incident event added');

    return res.json({ success: true, data: event });
  } catch (error) {
    logger.error('Failed to add incident event:', error);
    return res.status(500).json({ success: false, message: 'Failed to add event' });
  }
});

// POST /api/admin/ops/incidents/:id/reopen - Reopen closed incident
router.post('/ops/incidents/:id/reopen', requireAdmin, auditAdminAction('INCIDENT_REOPENED'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason required' });
    }

    const incident = await incidentManagementService.reopenIncident(id, reason, req.admin!.id);

    logger.info({ incidentId: id, reason }, 'Incident reopened');

    return res.json({ success: true, data: incident });
  } catch (error) {
    logger.error('Failed to reopen incident:', error);
    return res.status(500).json({ success: false, message: 'Failed to reopen incident' });
  }
});

// POST /api/admin/ops/incidents/:id/postmortem - Save postmortem
router.post('/ops/incidents/:id/postmortem', requireAdmin, auditAdminAction('INCIDENT_POSTMORTEM_SAVED'), async (req, res) => {
  try {
    const { id } = req.params;
    const { whatHappened, rootCause, contributingFactors, lessonsLearned, actionItems } = req.body;

    const postmortem = await incidentManagementService.savePostmortem(id, {
      whatHappened,
      rootCause,
      contributingFactors,
      lessonsLearned,
      actionItems
    }, req.admin!.id);

    logger.info({ incidentId: id, postmortemId: postmortem.id }, 'Post-mortem saved');

    return res.json({ success: true, data: postmortem });
  } catch (error) {
    logger.error('Failed to save postmortem:', error);
    return res.status(500).json({ success: false, message: 'Failed to save postmortem' });
  }
});

// ================================
// DEPLOYS & CONFIG
// ================================

// GET /api/admin/ops/deployment/current - Current build info
router.get('/ops/deployment/current', requireAdmin, async (req, res) => {
  try {
    const deployment = await deploymentTrackingService.getCurrentDeployment();
    return res.json({ success: true, data: deployment });
  } catch (error) {
    logger.error('Failed to get current deployment:', error);
    return res.status(500).json({ success: false, message: 'Failed to get deployment info' });
  }
});

// GET /api/admin/ops/deployment/history - Recent deployments
router.get('/ops/deployment/history', requireAdmin, async (req, res) => {
  try {
    const deployments = await deploymentTrackingService.getDeploymentHistory();
    return res.json({ success: true, data: deployments });
  } catch (error) {
    logger.error('Failed to get deployment history:', error);
    return res.status(500).json({ success: false, message: 'Failed to get deployment history' });
  }
});

// GET /api/admin/ops/config/env - Safe env vars snapshot
router.get('/ops/config/env', requireAdmin, async (req, res) => {
  try {
    // Return safe env variables (no secrets)
    const safeVars = {
      NODE_ENV: process.env.NODE_ENV,
      USE_BULLMQ: process.env.USE_BULLMQ,
      DATABASE_URL: process.env.DATABASE_URL ? '[REDACTED]' : 'not set',
      REDIS_URL: process.env.REDIS_URL ? '[REDACTED]' : 'not set',
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? '[REDACTED]' : 'not set',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? '[REDACTED]' : 'not set',
      CSP_MODE: process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV'
    };

    return res.json({ success: true, data: safeVars });
  } catch (error) {
    logger.error('Failed to get env config:', error);
    return res.status(500).json({ success: false, message: 'Failed to get config' });
  }
});

// POST /api/admin/ops/maintenance/toggle - Maintenance mode controls
router.post('/ops/maintenance/toggle', requireSuperAdmin, auditAdminAction('CONFIG_MAINTENANCE_MODE_TOGGLED'), async (req, res) => {
  try {
    const { type, enabled, reason } = req.body;

    if (!type || enabled === undefined || !reason) {
      return res.status(400).json({ success: false, message: 'Type, enabled, and reason required' });
    }

    let result;
    switch (type) {
      case 'GLOBAL_READONLY':
        result = await maintenanceModeService.toggleGlobalReadonly(enabled, reason, req.admin!.id);
        break;
      case 'VENDOR_READONLY':
        result = await maintenanceModeService.toggleVendorReadonly(enabled, reason, req.admin!.id);
        break;
      case 'QUEUE_DRAIN':
        result = await maintenanceModeService.toggleQueueDrain(enabled, reason, req.admin!.id);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid maintenance type' });
    }

    logger.warn({ type, enabled, reason }, 'Maintenance mode toggled');

    return res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Failed to toggle maintenance mode:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle maintenance mode' });
  }
});

// GET /api/admin/ops/maintenance/status - Get maintenance status
router.get('/ops/maintenance/status', requireAdmin, async (req, res) => {
  try {
    const status = await maintenanceModeService.getStatus();
    return res.json({ success: true, data: status });
  } catch (error) {
    logger.error('Failed to get maintenance status:', error);
    return res.status(500).json({ success: false, message: 'Failed to get maintenance status' });
  }
});

// GET /api/admin/ops/feature-flags - List flags
router.get('/ops/feature-flags', requireAdmin, async (req, res) => {
  try {
    const flags = await featureFlagsService.listFlags();
    return res.json({ success: true, data: flags });
  } catch (error) {
    logger.error('Failed to list feature flags:', error);
    return res.status(500).json({ success: false, message: 'Failed to list feature flags' });
  }
});

// PATCH /api/admin/ops/feature-flags/:key - Toggle/update flag
router.patch('/ops/feature-flags/:key', requireAdmin, auditAdminAction('CONFIG_FEATURE_FLAG_TOGGLED'), async (req, res) => {
  try {
    const { key } = req.params;
    const updates = req.body;

    const flag = await featureFlagsService.updateFlag(key, updates, req.admin!.id);

    logger.info({ key, updates }, 'Feature flag updated');

    return res.json({ success: true, data: flag });
  } catch (error) {
    logger.error('Failed to update feature flag:', error);
    return res.status(500).json({ success: false, message: 'Failed to update feature flag' });
  }
});

// ================================
// WEBHOOKS & INTEGRATIONS
// ================================

// GET /api/admin/ops/webhooks - List webhook endpoints
router.get('/ops/webhooks', requireAdmin, async (req, res) => {
  try {
    const endpoints = await webhookManagementService.listEndpoints();
    return res.json({ success: true, data: endpoints });
  } catch (error) {
    logger.error('Failed to list webhook endpoints:', error);
    return res.status(500).json({ success: false, message: 'Failed to list webhooks' });
  }
});

// GET /api/admin/ops/webhooks/:id/deliveries - Recent deliveries
router.get('/ops/webhooks/:id/deliveries', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deliveries = await webhookManagementService.getRecentDeliveries(id);
    return res.json({ success: true, data: deliveries });
  } catch (error) {
    logger.error('Failed to get webhook deliveries:', error);
    return res.status(500).json({ success: false, message: 'Failed to get deliveries' });
  }
});

// POST /api/admin/ops/webhooks/:id/replay - Replay failed delivery
router.post('/ops/webhooks/:id/replay', requireSuperAdmin, auditAdminAction('OPS_WEBHOOK_REPLAYED'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await webhookManagementService.replayDelivery(id);

    logger.info({ deliveryId: id }, 'Webhook delivery replayed');

    return res.json({ success: result.success, message: result.message });
  } catch (error) {
    logger.error('Failed to replay webhook:', error);
    return res.status(500).json({ success: false, message: 'Failed to replay webhook' });
  }
});

// POST /api/admin/ops/webhooks/:id/rotate-secret - Rotate secret
router.post('/ops/webhooks/:id/rotate-secret', requireSuperAdmin, auditAdminAction('OPS_SECRET_ROTATED'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await webhookManagementService.rotateSecret(id);

    logger.warn({ endpointId: id }, 'Webhook secret rotated');

    return res.json({ success: result.success, data: result });
  } catch (error) {
    logger.error('Failed to rotate webhook secret:', error);
    return res.status(500).json({ success: false, message: 'Failed to rotate secret' });
  }
});

// ================================
// CACHE & SEARCH
// ================================

// GET /api/admin/ops/cache - Redis overview + namespaces
router.get('/ops/cache', requireAdmin, async (req, res) => {
  try {
    const [stats, namespaces] = await Promise.all([
      redisCacheService.getMemoryStats(),
      redisCacheService.getNamespaces()
    ]);

    return res.json({ success: true, data: { stats, namespaces } });
  } catch (error) {
    logger.error('Failed to get cache overview:', error);
    return res.status(500).json({ success: false, message: 'Failed to get cache data' });
  }
});

// GET /api/admin/ops/cache/namespaces/:ns/keys - Browse keys
router.get('/ops/cache/namespaces/:ns/keys', requireAdmin, async (req, res) => {
  try {
    const { ns } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const keys = await redisCacheService.getKeysInNamespace(ns, limit);
    return res.json({ success: true, data: keys });
  } catch (error) {
    logger.error('Failed to get namespace keys:', error);
    return res.status(500).json({ success: false, message: 'Failed to get keys' });
  }
});

// GET /api/admin/ops/cache/keys/:key - Preview key value
router.get('/ops/cache/keys/:key', requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const value = await redisCacheService.getKeyValue(key);
    return res.json({ success: true, data: value });
  } catch (error) {
    logger.error('Failed to get key value:', error);
    return res.status(500).json({ success: false, message: 'Failed to get key value' });
  }
});

// POST /api/admin/ops/cache/flush - Flush namespace
router.post('/ops/cache/flush', requireSuperAdmin, auditAdminAction('OPS_CACHE_FLUSHED'), async (req, res) => {
  try {
    const { namespace, reason } = req.body;

    if (!namespace || !reason) {
      return res.status(400).json({ success: false, message: 'Namespace and reason required' });
    }

    const deleted = await redisCacheService.flushNamespace(namespace, reason);

    logger.warn({ namespace, deleted, reason }, 'Cache namespace flushed');

    return res.json({ success: true, data: { deleted } });
  } catch (error) {
    logger.error('Failed to flush cache:', error);
    return res.status(500).json({ success: false, message: 'Failed to flush cache' });
  }
});

// GET /api/admin/ops/search/stats - Search index stats
router.get('/ops/search/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await searchIndexService.getIndexStats();
    return res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Failed to get search stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to get search stats' });
  }
});

// POST /api/admin/ops/search/rebuild - Rebuild index
router.post('/ops/search/rebuild', requireSuperAdmin, auditAdminAction('OPS_SEARCH_REINDEXED'), async (req, res) => {
  try {
    const result = await searchIndexService.rebuildIndex();

    logger.info({ result }, 'Search index rebuilt');

    return res.json({ success: result.success, data: result });
  } catch (error) {
    logger.error('Failed to rebuild search index:', error);
    return res.status(500).json({ success: false, message: 'Failed to rebuild index' });
  }
});

// POST /api/admin/ops/search/refresh - Partial refresh
router.post('/ops/search/refresh', requireAdmin, auditAdminAction('OPS_SEARCH_REINDEXED'), async (req, res) => {
  try {
    const result = await searchIndexService.refreshIndex();
    return res.json({ success: result.success, data: result });
  } catch (error) {
    logger.error('Failed to refresh search index:', error);
    return res.status(500).json({ success: false, message: 'Failed to refresh index' });
  }
});

// ================================
// LOGS & TRACES
// ================================

// GET /api/admin/ops/logs/errors - Grouped errors
router.get('/ops/logs/errors', requireAdmin, async (req, res) => {
  try {
    const timeframe = req.query.timeframe as string || '24h';
    const errors = await logsTracesService.getGroupedErrors(timeframe);
    return res.json({ success: true, data: errors });
  } catch (error) {
    logger.error('Failed to get grouped errors:', error);
    return res.status(500).json({ success: false, message: 'Failed to get errors' });
  }
});

// GET /api/admin/ops/logs/slow-endpoints - Performance data
router.get('/ops/logs/slow-endpoints', requireAdmin, async (req, res) => {
  try {
    const endpoints = await logsTracesService.getSlowEndpoints();
    return res.json({ success: true, data: endpoints });
  } catch (error) {
    logger.error('Failed to get slow endpoints:', error);
    return res.status(500).json({ success: false, message: 'Failed to get slow endpoints' });
  }
});

// ================================
// COST & USAGE
// ================================

// GET /api/admin/ops/costs/current - Today's cost snapshot
router.get('/ops/costs/current', requireAdmin, async (req, res) => {
  try {
    const costs = await costTrackingService.getDailySnapshot();
    return res.json({ success: true, data: costs });
  } catch (error) {
    logger.error('Failed to get current costs:', error);
    return res.status(500).json({ success: false, message: 'Failed to get costs' });
  }
});

// GET /api/admin/ops/costs/trend - 30-day history
router.get('/ops/costs/trend', requireAdmin, async (req, res) => {
  try {
    const trend = await costTrackingService.getMonthlyTrend();
    return res.json({ success: true, data: trend });
  } catch (error) {
    logger.error('Failed to get cost trend:', error);
    return res.status(500).json({ success: false, message: 'Failed to get trend' });
  }
});

// GET /api/admin/ops/usage/metrics - Request volume, queue depth
router.get('/ops/usage/metrics', requireAdmin, async (req, res) => {
  try {
    const metrics = await costTrackingService.getUsageMetrics();
    return res.json({ success: true, data: metrics });
  } catch (error) {
    logger.error('Failed to get usage metrics:', error);
    return res.status(500).json({ success: false, message: 'Failed to get usage metrics' });
  }
});

// ================================
// RUNBOOKS & TOOLS
// ================================

// GET /api/admin/ops/runbooks - List runbooks
router.get('/ops/runbooks', requireAdmin, async (req, res) => {
  try {
    const runbooks = await runbooksService.listRunbooks();
    return res.json({ success: true, data: runbooks });
  } catch (error) {
    logger.error('Failed to list runbooks:', error);
    return res.status(500).json({ success: false, message: 'Failed to list runbooks' });
  }
});

// GET /api/admin/ops/runbooks/search - Search runbooks
router.get('/ops/runbooks/search', requireAdmin, async (req, res) => {
  try {
    const filters: any = {};
    
    if (req.query.service) filters.service = req.query.service as string;
    if (req.query.severityFit) filters.severityFit = req.query.severityFit as string;
    if (req.query.tags) filters.tags = (req.query.tags as string).split(',');
    if (req.query.ownerId) filters.ownerId = req.query.ownerId as string;
    if (req.query.needsReview !== undefined) filters.needsReview = req.query.needsReview === 'true';
    if (req.query.query) filters.query = req.query.query as string;

    const runbooks = await runbooksService.searchRunbooks(filters);
    return res.json({ success: true, data: runbooks });
  } catch (error) {
    logger.error('Failed to search runbooks:', error);
    return res.status(500).json({ success: false, message: 'Failed to search runbooks' });
  }
});

// GET /api/admin/ops/runbooks/:id - Get runbook detail
router.get('/ops/runbooks/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const runbook = await runbooksService.getRunbook(id);
    return res.json({ success: true, data: runbook });
  } catch (error) {
    logger.error('Failed to get runbook:', error);
    return res.status(500).json({ success: false, message: 'Failed to get runbook' });
  }
});

// POST /api/admin/ops/runbooks - Create runbook
router.post('/ops/runbooks', requireAdmin, auditAdminAction('RUNBOOK_CREATED'), async (req, res) => {
  try {
    const runbookData = req.body;

    if (!runbookData.title || !runbookData.contentMarkdown) {
      return res.status(400).json({ success: false, message: 'Title and content required' });
    }

    const runbook = await runbooksService.createRunbook(runbookData, req.admin!.id);

    logger.info({ runbookId: runbook.id, title: runbookData.title }, 'Runbook created');

    return res.json({ success: true, data: runbook });
  } catch (error) {
    logger.error('Failed to create runbook:', error);
    return res.status(500).json({ success: false, message: 'Failed to create runbook' });
  }
});

// PUT /api/admin/ops/runbooks/:id - Update runbook
router.put('/ops/runbooks/:id', requireAdmin, auditAdminAction('RUNBOOK_UPDATED'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const runbook = await runbooksService.updateRunbook(id, updates, req.admin!.id);

    logger.info({ runbookId: id }, 'Runbook updated');

    return res.json({ success: true, data: runbook });
  } catch (error) {
    logger.error('Failed to update runbook:', error);
    return res.status(500).json({ success: false, message: 'Failed to update runbook' });
  }
});

// POST /api/admin/ops/runbooks/:id/review - Mark runbook as reviewed
router.post('/ops/runbooks/:id/review', requireAdmin, auditAdminAction('RUNBOOK_REVIEWED'), async (req, res) => {
  try {
    const { id } = req.params;

    const runbook = await runbooksService.markReviewed(id, req.admin!.id);

    logger.info({ runbookId: id }, 'Runbook marked as reviewed');

    return res.json({ success: true, data: runbook });
  } catch (error) {
    logger.error('Failed to mark runbook as reviewed:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark as reviewed' });
  }
});

// POST /api/admin/ops/runbooks/:id/execute - Start runbook execution
router.post('/ops/runbooks/:id/execute', requireAdmin, auditAdminAction('RUNBOOK_EXECUTED'), async (req, res) => {
  try {
    const { id } = req.params;
    const { incidentId } = req.body;

    const execution = await runbooksService.startExecution(id, req.admin!.id, incidentId);

    logger.info({ runbookId: id, executionId: execution.id, incidentId }, 'Runbook execution started');

    return res.json({ success: true, data: execution });
  } catch (error) {
    logger.error('Failed to start runbook execution:', error);
    return res.status(500).json({ success: false, message: 'Failed to start execution' });
  }
});

// POST /api/admin/ops/runbooks/:id/attach - Attach runbook to incident
router.post('/ops/runbooks/:id/attach', requireAdmin, auditAdminAction('RUNBOOK_ATTACHED_TO_INCIDENT'), async (req, res) => {
  try {
    const { id } = req.params;
    const { incidentId } = req.body;

    if (!incidentId) {
      return res.status(400).json({ success: false, message: 'Incident ID required' });
    }

    await runbooksService.attachToIncident(id, incidentId, req.admin!.id);

    logger.info({ runbookId: id, incidentId }, 'Runbook attached to incident');

    return res.json({ success: true, message: 'Runbook attached successfully' });
  } catch (error) {
    logger.error('Failed to attach runbook:', error);
    return res.status(500).json({ success: false, message: 'Failed to attach runbook' });
  }
});

// GET /api/admin/ops/runbook-executions/:id - Get execution status
router.get('/ops/runbook-executions/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const execution = await prisma.runbookExecution.findUnique({
      where: { id },
      include: {
        runbook: true,
        startedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!execution) {
      return res.status(404).json({ success: false, message: 'Execution not found' });
    }

    return res.json({ 
      success: true, 
      data: {
        ...execution,
        steps: execution.steps ? JSON.parse(execution.steps) : []
      }
    });
  } catch (error) {
    logger.error('Failed to get execution status:', error);
    return res.status(500).json({ success: false, message: 'Failed to get execution' });
  }
});

// POST /api/admin/ops/tools/rebuild-revenue - Rebuild revenue snapshots
router.post('/ops/tools/rebuild-revenue', requireSuperAdmin, auditAdminAction('OPS_TOOL_EXECUTED'), async (req, res) => {
  try {
    const result = await runbooksService.rebuildRevenueSnapshots();

    logger.info({ result }, 'Revenue snapshots rebuilt');

    return res.json({ success: result.success, data: result });
  } catch (error) {
    logger.error('Failed to rebuild revenue snapshots:', error);
    return res.status(500).json({ success: false, message: 'Failed to rebuild revenue' });
  }
});

// POST /api/admin/ops/tools/recompute-metrics - Vendor metrics
router.post('/ops/tools/recompute-metrics', requireSuperAdmin, auditAdminAction('OPS_TOOL_EXECUTED'), async (req, res) => {
  try {
    const hours = parseInt(req.body.hours) || 24;
    const result = await runbooksService.recomputeVendorMetrics(hours);

    logger.info({ result }, 'Vendor metrics recomputed');

    return res.json({ success: result.success, data: result });
  } catch (error) {
    logger.error('Failed to recompute metrics:', error);
    return res.status(500).json({ success: false, message: 'Failed to recompute metrics' });
  }
});

// POST /api/admin/ops/tools/reindex-products - Reindex
router.post('/ops/tools/reindex-products', requireSuperAdmin, auditAdminAction('OPS_TOOL_EXECUTED'), async (req, res) => {
  try {
    const result = await runbooksService.reindexSearchData();

    logger.info({ result }, 'Search data reindexed');

    return res.json({ success: result.success, data: result });
  } catch (error) {
    logger.error('Failed to reindex:', error);
    return res.status(500).json({ success: false, message: 'Failed to reindex' });
  }
});

export default router;
























