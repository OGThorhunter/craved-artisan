import { Worker, Job } from 'bullmq';
import { prisma } from '../db';
import { logger } from '../logger';
import { getRedisClient } from '../config/redis';
import { useBullMQ } from '../config/bullmq';

interface AITriageJob {
  ticketId: string;
  subject: string;
  description: string;
}

/**
 * AI triage: Auto-categorize and tag ticket
 * This will be implemented fully in the support-ai.service.ts
 */
export async function triageTicket(jobData: AITriageJob) {
  try {
    logger.info({
      ticketId: jobData.ticketId,
    }, '🤖 AI triaging ticket');
    
    // Import AI service (will be created in Phase 3)
    // const { classifyTicket, extractTags } = await import('../services/support-ai.service');
    
    // For now, simple keyword-based categorization as fallback
    const { ticketId, subject, description } = jobData;
    const text = `${subject} ${description}`.toLowerCase();
    
    let suggestedCategory = 'OTHER';
    const suggestedTags: string[] = [];
    
    // Simple keyword matching
    if (text.includes('payment') || text.includes('refund') || text.includes('charge')) {
      suggestedCategory = 'PAYMENT';
      suggestedTags.push('payment');
    } else if (text.includes('order') || text.includes('delivery') || text.includes('shipping')) {
      suggestedCategory = 'ORDER';
      suggestedTags.push('order');
    } else if (text.includes('account') || text.includes('login') || text.includes('password')) {
      suggestedCategory = 'ACCOUNT';
      suggestedTags.push('account');
    } else if (text.includes('bug') || text.includes('error') || text.includes('broken')) {
      suggestedCategory = 'TECH';
      suggestedTags.push('bug');
    }
    
    // Update ticket with AI suggestions
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        category: suggestedCategory as any,
        tags: JSON.stringify(suggestedTags),
        metadata: JSON.stringify({
          aiTriaged: true,
          triageDate: new Date().toISOString(),
          method: 'keyword-fallback',
        }),
      },
    });
    
    logger.info({
      ticketId,
      suggestedCategory,
      suggestedTags,
    }, '✅ Ticket triaged by AI');
    
    return { category: suggestedCategory, tags: suggestedTags };
  } catch (error) {
    logger.error({ error, ticketId: jobData.ticketId }, '❌ AI triage failed');
    throw error;
  }
}

/**
 * Initialize AI triage worker (BullMQ)
 */
export function initAITriageWorker() {
  if (!useBullMQ) return null;
  
  const worker = new Worker(
    'support-ai-triage',
    async (job: Job<AITriageJob>) => {
      logger.info({ jobId: job.id, ticketId: job.data.ticketId }, '🤖 Processing AI triage job');
      return await triageTicket(job.data);
    },
    {
      connection: getRedisClient() as any,
      concurrency: 3, // Process up to 3 AI requests simultaneously
    }
  );
  
  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, '✅ AI triage job completed');
  });
  
  worker.on('failed', (job, err) => {
    logger.error({ 
      jobId: job?.id, 
      error: err.message,
      attempts: job?.attemptsMade,
    }, '❌ AI triage job failed');
  });
  
  logger.info('✅ AI triage worker initialized');
  return worker;
}

