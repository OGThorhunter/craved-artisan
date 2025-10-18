import cron from 'node-cron';
import { systemHealth } from './system-health';
import { logger } from '../logger';
import { verifyAuditChain } from '../jobs/audit-verify';
import { costTrackingService } from './cost-tracking.service';
import { maintenanceModeService } from './maintenance-mode.service';
import { profitLossService } from './profit-loss.service';

export class CronJobService {
  private static instance: CronJobService;
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  public static getInstance(): CronJobService {
    if (!CronJobService.instance) {
      CronJobService.instance = new CronJobService();
    }
    return CronJobService.instance;
  }

  public async startAllJobs(): Promise<void> {
    logger.info('Starting cron jobs...');
    
    // Wait for Prisma client to be ready
    try {
      await this.waitForDatabaseConnection();
    } catch (error) {
      logger.error('Database not ready, starting cron jobs anyway:', error);
    }

    // System health checks every 5 minutes
    this.scheduleJob('health-checks', '*/5 * * * *', async () => {
      try {
        logger.info('Running scheduled health checks...');
        await systemHealth.runAllChecks();
        logger.info('Health checks completed successfully');
      } catch (error) {
        logger.error('Health checks failed:', error);
      }
    });

    // Database maintenance every hour
    this.scheduleJob('db-maintenance', '0 * * * *', async () => {
      try {
        logger.info('Running database maintenance...');
        // Add database maintenance tasks here
        logger.info('Database maintenance completed');
      } catch (error) {
        logger.error('Database maintenance failed:', error);
      }
    });

    // System cleanup every day at 2 AM
    this.scheduleJob('system-cleanup', '0 2 * * *', async () => {
      try {
        logger.info('Running system cleanup...');
        // Add cleanup tasks here (old logs, temp files, etc.)
        logger.info('System cleanup completed');
      } catch (error) {
        logger.error('System cleanup failed:', error);
      }
    });

    // Audit chain verification every Sunday at 2 AM
    this.scheduleJob('audit-verification', '0 2 * * 0', async () => {
      try {
        logger.info('Running weekly audit chain verification...');
        const result = await verifyAuditChain();
        
        if (!result.isValid) {
          logger.error({
            ...result,
            message: 'CRITICAL: Audit chain integrity compromised!',
          }, 'Audit chain verification failed');
          // TODO: Send alert email/Slack notification
        }
      } catch (error) {
        logger.error('Audit verification job failed:', error);
      }
    });

    // Daily cost snapshot at 1 AM
    this.scheduleJob('cost-snapshot', '0 1 * * *', async () => {
      try {
        logger.info('Creating daily cost snapshot...');
        await costTrackingService.createDailySnapshot();
        logger.info('Daily cost snapshot created successfully');
      } catch (error) {
        logger.error('Cost snapshot job failed:', error);
      }
    });

    // Monthly P&L generation on 1st of each month at 3 AM
    this.scheduleJob('monthly-pl', '0 3 1 * *', async () => {
      try {
        logger.info('Generating monthly P&L snapshot...');
        
        // Generate P&L for the previous month
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        await profitLossService.generateMonthlyPL(lastMonth);
        logger.info({ month: lastMonth }, 'Monthly P&L snapshot generated successfully');
      } catch (error) {
        logger.error('Monthly P&L generation job failed:', error);
      }
    });

    // Auto-complete expired maintenance windows every 5 minutes
    this.scheduleJob('maintenance-auto-complete', '*/5 * * * *', async () => {
      try {
        await maintenanceModeService.autoCompleteExpired();
      } catch (error) {
        logger.error('Failed to auto-complete expired windows:', error);
      }
    });

    // Support SLA checks every 10 minutes (fallback when BullMQ is disabled)
    if (process.env.USE_BULLMQ !== 'true') {
      this.scheduleJob('support-sla-check', '*/10 * * * *', async () => {
        try {
          logger.info('Running scheduled support SLA check (cron fallback)...');
          const { checkSlaBreaches } = await import('../jobs/support-sla-check');
          await checkSlaBreaches();
        } catch (error) {
          logger.error('Support SLA check failed:', error);
        }
      });

      // Support auto-close checks daily at 2 AM
      this.scheduleJob('support-auto-close', '0 2 * * *', async () => {
        try {
          logger.info('Running scheduled support auto-close (cron fallback)...');
          const { autoCloseResolvedTickets } = await import('../jobs/support-auto-close');
          await autoCloseResolvedTickets();
        } catch (error) {
          logger.error('Support auto-close failed:', error);
        }
      });
    }

    logger.info(`Started ${this.jobs.size} cron jobs`);
  }

  private async waitForDatabaseConnection(maxRetries: number = 10, delay: number = 1000): Promise<void> {
    const { prisma } = await import('../db');
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        logger.info('✅ Database connection verified');
        return;
      } catch (error) {
        logger.warn(`Database connection attempt ${i + 1}/${maxRetries} failed:`, error);
        if (i === maxRetries - 1) {
          throw new Error('Database connection failed after maximum retries');
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  public stopAllJobs(): void {
    logger.info('Stopping cron jobs...');
    
    for (const [name, job] of this.jobs) {
      job.stop();
      logger.info(`Stopped cron job: ${name}`);
    }
    
    this.jobs.clear();
    logger.info('All cron jobs stopped');
  }

  private scheduleJob(name: string, schedule: string, task: () => Promise<void>): void {
    if (this.jobs.has(name)) {
      logger.warn(`Cron job ${name} already exists, skipping...`);
      return;
    }

    const job = cron.schedule(schedule, async () => {
      try {
        await task();
      } catch (error) {
        logger.error(`Cron job ${name} failed:`, error);
      }
    }, {
      scheduled: false, // Don't start immediately
      timezone: 'America/New_York'
    });

    job.start();
    this.jobs.set(name, job);
    
    logger.info(`Scheduled cron job: ${name} (${schedule})`);
  }

  public getJobStatus(): Array<{ name: string; running: boolean; schedule: string }> {
    const status: Array<{ name: string; running: boolean; schedule: string }> = [];
    
    for (const [name, job] of this.jobs) {
      status.push({
        name,
        running: job.running || false,
        schedule: job.options.scheduled ? 'active' : 'inactive'
      });
    }
    
    return status;
  }
}

// Export singleton instance
export const cronJobs = CronJobService.getInstance();
























