import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const prisma = new PrismaClient();

export interface SLI {
  name: string;
  value: number;
  target: number;
  window: '7d' | '30d';
  timestamp: Date;
}

export interface SLO {
  name: string;
  description: string;
  sli: string;
  target: number; // 99.9 = 99.9%
  window: '7d' | '30d';
  errorBudget: number;
  burnRate: number;
  status: 'OK' | 'WARN' | 'CRIT';
}

export class SLOMonitor {
  private static instance: SLOMonitor;
  
  public static getInstance(): SLOMonitor {
    if (!SLOMonitor.instance) {
      SLOMonitor.instance = new SLOMonitor();
    }
    return SLOMonitor.instance;
  }

  // Calculate availability SLO (5xx error rate)
  async calculateAvailabilitySLO(window: '7d' | '30d'): Promise<SLO> {
    const days = window === '7d' ? 7 : 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    try {
      // Mock data for now - in production, this would query actual metrics
      const totalRequests = 1000000;
      const errorRequests = 500; // 0.05% error rate
      const availability = ((totalRequests - errorRequests) / totalRequests) * 100;
      
      const target = 99.9;
      const errorBudget = target - availability;
      const burnRate = errorBudget / (days * 24); // per hour burn rate
      
      let status: 'OK' | 'WARN' | 'CRIT' = 'OK';
      if (errorBudget > 0.1) status = 'WARN';
      if (errorBudget > 0.5) status = 'CRIT';
      
      return {
        name: 'API Availability',
        description: 'Percentage of successful HTTP requests',
        sli: 'availability',
        target,
        window,
        errorBudget,
        burnRate,
        status
      };
    } catch (error) {
      logger.error('Failed to calculate availability SLO:', error);
      return {
        name: 'API Availability',
        description: 'Percentage of successful HTTP requests',
        sli: 'availability',
        target: 99.9,
        window,
        errorBudget: 0,
        burnRate: 0,
        status: 'CRIT' as const
      };
    }
  }

  // Calculate latency SLO (p95 response time)
  async calculateLatencySLO(window: '7d' | '30d'): Promise<SLO> {
    const days = window === '7d' ? 7 : 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    try {
      // Mock data for now
      const p95Latency = 250; // 250ms p95
      const target = 500; // 500ms target
      const errorBudget = target - p95Latency;
      const burnRate = errorBudget / (days * 24);
      
      let status: 'OK' | 'WARN' | 'CRIT' = 'OK';
      if (p95Latency > target * 0.8) status = 'WARN';
      if (p95Latency > target) status = 'CRIT';
      
      return {
        name: 'API Latency',
        description: '95th percentile response time',
        sli: 'latency',
        target,
        window,
        errorBudget,
        burnRate,
        status
      };
    } catch (error) {
      logger.error('Failed to calculate latency SLO:', error);
      return {
        name: 'API Latency',
        description: '95th percentile response time',
        sli: 'latency',
        target: 500,
        window,
        errorBudget: 0,
        burnRate: 0,
        status: 'CRIT' as const
      };
    }
  }

  // Calculate error rate SLO
  async calculateErrorRateSLO(window: '7d' | '30d'): Promise<SLO> {
    const days = window === '7d' ? 7 : 30;
    
    try {
      // Mock data
      const errorRate = 0.1; // 0.1% error rate
      const target = 0.5; // 0.5% target
      const errorBudget = target - errorRate;
      const burnRate = errorBudget / (days * 24);
      
      let status: 'OK' | 'WARN' | 'CRIT' = 'OK';
      if (errorRate > target * 0.5) status = 'WARN';
      if (errorRate > target) status = 'CRIT';
      
      return {
        name: 'Error Rate',
        description: 'Percentage of failed requests',
        sli: 'error_rate',
        target,
        window,
        errorBudget,
        burnRate,
        status
      };
    } catch (error) {
      logger.error('Failed to calculate error rate SLO:', error);
      return {
        name: 'Error Rate',
        description: 'Percentage of failed requests',
        sli: 'error_rate',
        target: 0.5,
        window,
        errorBudget: 0,
        burnRate: 0,
        status: 'CRIT' as const
      };
    }
  }

  // Calculate queue age SLO
  async calculateQueueAgeSLO(window: '7d' | '30d'): Promise<SLO> {
    const days = window === '7d' ? 7 : 30;
    
    try {
      // Mock data
      const avgQueueAge = 30; // 30 seconds average
      const target = 300; // 5 minutes target
      const errorBudget = target - avgQueueAge;
      const burnRate = errorBudget / (days * 24);
      
      let status: 'OK' | 'WARN' | 'CRIT' = 'OK';
      if (avgQueueAge > target * 0.5) status = 'WARN';
      if (avgQueueAge > target) status = 'CRIT';
      
      return {
        name: 'Queue Age',
        description: 'Average time jobs spend in queue',
        sli: 'queue_age',
        target,
        window,
        errorBudget,
        burnRate,
        status
      };
    } catch (error) {
      logger.error('Failed to calculate queue age SLO:', error);
      return {
        name: 'Queue Age',
        description: 'Average time jobs spend in queue',
        sli: 'queue_age',
        target: 300,
        window,
        errorBudget: 0,
        burnRate: 0,
        status: 'CRIT' as const
      };
    }
  }

  // Get all SLOs for a time window
  async getAllSLOs(window: '7d' | '30d'): Promise<SLO[]> {
    try {
      const [availability, latency, errorRate, queueAge] = await Promise.all([
        this.calculateAvailabilitySLO(window),
        this.calculateLatencySLO(window),
        this.calculateErrorRateSLO(window),
        this.calculateQueueAgeSLO(window)
      ]);
      
      return [availability, latency, errorRate, queueAge];
    } catch (error) {
      logger.error('Failed to get SLOs:', error);
      return [];
    }
  }

  // Get SLO burn rate over time (for charts)
  async getSLOBurnRate(sli: string, window: '7d' | '30d'): Promise<Array<{ timestamp: Date; burnRate: number; errorBudget: number }>> {
    const days = window === '7d' ? 7 : 30;
    const data: Array<{ timestamp: Date; burnRate: number; errorBudget: number }> = [];
    
    // Generate mock time series data
    for (let i = days; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const burnRate = Math.random() * 0.1; // Random burn rate
      const errorBudget = Math.max(0, 1 - (burnRate * i)); // Decreasing error budget
      
      data.push({ timestamp, burnRate, errorBudget });
    }
    
    return data;
  }

  // Get overall SLO status
  async getOverallSLOStatus(window: '7d' | '30d'): Promise<{
    status: 'OK' | 'WARN' | 'CRIT';
    slos: SLO[];
    summary: {
      total: number;
      ok: number;
      warn: number;
      crit: number;
    };
  }> {
    const slos = await this.getAllSLOs(window);
    
    const summary = {
      total: slos.length,
      ok: slos.filter(slo => slo.status === 'OK').length,
      warn: slos.filter(slo => slo.status === 'WARN').length,
      crit: slos.filter(slo => slo.status === 'CRIT').length
    };
    
    let overallStatus: 'OK' | 'WARN' | 'CRIT' = 'OK';
    if (summary.crit > 0) {
      overallStatus = 'CRIT';
    } else if (summary.warn > 0) {
      overallStatus = 'WARN';
    }
    
    return {
      status: overallStatus,
      slos,
      summary
    };
  }
}

// Export singleton instance
export const sloMonitor = SLOMonitor.getInstance();
