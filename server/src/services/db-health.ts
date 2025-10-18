import { prisma } from '../db';
import { logger } from '../logger';

export interface DatabaseStats {
  connectionCount: number;
  activeConnections: number;
  idleConnections: number;
  cacheHitRatio: number;
  indexHitRatio: number;
  deadlocks: number;
  slowQueries: number;
  tableStats: TableStats[];
  indexStats: IndexStats[];
  slowestQueries: SlowQuery[];
}

export interface TableStats {
  tableName: string;
  rowCount: number;
  size: number; // in bytes
  indexSize: number; // in bytes
  lastVacuum?: Date;
  lastAnalyze?: Date;
  bloatEstimate: number; // percentage
}

export interface IndexStats {
  tableName: string;
  indexName: string;
  size: number; // in bytes
  usageCount: number;
  lastUsed?: Date;
  isUnused: boolean;
}

export interface SlowQuery {
  query: string;
  avgTime: number; // milliseconds
  calls: number;
  totalTime: number; // milliseconds
  meanTime: number; // milliseconds
}

export interface VectorStats {
  totalVectors: number;
  staleVectors: number;
  indexType: string;
  indexSize: number; // in bytes
  lastAnalyze?: Date;
  recallTest: number; // percentage
  embeddingBacklog: number;
}

export class DatabaseHealthMonitor {
  private static instance: DatabaseHealthMonitor;
  
  public static getInstance(): DatabaseHealthMonitor {
    if (!DatabaseHealthMonitor.instance) {
      DatabaseHealthMonitor.instance = new DatabaseHealthMonitor();
    }
    return DatabaseHealthMonitor.instance;
  }

  // Get comprehensive database statistics
  async getDatabaseStats(): Promise<DatabaseStats> {
    try {
      // Get connection stats
      const connectionStats = await prisma.$queryRaw<Array<{
        total_connections: number;
        active_connections: number;
        idle_connections: number;
      }>>`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `;

      // Get cache hit ratio
      const cacheStats = await prisma.$queryRaw<Array<{
        cache_hit_ratio: number;
        index_hit_ratio: number;
      }>>`
        SELECT 
          round(
            (sum(blks_hit) * 100.0 / (sum(blks_hit) + sum(blks_read))), 2
          ) as cache_hit_ratio,
          round(
            (sum(idx_blks_hit) * 100.0 / (sum(idx_blks_hit) + sum(idx_blks_read))), 2
          ) as index_hit_ratio
        FROM pg_stat_database 
        WHERE datname = current_database()
      `;

      // Get deadlock count (last 24 hours)
      const deadlockStats = await prisma.$queryRaw<Array<{
        deadlocks: number;
      }>>`
        SELECT 
          COALESCE(deadlocks, 0) as deadlocks
        FROM pg_stat_database 
        WHERE datname = current_database()
      `;

      // Get slow queries count
      const slowQueryStats = await prisma.$queryRaw<Array<{
        slow_queries: number;
      }>>`
        SELECT count(*) as slow_queries
        FROM pg_stat_statements 
        WHERE mean_exec_time > 1000
      `;

      // Get table statistics
      const tableStats = await this.getTableStats();
      
      // Get index statistics
      const indexStats = await this.getIndexStats();
      
      // Get slowest queries
      const slowestQueries = await this.getSlowestQueries();

      const connection = connectionStats[0] || { total_connections: 0, active_connections: 0, idle_connections: 0 };
      const cache = cacheStats[0] || { cache_hit_ratio: 0, index_hit_ratio: 0 };
      const deadlocks = deadlockStats[0] || { deadlocks: 0 };
      const slowQueries = slowQueryStats[0] || { slow_queries: 0 };

      return {
        connectionCount: connection.total_connections,
        activeConnections: connection.active_connections,
        idleConnections: connection.idle_connections,
        cacheHitRatio: cache.cache_hit_ratio,
        indexHitRatio: cache.index_hit_ratio,
        deadlocks: deadlocks.deadlocks,
        slowQueries: slowQueries.slow_queries,
        tableStats,
        indexStats,
        slowestQueries
      };
    } catch (error) {
      logger.error('Failed to get database stats:', error);
      return {
        connectionCount: 0,
        activeConnections: 0,
        idleConnections: 0,
        cacheHitRatio: 0,
        indexHitRatio: 0,
        deadlocks: 0,
        slowQueries: 0,
        tableStats: [],
        indexStats: [],
        slowestQueries: []
      };
    }
  }

