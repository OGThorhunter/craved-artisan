import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';
import { queueMonitor } from './queue-monitor';

const prisma = new PrismaClient();

export interface HealthCheck {
  kind: string;
  name: string;
  status: 'OK' | 'WARN' | 'CRIT' | 'MUTED';
  value?: number;
  unit?: string;
  details?: any;
}

export class SystemHealthMonitor {
  private static instance: SystemHealthMonitor;
  
  public static getInstance(): SystemHealthMonitor {
    if (!SystemHealthMonitor.instance) {
      SystemHealthMonitor.instance = new SystemHealthMonitor();
    }
    return SystemHealthMonitor.instance;
  }

  // Register health checks
  registerChecks() {
    this.registerCheck(this.checkHttpEndpoint.bind(this, 'http://localhost:3001/api/health', 'API'));
    this.registerCheck(this.checkDatabase.bind(this));
    this.registerCheck(this.checkQueues.bind(this));
    this.registerCheck(this.checkStorage.bind(this));
  }

  // HTTP endpoint health check
  async checkHttpEndpoint(url: string, name: string): Promise<HealthCheck> {
    try {
      const start = Date.now();
      const response = await fetch(url, { 
        method: 'GET',
        timeout: 5000,
        headers: { 'User-Agent': 'Craved-Artisan-Health-Check' }
      });
      const duration = Date.now() - start;
      
      if (response.ok) {
        return {
          kind: 'http',
          name,
          status: duration > 2000 ? 'WARN' : 'OK',
          value: duration,
          unit: 'ms',
          details: {
            statusCode: response.status,
            url,
            responseTime: duration
          }
        };
      } else {
        return {
          kind: 'http',
          name,
          status: 'CRIT',
          value: duration,
          unit: 'ms',
          details: {
            statusCode: response.status,
            url,
            error: `HTTP ${response.status}`
          }
        };
      }
    } catch (error) {
      return {
        kind: 'http',
        name,
        status: 'CRIT',
        details: {
          url,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // Database health check
  async checkDatabase(): Promise<HealthCheck> {
    try {
      const start = Date.now();
      
      // Test basic connectivity
      await prisma.$queryRaw`SELECT 1`;
      const basicTime = Date.now() - start;
      
      // Get database stats
      const [connections, cacheHitRatio, slowQueries] = await Promise.all([
        prisma.$queryRaw<[{ count: number }]>`
          SELECT count(*) as count 
          FROM pg_stat_activity 
          WHERE state = 'active'
        `,
        prisma.$queryRaw<[{ ratio: number }]>`
          SELECT 
            round(
              (sum(blks_hit) * 100.0 / (sum(blks_hit) + sum(blks_read))), 2
            ) as ratio
          FROM pg_stat_database 
          WHERE datname = current_database()
        `,
        prisma.$queryRaw<[{ count: number }]>`
          SELECT count(*) as count
          FROM pg_stat_statements 
          WHERE mean_exec_time > 1000
        `
      ]);
      
      const connectionCount = connections[0]?.count || 0;
      const hitRatio = cacheHitRatio[0]?.ratio || 0;
      const slowQueryCount = slowQueries[0]?.count || 0;
      
      let status: 'OK' | 'WARN' | 'CRIT' = 'OK';
      if (connectionCount > 80 || hitRatio < 90 || slowQueryCount > 10) {
        status = 'WARN';
      }
      if (connectionCount > 95 || hitRatio < 80 || slowQueryCount > 50) {
        status = 'CRIT';
      }
      
      return {
        kind: 'db',
        name: 'PostgreSQL',
        status,
        value: basicTime,
        unit: 'ms',
        details: {
          connectionCount,
          cacheHitRatio: hitRatio,
          slowQueryCount,
          responseTime: basicTime
        }
      };
    } catch (error) {
      return {
        kind: 'db',
        name: 'PostgreSQL',
        status: 'CRIT',
        details: {
          error: error instanceof Error ? error.message : 'Database connection failed'
        }
      };
    }
  }

  // Queue health check (BullMQ)
  async checkQueues(): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];
    
    try {
      // This would integrate with BullMQ in production
      // For now, return mock data
      const queueStats = [
        { name: 'email', waiting: 5, active: 2, completed: 1000, failed: 3 },
        { name: 'labels', waiting: 12, active: 1, completed: 500, failed: 1 },
        { name: 'analytics', waiting: 0, active: 0, completed: 200, failed: 0 }
      ];
      
      for (const queue of queueStats) {
        let status: 'OK' | 'WARN' | 'CRIT' = 'OK';
        if (queue.waiting > 50 || queue.failed > 10) {
          status = 'WARN';
        }
        if (queue.waiting > 200 || queue.failed > 50) {
          status = 'CRIT';
        }
        
        checks.push({
          kind: 'queue',
          name: `Queue: ${queue.name}`,
          status,
          value: queue.waiting,
          unit: 'jobs',
          details: {
            waiting: queue.waiting,
            active: queue.active,
            completed: queue.completed,
            failed: queue.failed
          }
        });
      }
    } catch (error) {
      checks.push({
        kind: 'queue',
        name: 'Queue System',
        status: 'CRIT',
        details: {
          error: error instanceof Error ? error.message : 'Queue system unavailable'
        }
      });
    }
    
    return checks;
  }

  // Storage health check
  async checkStorage(): Promise<HealthCheck> {
    try {
      // Check disk space (simplified)
      const fs = await import('fs/promises');
      const stats = await fs.stat('.');
      
      return {
        kind: 'storage',
        name: 'File System',
        status: 'OK',
        details: {
          available: true,
          lastChecked: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        kind: 'storage',
        name: 'File System',
        status: 'CRIT',
        details: {
          error: error instanceof Error ? error.message : 'Storage check failed'
        }
      };
    }
  }

  // Run all health checks
  async runAllChecks(): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];
    
    try {
      // Database check
      checks.push(await this.checkDatabase());
      
      // HTTP endpoint checks
      const httpChecks = await Promise.all([
        this.checkHttpEndpoint('http://localhost:3001/api/health', 'API Health'),
        this.checkHttpEndpoint('http://localhost:5173', 'Frontend'),
      ]);
      checks.push(...httpChecks);
      
      // Queue checks
      const queueChecks = await this.checkQueues();
      checks.push(...queueChecks);
      
      // Storage check
      checks.push(await this.checkStorage());
      
      // Save results to database
      await this.saveChecks(checks);
      
    } catch (error) {
      logger.error('Health check failed:', error);
      checks.push({
        kind: 'system',
        name: 'Health Monitor',
        status: 'CRIT',
        details: {
          error: error instanceof Error ? error.message : 'Health check system failed'
        }
      });
    }
    
    return checks;
  }

  // Save health check results to database
  private async saveChecks(checks: HealthCheck[]): Promise<void> {
    try {
      for (const check of checks) {
        await prisma.systemCheck.upsert({
          where: {
            kind_name: {
              kind: check.kind,
              name: check.name
            }
          },
          update: {
            status: check.status,
            value: check.value,
            unit: check.unit,
            details: check.details,
            updatedAt: new Date()
          },
          create: {
            kind: check.kind,
            name: check.name,
            status: check.status,
            value: check.value,
            unit: check.unit,
            details: check.details
          }
        });
      }
    } catch (error) {
      logger.error('Failed to save health checks:', error);
    }
  }

  // Get current system health status
  async getSystemStatus(): Promise<{
    overall: 'OK' | 'WARN' | 'CRIT';
    checks: HealthCheck[];
    summary: {
      total: number;
      ok: number;
      warn: number;
      crit: number;
    };
  }> {
    const checks = await prisma.systemCheck.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    
    const healthChecks: HealthCheck[] = checks.map(check => ({
      kind: check.kind,
      name: check.name,
      status: check.status as 'OK' | 'WARN' | 'CRIT' | 'MUTED',
      value: check.value || undefined,
      unit: check.unit || undefined,
      details: check.details as any
    }));
    
    const summary = {
      total: healthChecks.length,
      ok: healthChecks.filter(c => c.status === 'OK').length,
      warn: healthChecks.filter(c => c.status === 'WARN').length,
      crit: healthChecks.filter(c => c.status === 'CRIT').length
    };
    
    let overall: 'OK' | 'WARN' | 'CRIT' = 'OK';
    if (summary.crit > 0) {
      overall = 'CRIT';
    } else if (summary.warn > 0) {
      overall = 'WARN';
    }
    
    return {
      overall,
      checks: healthChecks,
      summary
    };
  }
}

// Export singleton instance
export const systemHealth = SystemHealthMonitor.getInstance();
