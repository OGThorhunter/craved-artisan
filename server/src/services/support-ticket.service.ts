import { prisma } from '../db';
import { logger } from '../logger';
import { supportQueues, useBullMQ } from '../config/bullmq';
import * as AuditEvents from '../constants/audit-events';

/**
 * SLA times in minutes based on severity
 */
const SLA_TIMES = {
  CRITICAL: 2 * 60, // 2 hours
  HIGH: 8 * 60, // 8 hours
  NORMAL: 24 * 60, // 24 hours
  LOW: 72 * 60, // 72 hours
};

/**
 * Calculate SLA due date based on severity
 */
export function calculateSla(severity: string): Date {
  const now = new Date();
  const minutes = SLA_TIMES[severity as keyof typeof SLA_TIMES] || SLA_TIMES.NORMAL;
  return new Date(now.getTime() + minutes * 60 * 1000);
}

/**
 * Check SLA status (green/yellow/red)
 */
export function checkSlaStatus(slaDueAt: Date | null): {
  status: 'green' | 'yellow' | 'red' | 'breached';
  percentUsed: number;
  minutesRemaining: number;
} {
  if (!slaDueAt) {
    return { status: 'green', percentUsed: 0, minutesRemaining: 0 };
  }
  
  const now = new Date();
  const timeRemaining = slaDueAt.getTime() - now.getTime();
  const minutesRemaining = Math.floor(timeRemaining / 1000 / 60);
  
  if (minutesRemaining < 0) {
    return { status: 'breached', percentUsed: 100, minutesRemaining };
  }
  
  // Calculate percent used (assume we started at the SLA time)
  const severity = 'NORMAL'; // Default, should be passed in
  const totalMinutes = SLA_TIMES[severity];
  const percentUsed = ((totalMinutes - minutesRemaining) / totalMinutes) * 100;
  
  if (percentUsed < 60) {
    return { status: 'green', percentUsed, minutesRemaining };
  } else if (percentUsed < 90) {
    return { status: 'yellow', percentUsed, minutesRemaining };
  } else {
    return { status: 'red', percentUsed, minutesRemaining };
  }
}

/**
 * Create a new support ticket
 */
export async function createTicket(data: {
  subject: string;
  description: string;
  severity: string;
  category?: string;
  requesterId?: string;
  requesterRole?: string;
  relatedUserId?: string;
  relatedOrderId?: string;
  source?: string;
  metadata?: any;
}, createdById: string) {
  try {
    const slaDueAt = calculateSla(data.severity);
    
    const ticket = await prisma.supportTicket.create({
      data: {
        subject: data.subject,
        description: data.description,
        severity: data.severity as any,
        category: (data.category || 'OTHER') as any,
        requesterId: data.requesterId,
        requesterRole: data.requesterRole,
        relatedUserId: data.relatedUserId,
        relatedOrderId: data.relatedOrderId,
        source: (data.source || 'DASHBOARD') as any,
        status: 'OPEN',
        slaDueAt,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        auditTrail: JSON.stringify([{
          action: 'CREATED',
          by: createdById,
          timestamp: new Date().toISOString(),
        }]),
      },
      include: {
        requester: true,
        relatedUser: true,
        relatedOrder: true,
      },
    });
    
    logger.info({
      ticketId: ticket.id,
      subject: ticket.subject,
      severity: ticket.severity,
      category: ticket.category,
    }, '✅ Support ticket created');
    
    // Write audit event
    await prisma.auditEvent.create({
      data: {
        action: AuditEvents.SUPPORT_TICKET_CREATED,
        scope: 'SUPPORT',
        scopeRefId: ticket.id,
        actorId: createdById,
        occurredAt: new Date(),
        summary: `Created ticket: ${ticket.subject}`,
        metadata: JSON.stringify({
          ticketId: ticket.id,
          severity: ticket.severity,
          category: ticket.category,
        }),
      },
    });
    
    // Queue AI triage if enabled
    if (useBullMQ && process.env.SUPPORT_AI_CATEGORY === 'true') {
      await supportQueues.aiTriage.add('triage', {
        ticketId: ticket.id,
        subject: ticket.subject,
        description: ticket.description,
      });
    }
    
    return ticket;
  } catch (error) {
    logger.error({ error, data }, '❌ Failed to create support ticket');
    throw error;
  }
}

/**
 * Assign ticket to staff member
 */
export async function assignTicket(ticketId: string, assignedToId: string, assignedById: string) {
  try {
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        assignedToId,
        auditTrail: {
          set: JSON.stringify([
            ...JSON.parse((await prisma.supportTicket.findUnique({ where: { id: ticketId } }))?.auditTrail || '[]'),
            {
              action: 'ASSIGNED',
              assignedTo: assignedToId,
              by: assignedById,
              timestamp: new Date().toISOString(),
            },
          ]),
        },
      },
      include: {
        assignedTo: true,
      },
    });
    
    logger.info({
      ticketId,
      assignedTo: assignedToId,
    }, '✅ Ticket assigned');
    
    // Write audit event
    await prisma.auditEvent.create({
      data: {
        action: AuditEvents.SUPPORT_TICKET_ASSIGNED,
        scope: 'SUPPORT',
        scopeRefId: ticketId,
        actorId: assignedById,
        occurredAt: new Date(),
        summary: `Assigned ticket to staff member`,
        metadata: JSON.stringify({ ticketId, assignedToId }),
      },
    });
    
    return ticket;
  } catch (error) {
    logger.error({ error, ticketId, assignedToId }, '❌ Failed to assign ticket');
    throw error;
  }
}

