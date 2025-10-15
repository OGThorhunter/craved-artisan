import { logger } from '../logger';
import { getRedisClient, isRedisConnected } from '../config/redis';
import type Redis from 'ioredis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  compress?: boolean; // Whether to compress large values
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  memoryUsage: number;
  evictions: number;
}

export class CacheService {
  private static instance: CacheService;
  private client: Redis;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  constructor() {
    this.client = getRedisClient();
    logger.info('✅ CacheService initialized with Redis client');
  }

  // Get cached value
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (value === null) {
        this.stats.misses++;
        logger.debug({ key }, '📊 Cache miss');
        return null;
      }
      
      this.stats.hits++;
      logger.debug({ key }, '✅ Cache hit');
      return JSON.parse(value);
    } catch (error) {
      logger.error({ error, key }, '❌ Cache get error');
      this.stats.misses++;
      return null;
    }
  }

  // Set cached value
  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    try {
      const { ttl = 3600, tags = [] } = options;
      
      const stringValue = JSON.stringify(value);
      
      // Store the main value with TTL
      if (ttl > 0) {
        await this.client.setex(key, ttl, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
      
      // Store tag associations for invalidation
      if (tags.length > 0) {
        for (const tag of tags) {
          const tagKey = `tag:${tag}`;
          await this.client.sadd(tagKey, key);
          // Set expiry on tag key as well
          if (ttl > 0) {
            await this.client.expire(tagKey, ttl);
          }
        }
      }
      
      logger.debug({ key, ttl, tags }, '💾 Cache set');
      return true;
    } catch (error) {
      logger.error({ error, key }, '❌ Cache set error');
      return false;
    }
  }

  // Delete cached value
  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      logger.debug({ key, deleted: result > 0 }, '🗑️  Cache delete');
      return result > 0;
    } catch (error) {
      logger.error({ error, key }, '❌ Cache delete error');
      return false;
    }
  }

  // Invalidate cache by tags
  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      let deletedCount = 0;
      
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        
        // Get all keys associated with this tag
        const keys = await this.client.smembers(tagKey);
        
        if (keys.length > 0) {
          // Delete all keys
          const result = await this.client.del(...keys);
          deletedCount += result;
          
          logger.info({ tag, keysDeleted: result }, '🔄 Cache invalidated by tag');
        }
        
        // Delete the tag key itself
        await this.client.del(tagKey);
      }
      
      return deletedCount;
    } catch (error) {
      logger.error({ error, tags }, '❌ Cache invalidation error');
      return 0;
    }
  }

  // Invalidate cache by pattern
  async invalidateByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }
      
      const result = await this.client.del(...keys);
      logger.info({ pattern, keysDeleted: result }, '🔄 Cache invalidated by pattern');
      
      return result;
    } catch (error) {
      logger.error({ error, pattern }, '❌ Cache invalidation by pattern error');
      return 0;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      logger.error({ error, key }, '❌ Cache exists error');
      return false;
    }
  }

  // Get TTL for key
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error({ error, key }, '❌ Cache TTL error');
      return -1;
    }
  }

  // Clear all cache (use with caution!)
  async clear(): Promise<boolean> {
    try {
      await this.client.flushall();
      this.stats.evictions++;
      logger.warn('⚠️  All cache cleared');
      return true;
    } catch (error) {
      logger.error({ error }, '❌ Cache clear error');
      return false;
    }
  }

  // Get cache statistics
  async getStats(): Promise<CacheStats> {
    try {
      const dbSize = await this.client.dbsize();
      const info = await this.client.info('memory');
      
      // Parse memory usage from info string
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const memoryUsage = memoryMatch ? parseInt(memoryMatch[1], 10) : 0;
      
      const hitRate = this.stats.hits + this.stats.misses > 0 
        ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
        : 0;
      
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: Math.round(hitRate * 100) / 100,
        totalKeys: dbSize,
        memoryUsage,
        evictions: this.stats.evictions
      };
    } catch (error) {
      logger.error({ error }, '❌ Cache stats error');
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: 0,
        totalKeys: 0,
        memoryUsage: 0,
        evictions: this.stats.evictions
      };
    }
  }

  // Cache middleware for Express routes
  cacheMiddleware(ttl: number = 300, tags: string[] = []) {
    return async (req: any, res: any, next: any) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }
      
      const key = `route:${req.method}:${req.originalUrl}`;
      
      try {
        const cached = await this.get(key);
        if (cached) {
          logger.debug({ key }, '⚡ Serving from cache');
          return res.json(cached);
        }
        
        // Store original res.json
        const originalJson = res.json.bind(res);
        
        // Override res.json to cache the response
        res.json = (data: any) => {
          this.set(key, data, { ttl, tags }).catch(error => {
            logger.error({ error }, '❌ Cache middleware set error');
          });
          return originalJson(data);
        };
        
        next();
      } catch (error) {
        logger.error({ error }, '❌ Cache middleware error');
        next();
      }
    };
  }

  // Generate cache key for admin data
  generateAdminKey(prefix: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join(':');
    
    return `admin:${prefix}${sortedParams ? `:${sortedParams}` : ''}`;
  }

  // Generate cache key for vendor analytics
  generateAnalyticsKey(vendorId: string, endpoint: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join(':');
    
    return `analytics:${vendorId}:${endpoint}${sortedParams ? `:${sortedParams}` : ''}`;
  }

  // Cache admin metrics
  async cacheAdminMetrics(metrics: any, ttl: number = 300): Promise<boolean> {
    const key = this.generateAdminKey('metrics');
    return this.set(key, metrics, { ttl, tags: ['admin', 'metrics'] });
  }

  // Cache admin data with pagination
  async cacheAdminData(
    prefix: string, 
    data: any, 
    params: Record<string, any> = {}, 
    ttl: number = 600
  ): Promise<boolean> {
    const key = this.generateAdminKey(prefix, params);
    return this.set(key, data, { ttl, tags: ['admin', prefix] });
  }

  // Invalidate admin cache
  async invalidateAdminCache(prefix?: string): Promise<number> {
    const tags = ['admin'];
    if (prefix) tags.push(prefix);
    
    return this.invalidateByTags(tags);
  }

  // Cache vendor analytics
  async cacheVendorAnalytics(
    vendorId: string,
    endpoint: string,
    data: any,
    params: Record<string, any> = {},
    ttl: number = 300
  ): Promise<boolean> {
    const key = this.generateAnalyticsKey(vendorId, endpoint, params);
    return this.set(key, data, { ttl, tags: [`vendor:${vendorId}`, 'analytics', endpoint] });
  }

  // Get cached vendor analytics
  async getCachedVendorAnalytics<T>(
    vendorId: string,
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<T | null> {
    const key = this.generateAnalyticsKey(vendorId, endpoint, params);
    return this.get<T>(key);
  }

  // Invalidate vendor cache (when orders/products change)
  async invalidateVendorCache(vendorId: string, scope?: string): Promise<number> {
    const tags = [`vendor:${vendorId}`];
    if (scope) tags.push(scope);
    
    logger.info({ vendorId, scope }, '🔄 Invalidating vendor cache');
    return this.invalidateByTags(tags);
  }

  // Check Redis connection status
  isConnected(): boolean {
    return isRedisConnected();
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();

// Cache decorator for methods
export function Cache(ttl: number = 300, tags: string[] = []) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `method:${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      try {
        const cached = await cacheService.get(cacheKey);
        if (cached) {
          logger.debug({ cacheKey }, '⚡ Method cache hit');
          return cached;
        }
        
        const result = await method.apply(this, args);
        await cacheService.set(cacheKey, result, { ttl, tags });
        
        return result;
      } catch (error) {
        logger.error({ error, propertyName }, '❌ Cache decorator error');
        return method.apply(this, args);
      }
    };
    
    return descriptor;
  };
}
