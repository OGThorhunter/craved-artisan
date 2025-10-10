import { Router } from 'express';
import { requireAdmin, auditAdminAction } from '../middleware/admin-auth';
import { sloMonitor } from '../services/slo-monitor';
import { z } from 'zod';

const router = Router();

// Validation schemas
const windowSchema = z.object({
  window: z.enum(['7d', '30d']).default('7d')
});

// GET /api/admin/slo - Get SLO status and burn rates
router.get('/slo', requireAdmin, async (req, res) => {
  try {
    const { window } = windowSchema.parse(req.query);
    
    const [sloStatus, burnRates] = await Promise.all([
      sloMonitor.getOverallSLOStatus(window),
      Promise.all([
        sloMonitor.getSLOBurnRate('availability', window),
        sloMonitor.getSLOBurnRate('latency', window),
        sloMonitor.getSLOBurnRate('error_rate', window),
        sloMonitor.getSLOBurnRate('queue_age', window)
      ])
    ]);
    
    return res.json({
      success: true,
      data: {
        window,
        status: sloStatus.status,
        slos: sloStatus.slos,
        summary: sloStatus.summary,
        burnRates: {
          availability: burnRates[0],
          latency: burnRates[1],
          error_rate: burnRates[2],
          queue_age: burnRates[3]
        }
      }
    });
  } catch (error) {
    console.error('SLO fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch SLO data'
    });
  }
});

// GET /api/admin/slo/burn-rate/:sli - Get burn rate for specific SLI
router.get('/slo/burn-rate/:sli', requireAdmin, async (req, res) => {
  try {
    const { sli } = req.params;
    const { window } = windowSchema.parse(req.query);
    
    if (!['availability', 'latency', 'error_rate', 'queue_age'].includes(sli)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid SLI type'
      });
    }
    
    const burnRate = await sloMonitor.getSLOBurnRate(sli, window);
    
    return res.json({
      success: true,
      data: {
        sli,
        window,
        burnRate
      }
    });
  } catch (error) {
    console.error('SLO burn rate error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch SLO burn rate'
    });
  }
});

// GET /api/admin/slo/status - Get current SLO status only
router.get('/slo/status', requireAdmin, async (req, res) => {
  try {
    const { window } = windowSchema.parse(req.query);
    
    const sloStatus = await sloMonitor.getOverallSLOStatus(window);
    
    return res.json({
      success: true,
      data: sloStatus
    });
  } catch (error) {
    console.error('SLO status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch SLO status'
    });
  }
});

export default router;



















