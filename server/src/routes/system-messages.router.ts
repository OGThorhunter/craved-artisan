import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin-mock';
import { logger } from '../logger';

const router = Router();

// Validation schemas
const markReadSchema = z.object({
  ids: z.array(z.string())
});

const createSystemMessageSchema = z.object({
  scope: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  data: z.string().optional(), // JSON string
});

// GET /api/vendor/system-messages - Get system messages
router.get('/', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const {
      scope = '',
      unreadOnly = 'false',
      page = '1',
      pageSize = '20'
    } = req.query;

    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const skip = (pageNum - 1) * pageSizeNum;
    const unreadOnlyBool = unreadOnly === 'true';

    // Build where clause
    const where: any = {
      vendorProfileId: vendorId,
    };

    if (scope) {
      where.scope = scope;
    }

    if (unreadOnlyBool) {
      where.readAt = null;
    }

    const [messages, total, unreadCount] = await Promise.all([
      prisma.systemMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSizeNum
      }),
      prisma.systemMessage.count({ where }),
      prisma.systemMessage.count({
        where: {
          vendorProfileId: vendorId,
          readAt: null
        }
      })
    ]);

    // Parse JSON data for each message
    const parsedMessages = messages.map(message => ({
      ...message,
      data: message.data ? JSON.parse(message.data) : null
    }));

    res.json({
      messages: parsedMessages,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        total,
        totalPages: Math.ceil(total / pageSizeNum)
      },
      unreadCount
    });
  } catch (error) {
    logger.error('Error fetching system messages:', error);
    res.status(500).json({ error: 'Failed to fetch system messages' });
  }
});

// POST /api/vendor/system-messages/mark-read - Mark messages as read
router.post('/mark-read', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const data = markReadSchema.parse(req.body);

    // Verify ownership of messages
    const messages = await prisma.systemMessage.findMany({
      where: {
        id: { in: data.ids },
        vendorProfileId: vendorId
      }
    });

    if (messages.length !== data.ids.length) {
      return res.status(400).json({ error: 'Some messages not found or not owned by vendor' });
    }

    // Mark messages as read
    await prisma.systemMessage.updateMany({
      where: {
        id: { in: data.ids },
        vendorProfileId: vendorId
      },
      data: {
        readAt: new Date()
      }
    });

    res.json({ message: 'Messages marked as read', count: data.ids.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// POST /api/vendor/system-messages - Create system message (internal use)
router.post('/', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const data = createSystemMessageSchema.parse(req.body);

    const message = await prisma.systemMessage.create({
      data: {
        vendorProfileId: vendorId,
        scope: data.scope,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data
      }
    });

    res.status(201).json({
      ...message,
      data: message.data ? JSON.parse(message.data) : null
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error creating system message:', error);
    res.status(500).json({ error: 'Failed to create system message' });
  }
});

// DELETE /api/vendor/system-messages/:id - Delete system message
router.delete('/:id', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const { id } = req.params;

    // Verify ownership
    const message = await prisma.systemMessage.findFirst({
      where: { id, vendorProfileId: vendorId }
    });

    if (!message) {
      return res.status(404).json({ error: 'System message not found' });
    }

    await prisma.systemMessage.delete({
      where: { id }
    });

    res.json({ message: 'System message deleted' });
  } catch (error) {
    logger.error('Error deleting system message:', error);
    res.status(500).json({ error: 'Failed to delete system message' });
  }
});

// GET /api/vendor/system-messages/unread-count - Get unread count
router.get('/unread-count', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const { scope = '' } = req.query;

    const where: any = {
      vendorProfileId: vendorId,
      readAt: null
    };

    if (scope) {
      where.scope = scope;
    }

    const unreadCount = await prisma.systemMessage.count({ where });

    res.json({ unreadCount });
  } catch (error) {
    logger.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Helper function to create system messages (for use by other modules)
export async function createSystemMessage(
  vendorId: string,
  scope: string,
  type: string,
  title: string,
  body: string,
  data?: any
) {
  try {
    const message = await prisma.systemMessage.create({
      data: {
        vendorProfileId: vendorId,
        scope,
        type,
        title,
        body,
        data: data ? JSON.stringify(data) : null
      }
    });

    logger.info(`System message created for vendor ${vendorId}: ${type} - ${title}`);
    return message;
  } catch (error) {
    logger.error('Error creating system message:', error);
    throw error;
  }
}

// Helper function to create inventory-related system messages
export async function createInventorySystemMessage(
  vendorId: string,
  type: 'restock_alert' | 'price_watch_hit' | 'shortfall' | 'seasonal_forecast' | 'receipt_parsed',
  title: string,
  body: string,
  data?: any
) {
  return createSystemMessage(vendorId, 'inventory', type, title, body, data);
}

export default router;
