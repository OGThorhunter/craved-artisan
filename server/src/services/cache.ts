import { logger } from '../logger';

// Mock Redis client for development
// In production, this would use actual Redis
class MockRedisClient {
  private data: Map<string, { value: any; expiry?: number }> = new Map();

  async get(key: string): Promise<string | null> {
    const item = this.data.get(key);
    if (!item) return null;
    
    if (item.expiry && Date.now() > item.expiry) {
      this.data.delete(key);
      return null;
    }
    
    return typeof item.value === 'string' ? item.value : JSON.stringify(item.value);
  }

  async set(key: string, value: any, options?: { EX?: number; PX?: number }): Promise<string> {
    const expiry = options?.EX ? Date.now() + (options.EX * 1000) : 
                   options?.PX ? Date.now() + options.PX : undefined;
    
    this.data.set(key, { value, expiry });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.data.delete(key) ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    return this.data.has(key) ? 1 : 0;
  }

  async flushall(): Promise<string> {
    this.data.clear();
    return 'OK';
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.data.keys()).filter(key => regex.test(key));
  }

  async ttl(key: string): Promise<number> {
    const item = this.data.get(key);
    if (!item || !item.expiry) return -1;
    
    const remaining = Math.ceil((item.expiry - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }
}

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
  private client: MockRedisClient;
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
    this.client = new MockRedisClient();
  }

  // Get cached value
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (value === null) {
        this.stats.misses++;
        return null;
      }
      
      this.stats.hits++;
      return JSON.parse(value);
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      this.stats.misses++;
      return null;
    }
  }

  // Set cached value
  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    try {
      const { ttl = 3600, tags = [] } = options;
      
      // Store the main value
      await this.client.set(key, value, { EX: ttl });
      
      // Store tag associations for invalidation
      if (tags.length > 0) {
        for (const tag of tags) {
          const tagKey = `tag:${tag}`;
          const existingKeys = await this.get<string[]>(tagKey) || [];
          if (!existingKeys.includes(key)) {
            existingKeys.push(key);
            await this.client.set(tagKey, existingKeys, { EX: ttl });
          }
        }
      }
      
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  // Delete cached value
  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  // Invalidate cache by tags
  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      let deletedCount = 0;
      
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        const keys = await this.get<string[]>(tagKey) || [];
        
        for (const key of keys) {
          if (await this.del(key)) {
            deletedCount++;
          }
        }
        
        // Delete the tag key itself
        await this.del(tagKey);
      }
      
      return deletedCount;
    } catch (error) {
      logger.error(`Cache invalidation error for tags ${tags.join(', ')}:`, error);
      return 0;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  // Get TTL for key
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  // Clear all cache
  async clear(): Promise<boolean> {
    try {
      await this.client.flushall();
      this.stats.evictions++;
      return true;
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  // Get cache statistics
  async getStats(): Promise<CacheStats> {
    try {
      const totalKeys = (await this.client.keys('*')).length;
      const hitRate = this.stats.hits + this.stats.misses > 0 
        ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
        : 0;
      
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: Math.round(hitRate * 100) / 100,
        totalKeys,
        memoryUsage: 0, // Mock value
        evictions: this.stats.evictions
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalKeys: 0,
        memoryUsage: 0,
        evictions: 0
      };
    }
  }

  // Cache middleware for Express routes
  cacheMiddleware(ttl: number = 300, tags: string[] = []) {
    return async (req: any, res: any, next: any) => {
      const key = `route:${req.method}:${req.originalUrl}`;
      
      try {
        const cached = await this.get(key);
        if (cached) {
          return res.json(cached);
        }
        
        // Store original res.json
        const originalJson = res.json.bind(res);
        
        // Override res.json to cache the response
        res.json = (data: any) => {
          this.set(key, data, { ttl, tags }).catch(error => {
            logger.error('Cache middleware set error:', error);
          });
          return originalJson(data);
        };
        
        next();
      } catch (error) {
        logger.error('Cache middleware error:', error);
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
          return cached;
        }
        
        const result = await method.apply(this, args);
        await cacheService.set(cacheKey, result, { ttl, tags });
        
        return result;
      } catch (error) {
        logger.error(`Cache decorator error for ${propertyName}:`, error);
        return method.apply(this, args);
      }
    };
    
    return descriptor;
  };
}


