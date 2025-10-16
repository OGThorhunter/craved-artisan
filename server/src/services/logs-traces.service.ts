import { logger } from '../logger';
import * as fs from 'fs';
import * as path from 'path';

export interface ErrorGroup {
  route: string;
  exception: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  sampleMessage: string;
}

export interface SlowEndpoint {
  route: string;
  method: string;
  p50: number;
  p95: number;
  p99: number;
  requestCount: number;
  avgDuration: number;
}

export interface LogEntry {
  timestamp: Date;
  level: string;
  message: string;
  service: string;
  meta?: any;
}

class LogsTracesService {
  /**
   * Get grouped errors from logs
   */
  async getGroupedErrors(timeframe: string = '24h'): Promise<ErrorGroup[]> {
    try {
      // TODO: Implement actual log parsing from Winston logs
      // For now, return mock data

      const errors: ErrorGroup[] = [
        {
          route: '/api/admin/ops/queues',
          exception: 'TypeError: Cannot read property "length" of undefined',
          count: 15,
          firstSeen: new Date(Date.now() - 12 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 1 * 60 * 60 * 1000),
          sampleMessage: 'Failed to fetch queue stats'
        },
        {
          route: '/api/vendor/:id/products',
          exception: 'DatabaseError: Connection timeout',
          count: 8,
          firstSeen: new Date(Date.now() - 6 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 30 * 60 * 1000),
          sampleMessage: 'Database connection failed after 30s'
        },
        {
          route: '/api/customer/orders',
          exception: 'ValidationError: Invalid order ID format',
          count: 23,
          firstSeen: new Date(Date.now() - 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 5 * 60 * 1000),
          sampleMessage: 'Order ID must be a valid CUID'
        }
      ];

      return errors;
    } catch (error) {
      logger.error({ error }, 'Failed to get grouped errors:', error);
      throw error;
    }
  }

  /**
   * Get slow endpoint performance data
   */
  async getSlowEndpoints(limit: number = 20): Promise<SlowEndpoint[]> {
    try {
      // TODO: Implement actual performance monitoring data collection
      // For now, return mock data

      const endpoints: SlowEndpoint[] = [
        {
          route: '/api/admin/overview',
          method: 'GET',
          p50: 245,
          p95: 1200,
          p99: 2500,
          requestCount: 1523,
          avgDuration: 380
        },
        {
          route: '/api/vendor/:id/products',
          method: 'GET',
          p50: 180,
          p95: 850,
          p99: 1800,
          requestCount: 4521,
          avgDuration: 290
        },
        {
          route: '/api/admin/ops/db/health',
          method: 'GET',
          p50: 520,
          p95: 1500,
          p99: 3200,
          requestCount: 342,
          avgDuration: 680
        },
        {
          route: '/api/customer/orders',
          method: 'GET',
          p50: 95,
          p95: 320,
          p99: 650,
          requestCount: 8234,
          avgDuration: 145
        }
      ];

      return endpoints
        .sort((a, b) => b.p95 - a.p95)
        .slice(0, limit);
    } catch (error) {
      logger.error({ error }, 'Failed to get slow endpoints:', error);
      throw error;
    }
  }

  /**
   * Get trace sampler links (if tracing enabled)
   */
  async getTraceSamples(limit: number = 10): Promise<any[]> {
    try {
      // TODO: Integrate with actual tracing system (Jaeger, Datadog, etc.)
      // For now, return empty array

      return [];
    } catch (error) {
      logger.error({ error }, 'Failed to get trace samples:', error);
      throw error;
    }
  }

  /**
   * Search logs by criteria
   */
  async searchLogs(criteria: {
    timeframe?: string;
    service?: string;
    severity?: string;
    search?: string;
    limit?: number;
  }): Promise<LogEntry[]> {
    try {
      const {
        timeframe = '24h',
        service,
        severity,
        search,
        limit = 100
      } = criteria;

      // TODO: Implement actual log search
      // For now, return mock data

      const logs: LogEntry[] = [
        {
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          level: 'error',
          message: 'Failed to fetch queue stats',
          service: 'api',
          meta: { queue: 'email', error: 'Connection timeout' }
        },
        {
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          level: 'warn',
          message: 'Database connection slow',
          service: 'api',
          meta: { duration: 2500 }
        },
        {
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          level: 'info',
          message: 'Health check completed',
          service: 'api',
          meta: { status: 'OK' }
        }
      ];

      // Filter by criteria
      let filtered = logs;

      if (service) {
        filtered = filtered.filter(l => l.service === service);
      }

      if (severity) {
        filtered = filtered.filter(l => l.level === severity);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(l => 
          l.message.toLowerCase().includes(searchLower)
        );
      }

      return filtered.slice(0, limit);
    } catch (error) {
      logger.error({ error }, 'Failed to search logs:', error);
      throw error;
    }
  }

  /**
   * Get log file paths
   */
  getLogFilePaths(): { error: string; combined: string; access: string } {
    const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

    return {
      error: path.join(logDir, 'error.log'),
      combined: path.join(logDir, 'combined.log'),
      access: path.join(logDir, 'access.log')
    };
  }

  /**
   * Get log file size
   */
  async getLogFileSize(filePath: string): Promise<number> {
    try {
      if (!fs.existsSync(filePath)) {
        return 0;
      }

      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      logger.error(`Failed to get log file size for ${filePath}:`, error);
      return 0;
    }
  }

  /**
   * Tail recent log entries from file
   */
  async tailLogs(filePath: string, lines: number = 100): Promise<string[]> {
    try {
      if (!fs.existsSync(filePath)) {
        return [];
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const allLines = content.split('\n').filter(l => l.trim());
      
      return allLines.slice(-lines);
    } catch (error) {
      logger.error(`Failed to tail logs from ${filePath}:`, error);
      return [];
    }
  }
}

export const logsTracesService = new LogsTracesService();

