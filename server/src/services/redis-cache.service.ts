import { getRedisClient } from '../config/redis';
import { logger } from '../logger';

export interface CacheNamespace {
  namespace: string;
  description: string;
  keyPattern: string;
  keyCount: number;
  estimatedMemory: number;
}

export interface MemoryStats {
  usedMemory: number;
  maxMemory: number;
  usedMemoryPercent: number;
  evictedKeys: number;
  hitRate: number;
  missRate: number;
}

export interface HotKey {
  key: string;
  type: string;
  ttl: number;
  estimatedSize: number;
}

class RedisCacheService {
  private redis = getRedisClient();

  /**
   * Get all cache namespaces
   */
  async getNamespaces(): Promise<CacheNamespace[]> {
    try {
      const keys = await this.redis.keys('*');
      
      // Group keys by namespace (prefix before :)
      const namespaceMap = new Map<string, string[]>();
      
      keys.forEach(key => {
        const parts = key.split(':');
        const namespace = parts.length > 1 ? parts[0] : 'default';
        
        if (!namespaceMap.has(namespace)) {
          namespaceMap.set(namespace, []);
        }
        namespaceMap.get(namespace)!.push(key);
      });

      // Build namespace objects
      const namespaces: CacheNamespace[] = [];
      
      for (const [namespace, nsKeys] of namespaceMap.entries()) {
        namespaces.push({
          namespace,
          description: this.getNamespaceDescription(namespace),
          keyPattern: `${namespace}:*`,
          keyCount: nsKeys.length,
          estimatedMemory: nsKeys.length * 1024 // Rough estimate: 1KB per key
        });
      }

      return namespaces.sort((a, b) => b.keyCount - a.keyCount);
    } catch (error) {
      logger.error('Failed to get cache namespaces:', error);
      throw error;
    }
  }

  /**
   * Get keys in a specific namespace
   */
  async getKeysInNamespace(namespace: string, limit: number = 100): Promise<string[]> {
    try {
      const pattern = `${namespace}:*`;
      const keys = await this.redis.keys(pattern);
      
      return keys.slice(0, limit);
    } catch (error) {
      logger.error(`Failed to get keys in namespace ${namespace}:`, error);
      throw error;
    }
  }

  /**
   * Get key value (read-only preview)
   */
  async getKeyValue(key: string): Promise<{ type: string; value: any; ttl: number }> {
    try {
      const type = await this.redis.type(key);
      const ttl = await this.redis.ttl(key);
      let value: any;

      switch (type) {
        case 'string':
          value = await this.redis.get(key);
          break;
        case 'hash':
          value = await this.redis.hgetall(key);
          break;
        case 'list':
          value = await this.redis.lrange(key, 0, 100); // Limit to 100 items
          break;
        case 'set':
          value = await this.redis.smembers(key);
          break;
        case 'zset':
          value = await this.redis.zrange(key, 0, 100); // Limit to 100 items
          break;
        default:
          value = null;
      }

      return { type, value, ttl };
    } catch (error) {
      logger.error(`Failed to get key value for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Flush a namespace (delete all keys matching pattern)
   */
  async flushNamespace(namespace: string, reason: string): Promise<number> {
    try {
      const pattern = `${namespace}:*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length === 0) {
        logger.info({ namespace, reason }, 'No keys to flush in namespace');
        return 0;
      }

      // Delete keys in batches
      const batchSize = 100;
      let deleted = 0;

      for (let i = 0; i < keys.length; i += batchSize) {
        const batch = keys.slice(i, i + batchSize);
        await this.redis.del(...batch);
        deleted += batch.length;
      }

      logger.info({ namespace, deleted, reason }, 'Flushed cache namespace');
      return deleted;
    } catch (error) {
      logger.error(`Failed to flush namespace ${namespace}:`, error);
      throw error;
    }
  }

  /**
   * Get memory statistics
   */
  async getMemoryStats(): Promise<MemoryStats> {
    try {
      const info = await this.redis.info('memory');
      const stats = await this.redis.info('stats');
      
      // Parse info strings
      const memoryLines = info.split('\r\n');
      const statsLines = stats.split('\r\n');
      
      const usedMemory = this.parseInfoValue(memoryLines, 'used_memory');
      const maxMemory = this.parseInfoValue(memoryLines, 'maxmemory') || usedMemory * 2; // Default if not set
      const evictedKeys = this.parseInfoValue(statsLines, 'evicted_keys');
      const keyspaceHits = this.parseInfoValue(statsLines, 'keyspace_hits');
      const keyspaceMisses = this.parseInfoValue(statsLines, 'keyspace_misses');
      
      const totalRequests = keyspaceHits + keyspaceMisses;
      const hitRate = totalRequests > 0 ? (keyspaceHits / totalRequests) * 100 : 0;
      const missRate = totalRequests > 0 ? (keyspaceMisses / totalRequests) * 100 : 0;

      return {
        usedMemory,
        maxMemory,
        usedMemoryPercent: maxMemory > 0 ? (usedMemory / maxMemory) * 100 : 0,
        evictedKeys,
        hitRate,
        missRate
      };
    } catch (error) {
      logger.error('Failed to get memory stats:', error);
      throw error;
    }
  }

  /**
   * Get eviction statistics
   */
  async getEvictionStats(): Promise<{ evictedKeys: number; evictionPolicy: string }> {
    try {
      const info = await this.redis.info('stats');
      const config = await this.redis.config('GET', 'maxmemory-policy');
      
      const statsLines = info.split('\r\n');
      const evictedKeys = this.parseInfoValue(statsLines, 'evicted_keys');
      const evictionPolicy = config[1] || 'noeviction';

      return {
        evictedKeys,
        evictionPolicy
      };
    } catch (error) {
      logger.error('Failed to get eviction stats:', error);
      throw error;
    }
  }

  /**
   * Get hot keys (most accessed)
   * Note: This is a simplified version. Full implementation would use Redis MONITOR
   */
  async getHotKeys(limit: number = 10): Promise<HotKey[]> {
    try {
      const keys = await this.redis.keys('*');
      const hotKeys: HotKey[] = [];

      // Sample a subset of keys
      const sampleSize = Math.min(keys.length, 100);
      const sample = keys.slice(0, sampleSize);

      for (const key of sample) {
        const type = await this.redis.type(key);
        const ttl = await this.redis.ttl(key);
        
        hotKeys.push({
          key,
          type,
          ttl,
          estimatedSize: 1024 // Placeholder - would need MEMORY USAGE command
        });
      }

      return hotKeys.slice(0, limit);
    } catch (error) {
      logger.error('Failed to get hot keys:', error);
      throw error;
    }
  }

  /**
   * Helper: Get namespace description
   */
  private getNamespaceDescription(namespace: string): string {
    const descriptions: Record<string, string> = {
      'kpi': 'Key Performance Indicators cache',
      'vendorDash': 'Vendor dashboard data',
      'session': 'User session data',
      'health': 'Health check results',
      'queue': 'Queue statistics',
      'slo': 'SLO metrics',
      'rate-limit': 'Rate limiting data',
      'default': 'Uncategorized cache keys'
    };

    return descriptions[namespace] || `${namespace} cache data`;
  }

  /**
   * Helper: Parse Redis INFO value
   */
  private parseInfoValue(lines: string[], key: string): number {
    const line = lines.find(l => l.startsWith(key + ':'));
    if (!line) return 0;
    
    const value = line.split(':')[1];
    return parseInt(value, 10) || 0;
  }
}

export const redisCacheService = new RedisCacheService();

