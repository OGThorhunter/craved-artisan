import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

// Backend performance optimization: Intelligent caching middleware for promotions
interface CacheEntry {
  data: any;
  timestamp: number;
  etag: string;
}

class PromotionsCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 1000;

  // Generate cache key from request
  private generateCacheKey(req: Request): string {
    const { path, query, params } = req;
    const keyString = JSON.stringify({ path, query, params, userId: (req as any).user?.userId });
    return createHash('md5').update(keyString).digest('hex');
  }

  // Generate ETag for response
  private generateETag(data: any): string {
    return createHash('md5').update(JSON.stringify(data)).digest('hex');
  }

  // Cache middleware for GET requests
  cacheMiddleware(ttl: number = this.DEFAULT_TTL) {
    return (req: Request, res: Response, next: NextFunction) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = this.generateCacheKey(req);
      const cached = this.cache.get(cacheKey);

      // Check if cached data is still valid
      if (cached && Date.now() - cached.timestamp < ttl) {
        // Check ETag for conditional requests
        if (req.headers['if-none-match'] === cached.etag) {
          return res.status(304).end();
        }

        res.set('ETag', cached.etag);
        res.set('Cache-Control', `max-age=${Math.floor((ttl - (Date.now() - cached.timestamp)) / 1000)}`);
        return res.json(cached.data);
      }

      // Intercept response to cache it
      const originalSend = res.json;
      res.json = function(body: any) {
        // Cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const etag = this.generateETag(body);
          
          // Implement LRU eviction if cache is full
          if (this.cache.size >= this.MAX_CACHE_SIZE) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
          }
          
          this.cache.set(cacheKey, {
            data: body,
            timestamp: Date.now(),
            etag
          });
          
          res.set('ETag', etag);
          res.set('Cache-Control', `max-age=${Math.floor(ttl / 1000)}`);
        }
        
        return originalSend.call(this, body);
      }.bind(this);

      next();
    };
  }

  // Invalidate cache for specific patterns
  invalidatePattern(pattern: string): void {
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Invalidate cache after mutations
  invalidateOnMutation() {
    return (req: Request, res: Response, next: NextFunction) => {
      // For non-GET requests, invalidate related cache entries
      if (req.method !== 'GET') {
        const originalSend = res.json;
        res.json = function(body: any) {
          // Invalidate cache on successful mutations
          if (res.statusCode >= 200 && res.statusCode < 300) {
            // Invalidate promotions-related cache entries
            if (req.path.includes('/promotions/')) {
              this.invalidatePattern('promotions');
            }
            if (req.path.includes('/campaigns/')) {
              this.invalidatePattern('campaigns');
            }
            if (req.path.includes('/social-media/')) {
              this.invalidatePattern('social-media');
            }
          }
          
          return originalSend.call(this, body);
        }.bind(this);
      }
      
      next();
    };
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: this.calculateHitRate(),
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        size: JSON.stringify(entry.data).length
      }))
    };
  }

  private calculateHitRate(): number {
    // This would need to be implemented with hit/miss counters
    // For now, return estimated hit rate based on cache utilization
    return Math.min(this.cache.size / this.MAX_CACHE_SIZE, 1);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.DEFAULT_TTL) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Singleton cache instance
export const promotionsCache = new PromotionsCache();

// Scheduled cleanup every 10 minutes
setInterval(() => {
  promotionsCache.cleanup();
}, 10 * 60 * 1000);

// Export middleware functions
export const cachePromotionsData = (ttl?: number) => promotionsCache.cacheMiddleware(ttl);
export const invalidateOnMutation = () => promotionsCache.invalidateOnMutation();
export const getCacheStats = () => promotionsCache.getStats();
export const clearPromotionsCache = () => promotionsCache.clear();
