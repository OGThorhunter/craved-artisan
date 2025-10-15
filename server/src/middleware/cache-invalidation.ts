import { cacheService } from '../services/cache';
import { logger } from '../logger';

/**
 * Middleware to invalidate vendor cache after mutations
 * Use this on routes that modify orders, products, or analytics data
 */
export const invalidateVendorCache = (scope?: 'analytics' | 'products' | 'orders') => {
  return async (req: any, res: any, next: any) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json to invalidate cache after successful response
    res.json = async function (data: any) {
      // Only invalidate on successful responses (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const vendorId = req.user?.vendorProfileId || req.user?.userId;
        
        if (vendorId) {
          try {
            await cacheService.invalidateVendorCache(vendorId, scope);
            logger.info({ 
              vendorId, 
              scope,
              method: req.method,
              path: req.path 
            }, '🔄 Cache invalidated after mutation');
          } catch (error) {
            logger.error({ 
              error, 
              vendorId, 
              scope 
            }, '❌ Cache invalidation error');
          }
        }
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Invalidate product cache when products are modified
 */
export const invalidateProductCache = invalidateVendorCache('products');

/**
 * Invalidate order cache when orders are modified
 */
export const invalidateOrderCache = invalidateVendorCache('orders');

/**
 * Invalidate analytics cache when any data affecting analytics changes
 */
export const invalidateAnalyticsCache = invalidateVendorCache('analytics');

/**
 * Invalidate all vendor cache (use sparingly)
 */
export const invalidateAllVendorCache = invalidateVendorCache();

/**
 * Manual cache invalidation helper
 */
export async function invalidateCacheForVendor(vendorId: string, scope?: string): Promise<void> {
  try {
    await cacheService.invalidateVendorCache(vendorId, scope);
    logger.info({ vendorId, scope }, '🔄 Manual cache invalidation');
  } catch (error) {
    logger.error({ error, vendorId, scope }, '❌ Manual cache invalidation error');
    throw error;
  }
}

/**
 * Cache warm-up utility (pre-populate cache for better performance)
 */
export async function warmUpVendorCache(vendorId: string, dateFrom: string, dateTo: string): Promise<void> {
  logger.info({ vendorId, dateFrom, dateTo }, '🔥 Warming up vendor cache');
  
  // This would typically call your analytics endpoints to pre-populate cache
  // Implementation depends on your specific needs
}

