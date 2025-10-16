import { logger } from '../utils/logger';

export interface SLOStatus {
  overall: 'OK' | 'WARN' | 'CRIT';
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
    
    return {
      ...this.mockData,
      availability: {
        ...this.mockData.availability,
        actual: this.mockData.availability.actual + (Math.random() - 0.5) * variation
      },
      latency: {
        ...this.mockData.latency,
        actual: this.mockData.latency.actual + (Math.random() - 0.5) * 50
      },
      errorRate: {
        ...this.mockData.errorRate,
        actual: this.mockData.errorRate.actual + (Math.random() - 0.5) * 0.02
      },
      queueAge: {
        ...this.mockData.queueAge,
        actual: this.mockData.queueAge.actual + (Math.random() - 0.5) * 60
      }
    };
  }

  async getSLOBurnRate(slo: string, window: '7d' | '30d'): Promise<SLOBurnRate> {
    logger.info(`Getting burn rate for ${slo} in window: ${window}`);
    
    // Mock burn rates
    const burnRates: Record<string, SLOBurnRate> = {
      availability: {
        slo: 'availability',
        burnRate: 0.8,
        status: 'OK',
        timeToBreach: window === '7d' ? 45 : 180 // days
      },
      latency: {
        slo: 'latency',
        burnRate: 0.6,
        status: 'OK',
        timeToBreach: window === '7d' ? 67 : 268
      },
      error_rate: {
        slo: 'error_rate',
        burnRate: 0.4,
        status: 'OK',
        timeToBreach: window === '7d' ? 100 : 400
      },
      queue_age: {
        slo: 'queue_age',
        burnRate: 0.3,
        status: 'OK',
        timeToBreach: window === '7d' ? 133 : 533
      }
    };

    return burnRates[slo] || {
      slo,
      burnRate: 0.5,
      status: 'OK',
      timeToBreach: 90
    };
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