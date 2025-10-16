import { logger } from '../logger';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

type ServiceStatus = 'OK' | 'WARN' | 'CRIT';

interface IntegrationStatus {
  service: string;
  status: ServiceStatus;
  message: string;
  lastChecked: Date;
  details?: any;
}

export class IntegrationsStatusService {
  /**
   * Check Stripe integration status
   */
  async checkStripe(): Promise<IntegrationStatus> {
    try {
      const hasKey = !!process.env.STRIPE_SECRET_KEY;
      
      if (!hasKey) {
        return {
          service: 'Stripe',
          status: 'CRIT',
          message: 'Stripe secret key not configured',
          lastChecked: new Date()
        };
      }

      // Test API call
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2024-11-20.acacia'
      });

      const balance = await stripe.balance.retrieve();

      return {
        service: 'Stripe',
        status: 'OK',
        message: 'Connected successfully',
        lastChecked: new Date(),
        details: {
          available: balance.available,
          pending: balance.pending,
          currency: balance.available[0]?.currency || 'usd'
        }
      };
    } catch (error) {
      logger.error({ error }, 'Stripe health check failed');
      return {
        service: 'Stripe',
        status: 'CRIT',
        message: error instanceof Error ? error.message : 'Connection failed',
        lastChecked: new Date()
      };
    }
  }

  /**
   * Check Redis status
   */
  async checkRedis(): Promise<IntegrationStatus> {
    try {
      const startTime = Date.now();
      
      // Import redis service
      const { redisCacheService } = await import('./redis-cache.service');
      
      // Test ping
      await redisCacheService.set('health:check', 'ok', 5);
      const value = await redisCacheService.get('health:check');
      
      const latency = Date.now() - startTime;
      
      if (value !== 'ok') {
        throw new Error('Redis read/write test failed');
      }

      // Get memory stats
      const memoryStats = await redisCacheService.getMemoryStats();

      return {
        service: 'Redis',
        status: memoryStats.usedMemoryPercent > 90 ? 'CRIT' : 
                memoryStats.usedMemoryPercent > 75 ? 'WARN' : 'OK',
        message: `Connected (${latency}ms latency)`,
        lastChecked: new Date(),
        details: {
          latency: `${latency}ms`,
          memoryUsed: memoryStats.usedMemoryPercent.toFixed(1) + '%',
          hitRate: memoryStats.hitRate?.toFixed(1) + '%'
        }
      };
    } catch (error) {
      logger.error({ error }, 'Redis health check failed');
      return {
        service: 'Redis',
        status: 'WARN',
        message: 'Using in-memory fallback',
        lastChecked: new Date()
      };
    }
  }

  /**
   * Check Postgres database status
   */
  async checkPostgres(): Promise<IntegrationStatus> {
    try {
      const startTime = Date.now();
      
      // Test query
      await prisma.$queryRaw`SELECT 1`;
      
      const latency = Date.now() - startTime;

      // Get connection info
      const result = await prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'
      `;
      
      const tableCount = result[0]?.count || 0;

      return {
        service: 'Database',
        status: latency > 1000 ? 'WARN' : 'OK',
        message: `Connected (${latency}ms latency)`,
        lastChecked: new Date(),
        details: {
          latency: `${latency}ms`,
          tables: tableCount,
          type: 'SQLite'
        }
      };
    } catch (error) {
      logger.error({ error }, 'Postgres health check failed');
      return {
        service: 'Database',
        status: 'CRIT',
        message: error instanceof Error ? error.message : 'Connection failed',
        lastChecked: new Date()
      };
    }
  }

  /**
   * Check SendGrid status
   */
  async checkSendGrid(): Promise<IntegrationStatus> {
    try {
      const hasKey = !!process.env.SENDGRID_API_KEY;
      
      if (!hasKey) {
        return {
          service: 'SendGrid',
          status: 'WARN',
          message: 'API key not configured',
          lastChecked: new Date()
        };
      }

      // For now, just check if key exists
      // TODO: Add actual API health check when SendGrid client is set up
      return {
        service: 'SendGrid',
        status: 'OK',
        message: 'API key configured',
        lastChecked: new Date(),
        details: {
          keyMasked: `***${process.env.SENDGRID_API_KEY.slice(-4)}`
        }
      };
    } catch (error) {
      logger.error({ error }, 'SendGrid health check failed');
      return {
        service: 'SendGrid',
        status: 'WARN',
        message: error instanceof Error ? error.message : 'Check failed',
        lastChecked: new Date()
      };
    }
  }

  /**
   * Check Twilio status
   */
  async checkTwilio(): Promise<IntegrationStatus> {
    try {
      const hasSid = !!process.env.TWILIO_SID;
      const hasToken = !!process.env.TWILIO_AUTH_TOKEN;
      const hasPhone = !!process.env.TWILIO_PHONE;
      
      if (!hasSid || !hasToken || !hasPhone) {
        return {
          service: 'Twilio',
          status: 'WARN',
          message: 'Credentials not fully configured',
          lastChecked: new Date(),
          details: {
            sid: hasSid ? 'configured' : 'missing',
            token: hasToken ? 'configured' : 'missing',
            phone: hasPhone ? 'configured' : 'missing'
          }
        };
      }

      // For now, just check if credentials exist
      // TODO: Add actual API health check when needed
      return {
        service: 'Twilio',
        status: 'OK',
        message: 'Credentials configured',
        lastChecked: new Date(),
        details: {
          phone: process.env.TWILIO_PHONE
        }
      };
    } catch (error) {
      logger.error({ error }, 'Twilio health check failed');
      return {
        service: 'Twilio',
        status: 'WARN',
        message: error instanceof Error ? error.message : 'Check failed',
        lastChecked: new Date()
      };
    }
  }

  /**
   * Check S3 status
   */
  async checkS3(): Promise<IntegrationStatus> {
    try {
      const hasAccessKey = !!process.env.AWS_ACCESS_KEY_ID;
      const hasSecretKey = !!process.env.AWS_SECRET_ACCESS_KEY;
      const hasBucket = !!process.env.AWS_S3_BUCKET;
      const hasRegion = !!process.env.AWS_REGION;
      
      if (!hasAccessKey || !hasSecretKey || !hasBucket || !hasRegion) {
        return {
          service: 'S3',
          status: 'WARN',
          message: 'S3 not configured (compliance uploads disabled)',
          lastChecked: new Date(),
          details: {
            accessKey: hasAccessKey ? 'configured' : 'missing',
            secretKey: hasSecretKey ? 'configured' : 'missing',
            bucket: hasBucket ? process.env.AWS_S3_BUCKET : 'missing',
            region: hasRegion ? process.env.AWS_REGION : 'missing'
          }
        };
      }

      // For now, just check if credentials exist
      // TODO: Add actual S3 connection test when AWS SDK is set up
      return {
        service: 'S3',
        status: 'OK',
        message: 'Credentials configured',
        lastChecked: new Date(),
        details: {
          bucket: process.env.AWS_S3_BUCKET,
          region: process.env.AWS_REGION
        }
      };
    } catch (error) {
      logger.error({ error }, 'S3 health check failed');
      return {
        service: 'S3',
        status: 'WARN',
        message: error instanceof Error ? error.message : 'Check failed',
        lastChecked: new Date()
      };
    }
  }

  /**
   * Check TaxJar status (coming soon)
   */
  async checkTaxJar(): Promise<IntegrationStatus> {
    return {
      service: 'TaxJar',
      status: 'WARN',
      message: 'Coming Soon - Not yet integrated',
      lastChecked: new Date()
    };
  }

  /**
   * Get all integration statuses
   */
  async getAllStatuses(): Promise<IntegrationStatus[]> {
    try {
      const statuses = await Promise.all([
        this.checkStripe(),
        this.checkRedis(),
        this.checkPostgres(),
        this.checkSendGrid(),
        this.checkTwilio(),
        this.checkS3(),
        this.checkTaxJar()
      ]);

      return statuses;
    } catch (error) {
      logger.error({ error }, 'Failed to get all integration statuses');
      throw error;
    }
  }

  /**
   * Test a specific integration
   */
  async testIntegration(service: string): Promise<IntegrationStatus> {
    switch (service.toLowerCase()) {
      case 'stripe':
        return this.checkStripe();
      case 'redis':
        return this.checkRedis();
      case 'database':
      case 'postgres':
        return this.checkPostgres();
      case 'sendgrid':
        return this.checkSendGrid();
      case 'twilio':
        return this.checkTwilio();
      case 's3':
        return this.checkS3();
      case 'taxjar':
        return this.checkTaxJar();
      default:
        throw new Error(`Unknown service: ${service}`);
    }
  }
}

export const integrationsStatusService = new IntegrationsStatusService();

