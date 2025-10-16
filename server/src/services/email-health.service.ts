import { logger } from '../logger';
import { supportQueues, useBullMQ } from '../config/bullmq';

export interface EmailHealthStatus {
  provider: string;
  isHealthy: boolean;
  lastCheck: Date;
  successRate: number;
  failureRate: number;
  backlogCount: number;
  recentFailures: EmailFailure[];
  bounceRate: number;
  complaintRate: number;
}

export interface EmailFailure {
  timestamp: Date;
  recipient: string;
  error: string;
  errorCode?: string;
}

class EmailHealthService {
  /**
   * Get SendGrid health status
   */
  async getSendGridHealth(): Promise<EmailHealthStatus> {
    try {
      // Check if SendGrid API key is configured
      const apiKey = process.env.SENDGRID_API_KEY;
      if (!apiKey) {
        return {
          provider: 'SendGrid',
          isHealthy: false,
          lastCheck: new Date(),
          successRate: 0,
          failureRate: 100,
          backlogCount: 0,
          recentFailures: [{
            timestamp: new Date(),
            recipient: 'N/A',
            error: 'SendGrid API key not configured',
            errorCode: 'MISSING_CONFIG'
          }],
          bounceRate: 0,
          complaintRate: 0
        };
      }

      // Get queue backlog if BullMQ is enabled
      const backlogCount = useBullMQ ? await this.getEmailQueueBacklog() : 0;

      // Mock data for now - in production, query SendGrid API stats
      const last24hStats = await this.getSendGrid24HourStats();

      return {
        provider: 'SendGrid',
        isHealthy: last24hStats.successRate > 95,
        lastCheck: new Date(),
        successRate: last24hStats.successRate,
        failureRate: last24hStats.failureRate,
        backlogCount,
        recentFailures: last24hStats.recentFailures,
        bounceRate: last24hStats.bounceRate,
        complaintRate: last24hStats.complaintRate
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get SendGrid health');
      throw error;
    }
  }

  /**
   * Get email queue backlog count
   */
  private async getEmailQueueBacklog(): Promise<number> {
    try {
      if (!useBullMQ) return 0;

      const [waiting, delayed] = await Promise.all([
        supportQueues.emailNotification.getWaitingCount(),
        supportQueues.emailNotification.getDelayedCount()
      ]);

      return waiting + delayed;
    } catch (error) {
      logger.error({ error }, 'Failed to get email queue backlog');
      return 0;
    }
  }

  /**
   * Get SendGrid stats for last 24 hours
   * In production, this would query the SendGrid Stats API
   */
  private async getSendGrid24HourStats(): Promise<{
    successRate: number;
    failureRate: number;
    recentFailures: EmailFailure[];
    bounceRate: number;
    complaintRate: number;
  }> {
    // TODO: Implement actual SendGrid API calls
    // For now, return mock data with realistic values
    
    const totalSent = 1000;
    const successful = 985;
    const failed = 15;
    const bounced = 8;
    const complaints = 2;

    const successRate = (successful / totalSent) * 100;
    const failureRate = (failed / totalSent) * 100;
    const bounceRate = (bounced / totalSent) * 100;
    const complaintRate = (complaints / totalSent) * 100;

    // Mock recent failures
    const recentFailures: EmailFailure[] = [
      {
        timestamp: new Date(Date.now() - 3600000),
        recipient: 'invalid@example.com',
        error: 'Invalid email address',
        errorCode: 'INVALID_EMAIL'
      },
      {
        timestamp: new Date(Date.now() - 7200000),
        recipient: 'bounce@example.com',
        error: 'Mailbox full',
        errorCode: 'MAILBOX_FULL'
      }
    ];

    return {
      successRate,
      failureRate,
      recentFailures,
      bounceRate,
      complaintRate
    };
  }

  /**
   * Get overall email/notification health
   */
  async getOverallEmailHealth(): Promise<{
    status: 'OK' | 'WARN' | 'CRIT';
    providers: EmailHealthStatus[];
  }> {
    try {
      const sendGridHealth = await this.getSendGridHealth();
      const providers = [sendGridHealth];

      // Determine overall status
      let status: 'OK' | 'WARN' | 'CRIT' = 'OK';
      
      if (providers.some(p => !p.isHealthy)) {
        status = 'CRIT';
      } else if (providers.some(p => p.backlogCount > 100 || p.successRate < 98)) {
        status = 'WARN';
      }

      return {
        status,
        providers
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get overall email health');
      throw error;
    }
  }
}

export const emailHealthService = new EmailHealthService();

