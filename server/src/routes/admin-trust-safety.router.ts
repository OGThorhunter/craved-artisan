import { Router } from 'express';
import { requireAdmin, auditAdminAction } from '../middleware/admin-auth';
import { trustSafetyService } from '../services/trust-safety';
import { z } from 'zod';

const router = Router();

// Validation schemas
const ModerationQueueSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'escalated']).optional(),
  type: z.enum(['product', 'vendor', 'review', 'event', 'user', 'content']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20)
});

const ModerationActionSchema = z.object({
  type: z.enum(['approve', 'reject', 'escalate', 'warn', 'suspend', 'ban', 'remove_content']),
  reason: z.string().min(1),
  details: z.record(z.any()).optional(),
  duration: z.number().optional() // for temporary actions
});

const AccountLinkStatusSchema = z.object({
  status: z.enum(['active', 'investigating', 'confirmed', 'false_positive', 'resolved'])
});

// GET /api/admin/trust-safety/moderation - Get moderation queue
router.get('/trust-safety/moderation', requireAdmin, async (req, res) => {
  try {
    const filters = ModerationQueueSchema.parse(req.query);
    const result = await trustSafetyService.getModerationQueue(filters);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Moderation queue error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      error: (error as Error).message
    });
  }
});

// GET /api/admin/trust-safety/moderation/:id - Get moderation item details
router.get('/trust-safety/moderation/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await trustSafetyService.getModerationItem(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Moderation item not found'
      });
    }
    
    return res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get moderation item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch moderation item'
    });
  }
});

// POST /api/admin/trust-safety/moderation/:id/action - Take moderation action
router.post('/trust-safety/moderation/:id/action', requireAdmin, auditAdminAction('trust-safety.moderation.action'), async (req, res) => {
  try {
    const { id } = req.params;
    const action = ModerationActionSchema.parse(req.body);
    const performedBy = req.user?.id || 'unknown';
    
    const success = await trustSafetyService.takeModerationAction(id, action, performedBy);
    
    if (success) {
      return res.json({
        success: true,
        message: `Moderation action ${action.type} completed successfully`
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to take moderation action'
      });
    }
  } catch (error) {
    console.error('Moderation action error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid action data',
      error: (error as Error).message
    });
  }
});

// GET /api/admin/trust-safety/account-links - Get account link graph
router.get('/trust-safety/account-links', requireAdmin, async (req, res) => {
  try {
    const userId = req.query.userId as string;
    const graph = await trustSafetyService.getAccountLinkGraph(userId);
    
    return res.json({
      success: true,
      data: graph
    });
  } catch (error) {
    console.error('Account link graph error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch account link graph'
    });
  }
});

// PUT /api/admin/trust-safety/account-links/:id/status - Update account link status
router.put('/trust-safety/account-links/:id/status', requireAdmin, auditAdminAction('trust-safety.account-link.update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = AccountLinkStatusSchema.parse(req.body);
    const updatedBy = req.user?.id || 'unknown';
    
    const success = await trustSafetyService.updateAccountLinkStatus(id, status, updatedBy);
    
    if (success) {
      return res.json({
        success: true,
        message: 'Account link status updated successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to update account link status'
      });
    }
  } catch (error) {
    console.error('Update account link status error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid status data',
      error: (error as Error).message
    });
  }
});

// GET /api/admin/trust-safety/metrics - Get trust & safety metrics
router.get('/trust-safety/metrics', requireAdmin, async (req, res) => {
  try {
    const metrics = await trustSafetyService.getTrustSafetyMetrics();
    
    return res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Trust & safety metrics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch trust & safety metrics'
    });
  }
});

// GET /api/admin/trust-safety/users/:id/risk-profile - Get user risk profile
router.get('/trust-safety/users/:id/risk-profile', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await trustSafetyService.getUserRiskProfile(id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User risk profile not found'
      });
    }
    
    return res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get user risk profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user risk profile'
    });
  }
});

// GET /api/admin/trust-safety/users/search - Search users
router.get('/trust-safety/users/search', requireAdmin, async (req, res) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const users = await trustSafetyService.searchUsers(query);
    
    return res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('User search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
});

export default router;



































