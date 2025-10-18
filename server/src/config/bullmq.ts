import { Queue, Worker } from 'bullmq';
// Note: QueueScheduler removed in BullMQ v5 - functionality now built into Worker
import { getRedisClient } from './redis';
import { logger } from '../logger';

// Get Redis connection for BullMQ
const redisConnection = getRedisClient();

// Feature flag: Use BullMQ only in production or when explicitly enabled
export const useBullMQ = process.env.USE_BULLMQ === 'true';

/**
 * Support System Job Queues
 */
export const supportQueues = {
  slaCheck: new Queue('support-sla-check', { 
    connection: redisConnection as any,
    defaultJobOptions: {
      removeOnComplete: 100, // Keep last 100 completed jobs
      removeOnFail: 500, // Keep last 500 failed jobs for debugging
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000, // Start with 5 seconds
      },
    },
  }),
  
  emailNotification: new Queue('support-email', { 
    connection: redisConnection as any,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 500,
      attempts: 5, // Email can retry more times
      backoff: {
        type: 'exponential',
        delay: 10000, // Start with 10 seconds for emails
      },
    },
  }),
  
  autoClose: new Queue('support-auto-close', { 
    connection: redisConnection as any,
    defaultJobOptions: {
      removeOnComplete: 50,
      removeOnFail: 100,
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
    },
  }),
  
  aiTriage: new Queue('support-ai-triage', { 
    connection: redisConnection as any,
    defaultJobOptions: {
      removeOnComplete: 200,
      removeOnFail: 200,
      attempts: 2, // AI calls shouldn't retry too much
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
    },
  }),
};

/**
 * Initialize BullMQ workers when enabled
 */
export function initializeSupportWorkers() {
  if (!useBullMQ) {
    logger.info('⚙️  BullMQ disabled - using node-cron fallback for support jobs');
    return;
  }

  logger.info('⚙️  Initializing BullMQ support workers...');
  
  // Workers will be imported and registered in their respective job files
  // This allows for better code organization and lazy loading
  
  logger.info('✅ BullMQ support workers initialized');
}

/**
 * Gracefully close all support queues
 */
export async function closeSupportQueues() {
  logger.info('Closing support job queues...');
  
  await Promise.all([
    supportQueues.slaCheck.close(),
    supportQueues.emailNotification.close(),
    supportQueues.autoClose.close(),
    supportQueues.aiTriage.close(),
  ]);
  
  logger.info('✅ Support job queues closed');
}

/**
 * Get queue statistics for monitoring
 */
export async function getSupportQueueStats() {
  const stats = {
    slaCheck: await getQueueCounts(supportQueues.slaCheck),
    emailNotification: await getQueueCounts(supportQueues.emailNotification),
    autoClose: await getQueueCounts(supportQueues.autoClose),
    aiTriage: await getQueueCounts(supportQueues.aiTriage),
  };
  
  return stats;
}

async function getQueueCounts(queue: Queue) {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);
  
  return { waiting, active, completed, failed, delayed };
}

export { redisConnection };

