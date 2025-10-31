import { Worker, Job } from 'bullmq';
import { prisma } from '../db';
import { logger } from '../logger';
import { getRedisClient } from '../config/redis';
import { supportQueues, useBullMQ } from '../config/bullmq';

/**
 * Auto-close resolved tickets after 48 hours of inactivity
 */
export async function autoCloseResolvedTickets() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - 48); // 48 hours ago
    
    // Find resolved tickets older than 48 hours
    const ticketsToClose = await prisma.supportTicket.findMany({
      where: {
        status: 'RESOLVED',
        updatedAt: {
          lte: cutoffDate,
        },
      },
    });
    
    logger.info(`🔍 Auto-close check: Found ${ticketsToClose.length} resolved tickets to close`);
    
    for (const ticket of ticketsToClose) {
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { 
          status: 'CLOSED',
          auditTrail: JSON.stringify([
            ...(ticket.auditTrail ? JSON.parse(ticket.auditTrail) : []),
            {
              action: 'AUTO_CLOSED',
              reason: 'Ticket resolved for 48+ hours with no activity',
              timestamp: new Date().toISOString(),
            },
          ]),
        },
      });
      
      logger.info({
        ticketId: ticket.id,
        subject: ticket.subject,
      }, '✅ Ticket auto-closed');
    }
    
    return { closedCount: ticketsToClose.length };
  } catch (error) {
    logger.error({ error }, '❌ Auto-close check failed');
    throw error;
  }
}

/**
 * Initialize auto-close worker (BullMQ)
 */
export function initAutoCloseWorker() {
  if (!useBullMQ) return null;
  
  const worker = new Worker(
    'support-auto-close',
    async (job: Job) => {
      logger.info('⏰ Running scheduled auto-close check');
      return await autoCloseResolvedTickets();
    },
    {
      // BullMQ requires maxRetriesPerRequest: null and enableReadyCheck: false
      // to prevent connection issues and ensure proper job processing
      connection: {
        ...getRedisClient(),
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      } as any,
      concurrency: 1,
    }
  );
  
  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, '✅ Auto-close check completed');
  });
  
  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, '❌ Auto-close check failed');
  });
  
  logger.info('✅ Auto-close worker initialized');
  return worker;
}

// Schedule recurring auto-close checks (daily at 2 AM)
export async function scheduleAutoClose() {
  if (!useBullMQ) return;
  
  await supportQueues.autoClose.add(
    'recurring-auto-close',
    {},
    {
      repeat: {
        pattern: '0 2 * * *', // Daily at 2 AM
      },
      jobId: 'auto-close-recurring',
    }
  );
  
  logger.info('✅ Recurring auto-close checks scheduled (daily at 2 AM)');
}

