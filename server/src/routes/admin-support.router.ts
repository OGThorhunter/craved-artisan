import express, { Request, Response } from 'express';
import { prisma } from '../db';
import { logger } from '../logger';
import { requireAdmin } from '../middleware/admin-auth';
import * as supportService from '../services/support-ticket.service';
import * as aiService from '../services/support-ai.service';
import { supportSSEService } from '../services/support-sse.service';

const router = express.Router();

// All routes require admin authentication
router.use(requireAdmin);

/**
 * GET /api/admin/support
 * List all tickets with filters and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      status,
      severity,
      category,
      assignedTo,
      search,
      page = '1',
      limit = '25',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = Array.isArray(status) ? { in: status } : status;
    }
    
    if (severity) {
      where.severity = Array.isArray(severity) ? { in: severity } : severity;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (assignedTo) {
      where.assignedToId = assignedTo;
    }
    
    if (search) {
      where.OR = [
        { subject: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }
    
    // Fetch tickets
    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          requester: {
            select: { id: true, name: true, email: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          relatedUser: {
            select: { id: true, name: true, email: true },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 1, // Just get the latest message for preview
          },
        },
        orderBy: { [sortBy as string]: sortOrder },
        skip,
        take: limitNum,
      }),
      prisma.supportTicket.count({ where }),
    ]);
    
    res.json({
      tickets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error({ error }, '❌ Failed to fetch support tickets');
    res.status(500).json({ error: 'Failed to fetch support tickets' });
  }
});

/**
 * GET /api/admin/support/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const [
      openCount,
      unresolvedCount,
      escalatedCount,
      todayCount,
      criticalCount,
      unassignedCount,
    ] = await Promise.all([
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.supportTicket.count({ where: { status: { notIn: ['CLOSED', 'RESOLVED'] } } }),
      prisma.supportTicket.count({ where: { status: 'ESCALATED' } }),
      prisma.supportTicket.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.supportTicket.count({ where: { severity: 'CRITICAL', status: { notIn: ['CLOSED'] } } }),
      prisma.supportTicket.count({ where: { assignedToId: null, status: { notIn: ['CLOSED'] } } }),
    ]);
    
    // Calculate SLA compliance (tickets closed within SLA)
    const allTickets = await prisma.supportTicket.findMany({
      where: {
        status: 'CLOSED',
        updatedAt: { gte: oneDayAgo },
      },
      select: {
        slaDueAt: true,
        updatedAt: true,
      },
    });
    
    const slaCompliant = allTickets.filter(
      (t) => t.slaDueAt && t.updatedAt <= t.slaDueAt
    ).length;
    
    const slaComplianceRate = allTickets.length > 0
      ? Math.round((slaCompliant / allTickets.length) * 100)
      : 100;
    
    res.json({
      openCount,
      unresolvedCount,
      escalatedCount,
      todayCount,
      criticalCount,
      unassignedCount,
      slaComplianceRate,
    });
  } catch (error) {
    logger.error({ error }, '❌ Failed to fetch support stats');
    res.status(500).json({ error: 'Failed to fetch support stats' });
  }
});

/**
 * GET /api/admin/support/:id
 * Get full ticket details with thread
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        requester: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        relatedUser: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        relatedOrder: {
          select: { id: true, orderNumber: true, status: true, total: true },
        },
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Calculate SLA status
    const slaStatus = supportService.checkSlaStatus(ticket.slaDueAt);
    
    res.json({
      ticket,
      slaStatus,
    });
  } catch (error) {
    logger.error({ error, ticketId: req.params.id }, '❌ Failed to fetch ticket');
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

/**
 * POST /api/admin/support
 * Create a new ticket
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const ticket = await supportService.createTicket(req.body, req.user!.id);
    
    // Broadcast to all connected clients
    supportSSEService.broadcastTicketUpdate(ticket.id, {
      type: 'created',
      ticket,
    });
    
    res.status(201).json({ ticket });
  } catch (error) {
    logger.error({ error, body: req.body }, '❌ Failed to create ticket');
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

/**
 * PATCH /api/admin/support/:id
 * Update ticket (status, severity, assignment, etc.)
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, severity, category, assignedToId, tags } = req.body;
    
    const updates: any = {};
    if (status) updates.status = status;
    if (severity) updates.severity = severity;
    if (category) updates.category = category;
    if (assignedToId !== undefined) updates.assignedToId = assignedToId;
    if (tags) updates.tags = JSON.stringify(tags);
    
    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: updates,
      include: {
        requester: true,
        assignedTo: true,
        relatedUser: true,
        relatedOrder: true,
      },
    });
    
    // Broadcast update
    supportSSEService.broadcastTicketUpdate(id, {
      type: 'updated',
      ticket,
    });
    
    // Notify assignee if changed
    if (assignedToId && ticket.assignedToId) {
      supportSSEService.notifyAssignee(ticket.assignedToId, {
        type: 'assigned',
        ticketId: id,
        ticket,
      });
    }
    
    res.json({ ticket });
  } catch (error) {
    logger.error({ error, ticketId: req.params.id }, '❌ Failed to update ticket');
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

/**
 * DELETE /api/admin/support/:id
 * Delete a ticket (admin only)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.supportTicket.delete({
      where: { id },
    });
    
    logger.info({ ticketId: id }, '🗑️  Support ticket deleted');
    
    res.json({ success: true });
  } catch (error) {
    logger.error({ error, ticketId: req.params.id }, '❌ Failed to delete ticket');
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

/**
 * POST /api/admin/support/:id/message
 * Add a message to the ticket
 */
