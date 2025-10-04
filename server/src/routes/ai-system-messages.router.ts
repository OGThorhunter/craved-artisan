import express from 'express';
import { PrismaClient } from '@prisma/client';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin-mock';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const GetMessagesQuerySchema = z.object({
  scope: z.string().optional(),
  unreadOnly: z.string().optional().transform(val => val === 'true'),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
});

const MarkReadSchema = z.object({
  ids: z.array(z.string()),
});

// GET /api/ai/system-messages
router.get('/', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { scope, unreadOnly, limit, offset } = GetMessagesQuerySchema.parse(req.query);

    // Build where clause
    const where: any = { vendorProfileId };
    
    if (scope) {
      where.scope = scope;
    }
    
    if (unreadOnly) {
      where.readAt = null;
    }

    // Get messages
    const messages = await prisma.systemMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Get unread count
    const unreadCount = await prisma.systemMessage.count({
      where: {
        vendorProfileId,
        readAt: null,
      },
    });

    // Get count by scope
    const scopeCounts = await prisma.systemMessage.groupBy({
      by: ['scope'],
      where: {
        vendorProfileId,
        readAt: null,
      },
      _count: {
        id: true,
      },
    });

    const scopeCountsMap = scopeCounts.reduce((acc, item) => {
      acc[item.scope] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      messages: messages.map(msg => ({
        id: msg.id,
        scope: msg.scope,
        type: msg.type,
        title: msg.title,
        body: msg.body,
        data: msg.data ? JSON.parse(msg.data) : null,
        readAt: msg.readAt,
        createdAt: msg.createdAt,
      })),
      unreadCount,
      scopeCounts: scopeCountsMap,
      pagination: {
        limit,
        offset,
        total: messages.length,
      },
    });

  } catch (error) {
    console.error('Get system messages error:', error);
    res.status(500).json({ error: 'Failed to get system messages' });
  }
});

// POST /api/ai/system-messages/mark-read
router.post('/mark-read', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { ids } = MarkReadSchema.parse(req.body);

    // Update messages to mark as read
    const result = await prisma.systemMessage.updateMany({
      where: {
        id: { in: ids },
        vendorProfileId,
        readAt: null, // Only update unread messages
      },
      data: {
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      updatedCount: result.count,
      messageIds: ids,
    });

  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// POST /api/ai/system-messages/mark-all-read
router.post('/mark-all-read', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { scope } = req.body;

    // Build where clause
    const where: any = {
      vendorProfileId,
      readAt: null,
    };
    
    if (scope) {
      where.scope = scope;
    }

    // Update all unread messages
    const result = await prisma.systemMessage.updateMany({
      where,
      data: {
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      updatedCount: result.count,
      scope: scope || 'all',
    });

  } catch (error) {
    console.error('Mark all messages read error:', error);
    res.status(500).json({ error: 'Failed to mark all messages as read' });
  }
});

// DELETE /api/ai/system-messages/:id
router.delete('/:id', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { id } = req.params;

    // Delete message
    const result = await prisma.systemMessage.deleteMany({
      where: {
        id,
        vendorProfileId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({
      success: true,
      messageId: id,
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// GET /api/ai/system-messages/stats
router.get('/stats', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;

    // Get message counts by type and scope
    const typeStats = await prisma.systemMessage.groupBy({
      by: ['type', 'scope'],
      where: { vendorProfileId },
      _count: { id: true },
    });

    // Get recent activity (last 7 days)
    const recentActivity = await prisma.systemMessage.count({
      where: {
        vendorProfileId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Get unread by type
    const unreadByType = await prisma.systemMessage.groupBy({
      by: ['type'],
      where: {
        vendorProfileId,
        readAt: null,
      },
      _count: { id: true },
    });

    res.json({
      typeStats: typeStats.map(stat => ({
        type: stat.type,
        scope: stat.scope,
        count: stat._count.id,
      })),
      recentActivity,
      unreadByType: unreadByType.map(stat => ({
        type: stat.type,
        count: stat._count.id,
      })),
    });

  } catch (error) {
    console.error('Get message stats error:', error);
    res.status(500).json({ error: 'Failed to get message statistics' });
  }
});

export default router;
