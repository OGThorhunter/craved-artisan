import { logger } from '../logger';

export interface SLO {
  name: string;
  description: string;
  sli: string;
  target: number;
  window: '7d' | '30d';
  errorBudget: number;
  burnRate: number;
  status: 'OK' | 'WARN' | 'CRIT';
}

export interface SLOStatus {
  overall: 'OK' | 'WARN' | 'CRIT';
  status: 'OK' | 'WARN' | 'CRIT';
  slos: SLO[];
  summary: {
    total: number;
    ok: number;
    warn: number;
    crit: number;
  };
  availability: {
    target: number;
    actual: number;
    status: 'OK' | 'WARN' | 'CRIT';
  };
  latency: {
    target: number;
    actual: number;
    status: 'OK' | 'WARN' | 'CRIT';
  };
  errorRate: {
    target: number;
    actual: number;
    status: 'OK' | 'WARN' | 'CRIT';
  };
  queueAge: {
    target: number;
    actual: number;
    status: 'OK' | 'WARN' | 'CRIT';
  };
}

export interface SLOBurnRate {
  slo: string;
  burnRate: number;
  status: 'OK' | 'WARN' | 'CRIT';
  timeToBreach?: number;
}

class SLOMonitor {
  private mockData: SLOStatus = {
    overall: 'OK',
    availability: {
      target: 99.9,
      actual: 99.95,
      status: 'OK'
    },
    latency: {
      target: 200, // ms
      actual: 150,
      status: 'OK'
    },
    errorRate: {
      target: 0.1, // %
      actual: 0.05,
      status: 'OK'
    },
    queueAge: {
      target: 300, // seconds
      actual: 120,
      status: 'OK'
    }
  };

  async getOverallSLOStatus(window: '7d' | '30d'): Promise<SLOStatus> {
    logger.info(`Getting SLO status for window: ${window}`);
    
    // In a real implementation, this would fetch actual metrics
    // For now, return mock data with some variation
    const variation = window === '7d' ? 0.02 : 0.05;
    
    const availability = {
      ...this.mockData.availability,
      actual: this.mockData.availability.actual + (Math.random() - 0.5) * variation
    };
    
    const latency = {
      ...this.mockData.latency,
      actual: this.mockData.latency.actual + (Math.random() - 0.5) * 50
    };
    
    const errorRate = {
      ...this.mockData.errorRate,
      actual: this.mockData.errorRate.actual + (Math.random() - 0.5) * 0.02
    };
    
    const queueAge = {
      ...this.mockData.queueAge,
      actual: this.mockData.queueAge.actual + (Math.random() - 0.5) * 60
    };
    
    // Build SLO array
    const slos: SLO[] = [
      {
        name: 'API Availability',
        description: 'Percentage of successful API requests',
        sli: 'availability',
        target: availability.target,
        window,
        errorBudget: availability.target - availability.actual,
        burnRate: 0.02,
        status: availability.status
      },
      {
        name: 'API Latency (P95)',
        description: '95th percentile response time',
        sli: 'latency',
        target: latency.target,
        window,
        errorBudget: latency.actual - latency.target,
        burnRate: 0.01,
        status: latency.status
      },
      {
        name: 'Error Rate',
        description: 'Percentage of failed requests',
        sli: 'error_rate',
        target: errorRate.target,
        window,
        errorBudget: errorRate.actual,
        burnRate: 0.03,
        status: errorRate.status
      },
      {
        name: 'Queue Processing Time',
        description: 'Average time jobs spend in queue',
        sli: 'queue_age',
        target: queueAge.target,
        window,
        errorBudget: queueAge.actual - queueAge.target,
        burnRate: 0.015,
        status: queueAge.status
      }
    ];
    
    // Calculate summary
    const summary = {
      total: slos.length,
      ok: slos.filter(s => s.status === 'OK').length,
      warn: slos.filter(s => s.status === 'WARN').length,
      crit: slos.filter(s => s.status === 'CRIT').length
    };
    
    // Determine overall status
    const overallStatus = summary.crit > 0 ? 'CRIT' : summary.warn > 0 ? 'WARN' : 'OK';
    
    return {
      overall: overallStatus,
      status: overallStatus,
      slos,
      summary,
      availability,
      latency,
      errorRate,
      queueAge
    };
  }

  async getSLOBurnRate(slo: string, window: '7d' | '30d'): Promise<Array<{ timestamp: Date; burnRate: number; errorBudget: number }>> {
    logger.info(`Getting burn rate for ${slo} in window: ${window}`);
    
    // Generate time-series burn rate data
    const days = window === '7d' ? 7 : 30;
    const data: Array<{ timestamp: Date; burnRate: number; errorBudget: number }> = [];
    
    // Base burn rates for each SLO type
    const baseBurnRates: Record<string, number> = {
      availability: 0.02,
      latency: 0.015,
      error_rate: 0.03,
      queue_age: 0.01
    };
    
    const baseBurnRate = baseBurnRates[slo] || 0.02;
    
    // Base error budgets for each SLO type
    const baseErrorBudgets: Record<string, number> = {
      availability: 0.05,  // 0.05% of time can be down
      latency: 50,         // 50ms above target
      error_rate: 0.05,    // 0.05% error rate
      queue_age: 30        // 30 seconds above target
    };
    
    const baseErrorBudget = baseErrorBudgets[slo] || 1.0;
    
    // Generate daily data points
    for (let i = 0; i < days; i++) {
      const daysAgo = days - i - 1;
      const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      
      // Add some variation to make it realistic
      const variation = (Math.random() - 0.5) * 0.01;
      const burnRate = Math.max(0, baseBurnRate + variation);
      
      // Error budget decreases as we approach current day (more consumption)
      const budgetUsage = (i / days) * 0.3; // Use up to 30% of budget
      const errorBudget = baseErrorBudget * (1 - budgetUsage);
      
      data.push({
        timestamp,
        burnRate,
        errorBudget: Math.max(0, errorBudget)
      });
    }
    
    return data;
  }

  async getSLOHistory(slo: string, window: '7d' | '30d'): Promise<Array<{ timestamp: string; value: number }>> {
    logger.info(`Getting history for ${slo} in window: ${window}`);
    
    // Generate mock historical data
    const points = window === '7d' ? 168 : 720; // hourly for 7d, every 4 hours for 30d
    const history = [];
    
    for (let i = 0; i < points; i++) {
      const timestamp = new Date(Date.now() - (points - i) * (window === '7d' ? 3600000 : 14400000));
      const baseValue = slo === 'availability' ? 99.9 : slo === 'latency' ? 200 : slo === 'error_rate' ? 0.1 : 300;
      const variation = (Math.random() - 0.5) * 0.1;
      
      history.push({
        timestamp: timestamp.toISOString(),
        value: baseValue + variation
      });
    }
    
    return history;
  }
}

export const sloMonitor = new SLOMonitor();