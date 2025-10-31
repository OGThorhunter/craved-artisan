import { Worker, Job } from 'bullmq';
import { logger } from '../logger';
import { getRedisClient } from '../config/redis';
import { useBullMQ } from '../config/bullmq';

interface EmailJob {
  ticketId: string;
  type: string;
  to: string;
  subject: string;
  body: string;
  metadata?: any;
}

/**
 * Process email notification
 * Note: This is a placeholder. In production, integrate with SendGrid.
 */
export async function sendEmail(emailData: EmailJob) {
  try {
    logger.info({
      ticketId: emailData.ticketId,
      type: emailData.type,
      to: emailData.to,
      subject: emailData.subject,
    }, '📧 Sending support email');
    
    // TODO: Integrate with SendGrid
    // Example:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: emailData.to,
    //   from: process.env.SUPPORT_EMAIL,
    //   subject: emailData.subject,
    //   html: emailData.body,
    // });
    
    // For now, just log it
    logger.info({
      ticketId: emailData.ticketId,
      type: emailData.type,
    }, '✅ Support email logged (SendGrid integration pending)');
    
    return { success: true };
  } catch (error) {
    logger.error({ error, emailData }, '❌ Failed to send support email');
    throw error;
  }
}

/**
 * Initialize email notification worker (BullMQ)
 */
export function initEmailWorker() {
  if (!useBullMQ) return null;
  
  const worker = new Worker(
    'support-email',
    async (job: Job<EmailJob>) => {
      logger.info({ jobId: job.id, type: job.data.type }, '📧 Processing email job');
      return await sendEmail(job.data);
    },
    {
      // BullMQ requires maxRetriesPerRequest: null and enableReadyCheck: false
      // to prevent connection issues and ensure proper job processing
      connection: {
        ...getRedisClient(),
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      } as any,
      concurrency: 5, // Process up to 5 emails simultaneously
    }
  );
  
  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, '✅ Email job completed');
  });
  
  worker.on('failed', (job, err) => {
    logger.error({ 
      jobId: job?.id, 
      error: err.message,
      attempts: job?.attemptsMade,
    }, '❌ Email job failed');
  });
  
  logger.info('✅ Email notification worker initialized');
  return worker;
}