router.post('/:id/message', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { body, internal, attachments } = req.body;
    
    const message = await supportService.addMessage({
      ticketId: id,
      senderId: req.user!.id,
      senderRole: 'ADMIN',
      body,
      internal,
      attachments,
    });
    
    // Broadcast message
    supportSSEService.broadcastTicketUpdate(id, {
      type: 'message',
      message,
    });
    
    res.status(201).json({ message });
  } catch (error) {
    logger.error({ error, ticketId: req.params.id }, '❌ Failed to add message');
    res.status(500).json({ error: 'Failed to add message' });
  }
});

/**
 * POST /api/admin/support/:id/close
 * Close a ticket
 */
router.post('/:id/close', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    
    const ticket = await supportService.closeTicket(id, req.user!.id, resolution);
    
    // Broadcast update
    supportSSEService.broadcastTicketUpdate(id, {
      type: 'closed',
      ticket,
    });
    
    res.json({ ticket });
  } catch (error) {
    logger.error({ error, ticketId: req.params.id }, '❌ Failed to close ticket');
    res.status(500).json({ error: 'Failed to close ticket' });
  }
});

/**
 * POST /api/admin/support/:id/reopen
 * Reopen a closed ticket
 */
router.post('/:id/reopen', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const ticket = await supportService.updateStatus(id, 'OPEN', req.user!.id, reason);
    
    // Broadcast update
    supportSSEService.broadcastTicketUpdate(id, {
      type: 'updated',
      ticket,
    });
    
    res.json({ ticket });
  } catch (error) {
    logger.error({ error, ticketId: req.params.id }, '❌ Failed to reopen ticket');
    res.status(500).json({ error: 'Failed to reopen ticket' });
  }
});

/**
 * POST /api/admin/support/:id/escalate
 * Escalate a ticket
 */
router.post('/:id/escalate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const ticket = await supportService.escalateTicket(id, req.user!.id, reason);
    
    // Broadcast update
    supportSSEService.broadcastTicketUpdate(id, {
      type: 'updated',
      ticket,
    });
    
    res.json({ ticket });
  } catch (error) {
    logger.error({ error, ticketId: req.params.id }, '❌ Failed to escalate ticket');
    res.status(500).json({ error: 'Failed to escalate ticket' });
  }
});

/**
 * POST /api/admin/support/:id/ai-summary
 * Generate AI summary of ticket thread
 */
router.post('/:id/ai-summary', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const summary = await aiService.summarizeThread(ticket.messages);
    
    res.json({ summary });
  } catch (error) {
    logger.error({ error, ticketId: req.params.id }, '❌ Failed to generate AI summary');
    res.status(500).json({ error: 'Failed to generate AI summary' });
  }
});

/**
 * POST /api/admin/support/:id/ai-reply
 * Get AI-suggested reply
 */
router.post('/:id/ai-reply', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const suggestedReply = await aiService.suggestReply(ticket.subject, ticket.messages);
    
    res.json({ suggestedReply });
  } catch (error) {
    logger.error({ error, ticketId: req.params.id }, '❌ Failed to generate AI reply');
    res.status(500).json({ error: 'Failed to generate AI reply' });
  }
});

/**
 * GET /api/admin/support/stream
 * SSE endpoint for real-time updates
 */
router.get('/stream', (req: Request, res: Response) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
  
  // Add client to SSE service
  supportSSEService.addClient(req.user!.id, res);
  
  // Handle client disconnect
  req.on('close', () => {
    supportSSEService.removeClient(req.user!.id);
  });
});

export default router;