  // Get table statistics
  private async getTableStats(): Promise<TableStats[]> {
    try {
      const stats = await prisma.$queryRaw<Array<{
        table_name: string;
        row_count: number;
        size_bytes: number;
        index_size_bytes: number;
        last_vacuum: Date | null;
        last_analyze: Date | null;
        bloat_estimate: number;
      }>>`
        SELECT 
          schemaname||'.'||tablename as table_name,
          n_tup_ins + n_tup_upd + n_tup_del as row_count,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes,
          pg_indexes_size(schemaname||'.'||tablename) as index_size_bytes,
          last_vacuum,
          last_analyze,
          COALESCE(
            (pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) * 100.0 / 
            NULLIF(pg_total_relation_size(schemaname||'.'||tablename), 0), 0
          ) as bloat_estimate
        FROM pg_stat_user_tables 
        ORDER BY size_bytes DESC
        LIMIT 20
      `;

      return stats.map(stat => ({
        tableName: stat.table_name,
        rowCount: Number(stat.row_count),
        size: Number(stat.size_bytes),
        indexSize: Number(stat.index_size_bytes),
        lastVacuum: stat.last_vacuum,
        lastAnalyze: stat.last_analyze,
        bloatEstimate: Number(stat.bloat_estimate)
      }));
    } catch (error) {
      logger.error('Failed to get table stats:', error);
      return [];
    }
  }

  // Get index statistics
  private async getIndexStats(): Promise<IndexStats[]> {
    try {
      const stats = await prisma.$queryRaw<Array<{
        table_name: string;
        index_name: string;
        size_bytes: number;
        usage_count: number;
        last_used: Date | null;
        is_unused: boolean;
      }>>`
        SELECT 
          schemaname||'.'||relname as table_name,
          indexrelname as index_name,
          pg_relation_size(schemaname||'.'||indexrelname) as size_bytes,
          idx_tup_read + idx_tup_fetch as usage_count,
          CASE 
            WHEN idx_tup_read + idx_tup_fetch = 0 THEN true
            ELSE false
          END as is_unused,
          NULL as last_used
        FROM pg_stat_user_indexes
        ORDER BY size_bytes DESC
        LIMIT 20
      `;

      return stats.map(stat => ({
        tableName: stat.table_name,
        indexName: stat.index_name,
        size: Number(stat.size_bytes),
        usageCount: Number(stat.usage_count),
        lastUsed: stat.last_used,
        isUnused: stat.is_unused
      }));
    } catch (error) {
      logger.error('Failed to get index stats:', error);
      return [];
    }
  }

  // Get slowest queries
  private async getSlowestQueries(): Promise<SlowQuery[]> {
    try {
      const stats = await prisma.$queryRaw<Array<{
        query: string;
        avg_time: number;
        calls: number;
        total_time: number;
        mean_time: number;
      }>>`
        SELECT 
          query,
          mean_exec_time as avg_time,
          calls,
          total_exec_time as total_time,
          mean_exec_time as mean_time
        FROM pg_stat_statements 
        WHERE mean_exec_time > 100
        ORDER BY mean_exec_time DESC
        LIMIT 10
      `;

      return stats.map(stat => ({
        query: stat.query,
        avgTime: Number(stat.avg_time),
        calls: Number(stat.calls),
        totalTime: Number(stat.total_time),
        meanTime: Number(stat.mean_time)
      }));
    } catch (error) {
      logger.error('Failed to get slowest queries:', error);
      return [];
    }
  }

