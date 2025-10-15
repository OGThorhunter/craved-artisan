import cron from 'node-cron';
import { systemHealth } from './system-health';
import { logger } from '../logger';
import { verifyAuditChain } from '../jobs/audit-verify';

export class CronJobService {
  private static instance: CronJobService;
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  public static getInstance(): CronJobService {
    if (!CronJobService.instance) {
      CronJobService.instance = new CronJobService();
    }
    return CronJobService.instance;
  }

  public startAllJobs(): void {
    logger.info('Starting cron jobs...');

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

    logger.info(`Started ${this.jobs.size} cron jobs`);
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
