/**
 * Update ticket status
 */
export async function updateStatus(
  ticketId: string,
  newStatus: string,
  updatedById: string,
  reason?: string
) {
  try {
    const oldTicket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!oldTicket) throw new Error('Ticket not found');
    
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: newStatus as any,
        auditTrail: JSON.stringify([
          ...JSON.parse(oldTicket.auditTrail || '[]'),
          {
            action: 'STATUS_CHANGED',
            from: oldTicket.status,
            to: newStatus,
            by: updatedById,
            reason,
            timestamp: new Date().toISOString(),
          },
        ]),
      },
    });
    
    logger.info({
      ticketId,
      oldStatus: oldTicket.status,
      newStatus,
    }, '✅ Ticket status updated');
    
    // Write audit event
    await prisma.auditEvent.create({
      data: {
        action: AuditEvents.SUPPORT_TICKET_STATUS_CHANGED,
        scope: 'SUPPORT',
        scopeRefId: ticketId,
        actorId: updatedById,
        occurredAt: new Date(),
        summary: `Status changed from ${oldTicket.status} to ${newStatus}`,
        metadata: JSON.stringify({ ticketId, oldStatus: oldTicket.status, newStatus, reason }),
      },
    });
    
    return ticket;
  } catch (error) {
    logger.error({ error, ticketId, newStatus }, '❌ Failed to update ticket status');
    throw error;
  }
}

/**
 * Add message to ticket
 */
export async function addMessage(data: {
  ticketId: string;
  senderId: string;
  senderRole?: string;
  body: string;
  internal?: boolean;
  attachments?: any;
}) {
  try {
    const message = await prisma.supportMessage.create({
      data: {
        ticketId: data.ticketId,
        senderId: data.senderId,
        senderRole: data.senderRole,
        body: data.body,
        internal: data.internal || false,
        attachments: data.attachments ? JSON.stringify(data.attachments) : null,
      },
      include: {
        sender: true,
      },
    });
    
    // Update ticket's updatedAt
    await prisma.supportTicket.update({
      where: { id: data.ticketId },
      data: { updatedAt: new Date() },
    });
    
    logger.info({
      ticketId: data.ticketId,
      messageId: message.id,
      internal: data.internal,
    }, '✅ Message added to ticket');
    
    // Write audit event
    await prisma.auditEvent.create({
      data: {
        action: AuditEvents.SUPPORT_TICKET_MESSAGE_ADDED,
        scope: 'SUPPORT',
        scopeRefId: data.ticketId,
        actorId: data.senderId,
        occurredAt: new Date(),
        summary: `Added ${data.internal ? 'internal ' : ''}message to ticket`,
        metadata: JSON.stringify({
          ticketId: data.ticketId,
          messageId: message.id,
          internal: data.internal,
        }),
      },
    });
    
    return message;
  } catch (error) {
    logger.error({ error, data }, '❌ Failed to add message to ticket');
    throw error;
  }
}

/**
 * Escalate ticket
 */
export async function escalateTicket(ticketId: string, escalatedById: string, reason: string) {
  try {
    const ticket = await updateStatus(ticketId, 'ESCALATED', escalatedById, reason);
    
    // Write specific escalation audit event
    await prisma.auditEvent.create({
      data: {
        action: AuditEvents.SUPPORT_TICKET_ESCALATED,
        scope: 'SUPPORT',
        scopeRefId: ticketId,
        actorId: escalatedById,
        occurredAt: new Date(),
        summary: `Ticket escalated: ${reason}`,
        metadata: JSON.stringify({ ticketId, reason }),
      },
    });
    
    logger.warn({
      ticketId,
      reason,
    }, '⚠️  Ticket escalated');
    
    return ticket;
  } catch (error) {
    logger.error({ error, ticketId }, '❌ Failed to escalate ticket');
    throw error;
  }
}

/**
 * Close ticket
 */
export async function closeTicket(ticketId: string, closedById: string, resolution?: string) {
  try {
    const oldTicket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!oldTicket) throw new Error('Ticket not found');
    
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'CLOSED',
        auditTrail: JSON.stringify([
          ...JSON.parse(oldTicket.auditTrail || '[]'),
          {
            action: 'CLOSED',
            by: closedById,
            resolution,
            timestamp: new Date().toISOString(),
          },
        ]),
      },
    });
    
    logger.info({
      ticketId,
      resolution,
    }, '✅ Ticket closed');
    
    // Write audit event
    await prisma.auditEvent.create({
      data: {
        action: AuditEvents.SUPPORT_TICKET_CLOSED,
        scope: 'SUPPORT',
        scopeRefId: ticketId,
        actorId: closedById,
        occurredAt: new Date(),
        summary: `Ticket closed${resolution ? ': ' + resolution : ''}`,
        metadata: JSON.stringify({ ticketId, resolution }),
      },
    });
    
    return ticket;
  } catch (error) {
    logger.error({ error, ticketId }, '❌ Failed to close ticket');
    throw error;
  }
}

