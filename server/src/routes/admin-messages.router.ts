import { Router } from 'express';
import { requireAdmin, auditAdminAction } from '../middleware/admin-auth';
import { systemMessages } from '../services/system-messages';
import { z } from 'zod';

const router = Router();

// Validation schemas
const messageFiltersSchema = z.object({
  scope: z.string().optional(),
  type: z.string().optional(),
  read: z.boolean().optional(),
  vendorProfileId: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50)
});

const createMessageSchema = z.object({
  vendorProfileId: z.string(),
  userId: z.string().optional(),
  scope: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  data: z.any().optional()
});

const broadcastMessageSchema = z.object({
  vendorProfileIds: z.array(z.string()),
  scope: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  data: z.any().optional()
});

// GET /api/admin/messages - Get system messages with filters
router.get('/messages', requireAdmin, async (req, res) => {
  try {
    const filters = messageFiltersSchema.parse(req.query);
    
    const result = await systemMessages.getMessages(
      {
        scope: filters.scope,
        type: filters.type,
        read: filters.read,
        vendorProfileId: filters.vendorProfileId,
        userId: filters.userId,
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined
      },
      filters.page,
      filters.limit
    );
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch system messages'
    });
  }
});

// GET /api/admin/messages/stats - Get message statistics
router.get('/messages/stats', requireAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.query.vendorProfileId as string;
    
    const stats = await systemMessages.getMessageStats(vendorProfileId);
    
    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get message stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch message statistics'
    });
  }
});

// GET /api/admin/messages/recent - Get recent messages for dashboard
router.get('/messages/recent', requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const messages = await systemMessages.getRecentMessages(limit);
    
    return res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Get recent messages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recent messages'
    });
  }
});

// POST /api/admin/messages - Create a system message
router.post('/messages', requireAdmin, auditAdminAction('message.create'), async (req, res) => {
  try {
    const data = createMessageSchema.parse(req.body);
    
    const message = await systemMessages.createMessage(data);
    
    return res.json({
      success: true,
      message: 'System message created',
      data: { message }
    });
  } catch (error) {
    console.error('Create message error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create system message'
    });
  }
});

// POST /api/admin/messages/broadcast - Broadcast message to multiple vendors
router.post('/messages/broadcast', requireAdmin, auditAdminAction('message.broadcast'), async (req, res) => {
  try {
    const data = broadcastMessageSchema.parse(req.body);
    
    const messages = await systemMessages.broadcastMessage(data);
    
    return res.json({
      success: true,
      message: `Message broadcasted to ${messages.length} vendors`,
      data: { messages }
    });
  } catch (error) {
    console.error('Broadcast message error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to broadcast message'
    });
  }
});

// PUT /api/admin/messages/:id/read - Mark message as read
router.put('/messages/:id/read', requireAdmin, auditAdminAction('message.mark_read'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await systemMessages.markAsRead(id);
    
    return res.json({
      success: true,
      message: 'Message marked as read',
      data: { message }
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
});

// PUT /api/admin/messages/read-multiple - Mark multiple messages as read
router.put('/messages/read-multiple', requireAdmin, auditAdminAction('message.mark_read_multiple'), async (req, res) => {
  try {
    const { messageIds } = req.body;
    
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'messageIds array is required'
      });
    }
    
    const count = await systemMessages.markMultipleAsRead(messageIds);
    
    return res.json({
      success: true,
      message: `${count} messages marked as read`,
      data: { count }
    });
  } catch (error) {
    console.error('Mark multiple messages as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
});

// PUT /api/admin/messages/read-all - Mark all messages as read for a vendor
router.put('/messages/read-all', requireAdmin, auditAdminAction('message.mark_read_all'), async (req, res) => {
  try {
    const { vendorProfileId, userId } = req.body;
    
    if (!vendorProfileId) {
      return res.status(400).json({
        success: false,
        message: 'vendorProfileId is required'
      });
    }
    
    const count = await systemMessages.markAllAsRead(vendorProfileId, userId);
    
    return res.json({
      success: true,
      message: `${count} messages marked as read`,
      data: { count }
    });
  } catch (error) {
    console.error('Mark all messages as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all messages as read'
    });
  }
});

// DELETE /api/admin/messages/:id - Delete a system message
router.delete('/messages/:id', requireAdmin, auditAdminAction('message.delete'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await systemMessages.deleteMessage(id);
    
    return res.json({
      success: true,
      message: 'System message deleted'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete system message'
    });
  }
});

export default router;






















