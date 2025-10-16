import { prisma } from '../db';
import { logger } from '../logger';

export interface CostBreakdown {
  renderCostCents: number;
  redisCostCents: number;
  databaseCostCents: number;
  sendGridCostCents: number;
  stripeFeesCents: number;
  storageCostCents: number;
  totalCostCents: number;
}

export interface CostTrend {
  date: string;
  totalCostCents: number;
  breakdown: CostBreakdown;
}

export interface UsageMetrics {
  requestVolume: number;
  queueDepthAvg: number;
  databaseConnections: number;
  cacheHitRate: number;
}

class CostTrackingService {
  /**
   * Get Render hosting costs (estimated)
   * Based on instance type and usage
   */
  async getRenderCosts(): Promise<number> {
    // Render pricing (approximate):
    // - Web Service: $7/month for starter, $25/month for pro
    // - Background Worker: $7/month
    // Assume pro web + worker = $32/month = $3200 cents/month
    
    const monthlyRenderCostCents = 3200;
    const dailyCostCents = Math.floor(monthlyRenderCostCents / 30);
    
    return dailyCostCents;
  }

  /**
   * Get Redis costs (estimated)
   * Based on memory usage and operations
   */
  async getRedisCosts(): Promise<number> {
    try {
      // Redis cloud pricing (approximate):
      // - 30MB free tier
      // - $5/month for 250MB
      // - $15/month for 1GB
      
      // Mock calculation - in production, query Redis cloud API
      const estimatedMemoryMB = 100; // From redis.info('memory')
      
      let monthlyCostCents = 0;
      if (estimatedMemoryMB <= 30) {
        monthlyCostCents = 0;
      } else if (estimatedMemoryMB <= 250) {
        monthlyCostCents = 500;
      } else if (estimatedMemoryMB <= 1024) {
        monthlyCostCents = 1500;
      } else {
        monthlyCostCents = 1500 + Math.floor((estimatedMemoryMB - 1024) / 1024) * 1500;
      }
      
      return Math.floor(monthlyCostCents / 30);
    } catch (error) {
      logger.error('Failed to calculate Redis costs:', error);
      return 0;
    }
  }

  /**
   * Get database costs (estimated)
   * Based on storage and connection usage
   */
  async getDatabaseCosts(): Promise<number> {
    try {
      // Render PostgreSQL pricing (approximate):
      // - Free tier: 1GB storage, 97 hrs/month
      // - Starter: $7/month for 1GB, 400 hrs/month
      // - Pro: $25/month for 10GB, 730 hrs/month
      
      // For SQLite in dev, estimate based on file size
      // For production PostgreSQL, assume starter plan
      const monthlyCostCents = 700; // $7 starter plan
      
      return Math.floor(monthlyCostCents / 30);
    } catch (error) {
      logger.error('Failed to calculate database costs:', error);
      return 0;
    }
  }

  /**
   * Get SendGrid costs
   * Based on email volume
   */
  async getSendGridCosts(): Promise<number> {
    try {
      // SendGrid pricing:
      // - Free: 100 emails/day
      // - Essentials: $19.95/month for 50k emails/month
      // - Pro: $89.95/month for 100k emails/month
      
      // Mock calculation - in production, query actual usage
      const estimatedEmailsPerDay = 200;
      const estimatedEmailsPerMonth = estimatedEmailsPerDay * 30;
      
      let monthlyCostCents = 0;
      if (estimatedEmailsPerMonth <= 3000) { // 100/day * 30
        monthlyCostCents = 0;
      } else if (estimatedEmailsPerMonth <= 50000) {
        monthlyCostCents = 1995;
      } else if (estimatedEmailsPerMonth <= 100000) {
        monthlyCostCents = 8995;
      } else {
        // $0.001 per email after 100k
        const overageEmails = estimatedEmailsPerMonth - 100000;
        monthlyCostCents = 8995 + Math.floor(overageEmails * 0.1);
      }
      
      return Math.floor(monthlyCostCents / 30);
    } catch (error) {
      logger.error('Failed to calculate SendGrid costs:', error);
      return 0;
    }
  }

  /**
   * Get Stripe fees
   * Aggregated from LedgerEntry
   */
  async getStripeFees(startDate: Date, endDate: Date): Promise<number> {
    try {
      const fees = await prisma.ledgerEntry.aggregate({
        where: {
          type: 'PROCESSING_FEE',
          occurredAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amountCents: true
        }
      });

      return Math.abs(fees._sum.amountCents || 0);
    } catch (error) {
      logger.error('Failed to get Stripe fees:', error);
      return 0;
    }
  }