  // Get vector statistics
  async getVectorStats(): Promise<VectorStats> {
    try {
      // Check if pgvector extension is available
      const extensionCheck = await prisma.$queryRaw<Array<{
        exists: boolean;
      }>>`
        SELECT EXISTS(
          SELECT 1 FROM pg_extension WHERE extname = 'vector'
        ) as exists
      `;

      if (!extensionCheck[0]?.exists) {
        return {
          totalVectors: 0,
          staleVectors: 0,
          indexType: 'Not Available',
          indexSize: 0,
          recallTest: 0,
          embeddingBacklog: 0
        };
      }

      // Get vector table stats
      const vectorStats = await prisma.$queryRaw<Array<{
        total_vectors: number;
        stale_vectors: number;
        index_size: number;
        last_analyze: Date | null;
      }>>`
        SELECT 
          COALESCE(
            (SELECT count(*) FROM information_schema.columns 
             WHERE table_schema = 'public' AND data_type = 'USER-DEFINED' 
             AND udt_name = 'vector'), 0
          ) as total_vectors,
          0 as stale_vectors,
          0 as index_size,
          NULL as last_analyze
      `;

      const stats = vectorStats[0] || { total_vectors: 0, stale_vectors: 0, index_size: 0, last_analyze: null };

      return {
        totalVectors: Number(stats.total_vectors),
        staleVectors: Number(stats.stale_vectors),
        indexType: 'HNSW', // Default assumption
        indexSize: Number(stats.index_size),
        lastAnalyze: stats.last_analyze,
        recallTest: 95.5, // Mock value
        embeddingBacklog: 0
      };
    } catch (error) {
      logger.error('Failed to get vector stats:', error);
      return {
        totalVectors: 0,
        staleVectors: 0,
        indexType: 'Not Available',
        indexSize: 0,
        recallTest: 0,
        embeddingBacklog: 0
      };
    }
  }

  // Get database health status
  async getDatabaseHealth(): Promise<{
    status: 'OK' | 'WARN' | 'CRIT';
    connectionHealth: 'OK' | 'WARN' | 'CRIT';
    cacheHealth: 'OK' | 'WARN' | 'CRIT';
    queryHealth: 'OK' | 'WARN' | 'CRIT';
    summary: {
      connections: number;
      cacheHitRatio: number;
      slowQueries: number;
      deadlocks: number;
    };
  }> {
    try {
      const stats = await this.getDatabaseStats();
      
      // Determine health status for each component
      let connectionHealth: 'OK' | 'WARN' | 'CRIT' = 'OK';
      if (stats.activeConnections > 80) {
        connectionHealth = 'CRIT';
      } else if (stats.activeConnections > 60) {
        connectionHealth = 'WARN';
      }
      
      let cacheHealth: 'OK' | 'WARN' | 'CRIT' = 'OK';
      if (stats.cacheHitRatio < 80) {
        cacheHealth = 'CRIT';
      } else if (stats.cacheHitRatio < 90) {
        cacheHealth = 'WARN';
      }
      
      let queryHealth: 'OK' | 'WARN' | 'CRIT' = 'OK';
      if (stats.slowQueries > 50) {
        queryHealth = 'CRIT';
      } else if (stats.slowQueries > 20) {
        queryHealth = 'WARN';
      }
      
      // Overall health
      let status: 'OK' | 'WARN' | 'CRIT' = 'OK';
      if (connectionHealth === 'CRIT' || cacheHealth === 'CRIT' || queryHealth === 'CRIT') {
        status = 'CRIT';
      } else if (connectionHealth === 'WARN' || cacheHealth === 'WARN' || queryHealth === 'WARN') {
        status = 'WARN';
      }
      
      return {
        status,
        connectionHealth,
        cacheHealth,
        queryHealth,
        summary: {
          connections: stats.connectionCount,
          cacheHitRatio: stats.cacheHitRatio,
          slowQueries: stats.slowQueries,
          deadlocks: stats.deadlocks
        }
      };
    } catch (error) {
      logger.error('Failed to get database health:', error);
      return {
        status: 'CRIT',
        connectionHealth: 'CRIT',
        cacheHealth: 'CRIT',
        queryHealth: 'CRIT',
        summary: {
          connections: 0,
          cacheHitRatio: 0,
          slowQueries: 0,
          deadlocks: 0
        }
      };
    }
  }

  // Trigger database maintenance
  async triggerMaintenance(action: 'vacuum' | 'analyze' | 'reindex', tableName?: string): Promise<boolean> {
    try {
      let query: string;
      
      switch (action) {
        case 'vacuum':
          query = tableName ? `VACUUM ${tableName}` : 'VACUUM';
          break;
        case 'analyze':
          query = tableName ? `ANALYZE ${tableName}` : 'ANALYZE';
          break;
        case 'reindex':
          if (!tableName) {
            throw new Error('Table name required for reindex');
          }
          query = `REINDEX TABLE ${tableName}`;
          break;
        default:
          throw new Error('Invalid maintenance action');
      }
      
      await prisma.$executeRawUnsafe(query);
      logger.info(`Database maintenance completed: ${action}${tableName ? ` on ${tableName}` : ''}`);
      return true;
    } catch (error) {
      logger.error(`Failed to trigger database maintenance ${action}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const dbHealthMonitor = DatabaseHealthMonitor.getInstance();


























