import { Worker, Job } from 'bullmq';
import { prisma } from '../db';
import { logger } from '../logger';
import { getRedisClient } from '../config/redis';
import { supportQueues, useBullMQ } from '../config/bullmq';

/**
 * Check for SLA breaches and escalate tickets
 */
export async function checkSlaBreaches() {
  try {
    const now = new Date();
    
    // Find tickets that are past their SLA due date and not yet escalated
    const breachedTickets = await prisma.supportTicket.findMany({
      where: {
        slaDueAt: {
          lte: now,
        },
        status: {
          notIn: ['CLOSED', 'RESOLVED', 'ESCALATED'],
        },
      },
      include: {
        assignedTo: true,
        requester: true,
      },
    });
    
    logger.info(`🔍 SLA Check: Found ${breachedTickets.length} breached tickets`);
    
    for (const ticket of breachedTickets) {
      // Calculate how long past SLA
      const minutesPastSla = Math.floor(
        (now.getTime() - ticket.slaDueAt!.getTime()) / 1000 / 60
      );
      
      logger.warn({
        ticketId: ticket.id,
        subject: ticket.subject,
        severity: ticket.severity,
        minutesPastSla,
      }, '⚠️  SLA breach detected');
      
      // Auto-escalate if breach is significant (>2 hours for non-critical, >30 min for critical)
      const shouldEscalate = 
        (ticket.severity === 'CRITICAL' && minutesPastSla > 30) ||
        (ticket.severity === 'HIGH' && minutesPastSla > 60) ||
        (ticket.severity === 'NORMAL' && minutesPastSla > 120);
      
      if (shouldEscalate && ticket.status !== 'ESCALATED') {
        await prisma.supportTicket.update({
          where: { id: ticket.id },
          data: { 
            status: 'ESCALATED',
            auditTrail: JSON.stringify([
              ...(ticket.auditTrail ? JSON.parse(ticket.auditTrail) : []),
              {
                action: 'AUTO_ESCALATED',
                reason: `SLA breach: ${minutesPastSla} minutes past due`,
                timestamp: now.toISOString(),
              },
            ]),
          },
        });
        
        logger.warn({
          ticketId: ticket.id,
          minutesPastSla,
        }, '🚨 Ticket auto-escalated due to SLA breach');
        
        // Queue email notification to supervisors
        if (useBullMQ) {
          await supportQueues.emailNotification.add('sla-breach-alert', {
            ticketId: ticket.id,
            type: 'SLA_BREACH',
            minutesPastSla,
          });
        }
      }
    }
    
    return { checkedCount: breachedTickets.length };
  } catch (error) {
    logger.error({ error }, '❌ SLA check failed');
    throw error;
  }
}

/**
 * Initialize SLA check worker (BullMQ)
 */
export function initSlaCheckWorker() {
  if (!useBullMQ) return null;
  
  const worker = new Worker(
    'support-sla-check',
    async (job: Job) => {
      logger.info('⏰ Running scheduled SLA check');
      return await checkSlaBreaches();
    },
    {
      connection: getRedisClient() as any,
      concurrency: 1, // Only one SLA check at a time
    }
  );
  
  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, '✅ SLA check completed');
  });
  
  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, '❌ SLA check failed');
  });
  
  logger.info('✅ SLA check worker initialized');
  return worker;
}

// Schedule recurring SLA checks (every 10 minutes)
export async function scheduleSlaChecks() {
  if (!useBullMQ) return;
  
  await supportQueues.slaCheck.add(
    'recurring-sla-check',
    {},
    {
      repeat: {
        pattern: '*/10 * * * *', // Every 10 minutes
      },
      jobId: 'sla-check-recurring', // Prevents duplicates
    }
  );
  
  logger.info('✅ Recurring SLA checks scheduled (every 10 minutes)');
}

