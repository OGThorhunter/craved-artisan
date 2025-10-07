import { Router } from 'express';
import { requireAdmin, auditAdminAction } from '../middleware/admin-auth';
import { queueMonitor } from '../services/queue-monitor';
import { dbHealthMonitor } from '../services/db-health';
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

export default router;