  /**
   * Get storage costs
   * Based on file storage usage
   */
  async getStorageCosts(): Promise<number> {
    // Render includes 100GB storage free with web services
    // Beyond that, estimate $0.10/GB/month
    
    // Mock calculation - in production, query actual storage usage
    const estimatedStorageGB = 5;
    const freeStorageGB = 100;
    
    if (estimatedStorageGB <= freeStorageGB) {
      return 0;
    }
    
    const overageGB = estimatedStorageGB - freeStorageGB;
    const monthlyCostCents = Math.floor(overageGB * 10); // $0.10/GB
    
    return Math.floor(monthlyCostCents / 30);
  }

  /**
   * Get current day's cost snapshot
   */
  async getDailySnapshot(): Promise<CostBreakdown> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Try to get from database first
      const snapshot = await prisma.costSnapshot.findFirst({
        where: {
          date: {
            gte: today
          }
        },
        orderBy: {
          date: 'desc'
        }
      });

      if (snapshot) {
        return {
          renderCostCents: snapshot.renderCostCents,
          redisCostCents: snapshot.redisCostCents,
          databaseCostCents: snapshot.databaseCostCents,
          sendGridCostCents: snapshot.sendGridCostCents,
          stripeFeesCents: snapshot.stripeFeesCents,
          storageCostCents: snapshot.storageCostCents,
          totalCostCents: snapshot.totalCostCents
        };
      }

      // Calculate fresh if no snapshot exists
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const [render, redis, database, sendGrid, stripe, storage] = await Promise.all([
        this.getRenderCosts(),
        this.getRedisCosts(),
        this.getDatabaseCosts(),
        this.getSendGridCosts(),
        this.getStripeFees(today, endOfDay),
        this.getStorageCosts()
      ]);

      const totalCostCents = render + redis + database + sendGrid + stripe + storage;

      return {
        renderCostCents: render,
        redisCostCents: redis,
        databaseCostCents: database,
        sendGridCostCents: sendGrid,
        stripeFeesCents: stripe,
        storageCostCents: storage,
        totalCostCents
      };
    } catch (error) {
      logger.error('Failed to get daily cost snapshot:', error);
      throw error;
    }
  }

  /**
   * Get 30-day cost trend
   */
  async getMonthlyTrend(): Promise<CostTrend[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const snapshots = await prisma.costSnapshot.findMany({
        where: {
          date: {
            gte: thirtyDaysAgo
          }
        },
        orderBy: {
          date: 'asc'
        }
      });

      return snapshots.map(s => ({
        date: s.date.toISOString().split('T')[0],
        totalCostCents: s.totalCostCents,
        breakdown: {
          renderCostCents: s.renderCostCents,
          redisCostCents: s.redisCostCents,
          databaseCostCents: s.databaseCostCents,
          sendGridCostCents: s.sendGridCostCents,
          stripeFeesCents: s.stripeFeesCents,
          storageCostCents: s.storageCostCents,
          totalCostCents: s.totalCostCents
        }
      }));
    } catch (error) {
      logger.error('Failed to get monthly cost trend:', error);
      throw error;
    }
  }

  /**
   * Get usage metrics
   */
  async getUsageMetrics(): Promise<UsageMetrics> {
    try {
      // Mock metrics - in production, aggregate from monitoring
      return {
        requestVolume: 15000, // requests in last 24h
        queueDepthAvg: 45, // average queue depth
        databaseConnections: 12, // active connections
        cacheHitRate: 92.5 // percentage
      };
    } catch (error) {
      logger.error('Failed to get usage metrics:', error);
      throw error;
    }
  }

  /**
   * Create daily cost snapshot (run via cron)
   */
  async createDailySnapshot(): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if snapshot already exists for today
      const existing = await prisma.costSnapshot.findFirst({
        where: {
          date: {
            gte: today
          }
        }
      });

      if (existing) {
        logger.info('Cost snapshot already exists for today');
        return;
      }

      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const [render, redis, database, sendGrid, stripe, storage] = await Promise.all([
        this.getRenderCosts(),
        this.getRedisCosts(),
        this.getDatabaseCosts(),
        this.getSendGridCosts(),
        this.getStripeFees(today, endOfDay),
        this.getStorageCosts()
      ]);

      const totalCostCents = render + redis + database + sendGrid + stripe + storage;
      const usageMetrics = await this.getUsageMetrics();

      await prisma.costSnapshot.create({
        data: {
          date: today,
          renderCostCents: render,
          redisCostCents: redis,
          databaseCostCents: database,
          sendGridCostCents: sendGrid,
          stripeFeesCents: stripe,
          storageCostCents: storage,
          totalCostCents,
          requestVolume: usageMetrics.requestVolume,
          queueDepthAvg: usageMetrics.queueDepthAvg
        }
      });

      logger.info({ totalCostCents, date: today }, 'Created daily cost snapshot');
    } catch (error) {
      logger.error('Failed to create daily cost snapshot:', error);
      throw error;
    }
  }
}

export const costTrackingService = new CostTrackingService();

