/**
 * Redis configuration with fallback for version compatibility
 */

import { logger } from '../logger';

export interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
  version?: string;
}

/**
 * Get Redis configuration with version compatibility
 */
export function getRedisConfig(): RedisConfig {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    logger.warn('⚠️  No REDIS_URL configured. Redis features will be disabled.');
    return {};
  }
  
  try {
    const url = new URL(redisUrl);
    return {
      url: redisUrl,
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      version: process.env.REDIS_VERSION || '6.0.0'
    };
  } catch (error) {
    logger.error('❌ Invalid REDIS_URL format:', error);
    return {};
  }
}

/**
 * Check Redis version compatibility
 */
export function checkRedisVersion(version: string): boolean {
  const requiredVersion = '5.0.0';
  const currentVersion = version || '3.0.504';
  
  // Simple version comparison
  const required = requiredVersion.split('.').map(Number);
  const current = currentVersion.split('.').map(Number);
  
  for (let i = 0; i < Math.max(required.length, current.length); i++) {
    const req = required[i] || 0;
    const cur = current[i] || 0;
    
    if (cur > req) return true;
    if (cur < req) return false;
  }
  
  return true;
}

/**
 * Get Redis configuration with compatibility check
 */
export function getCompatibleRedisConfig(): RedisConfig & { compatible: boolean } {
  const config = getRedisConfig();
  const compatible = !config.url || checkRedisVersion(config.version || '3.0.504');
  
  if (config.url && !compatible) {
    logger.warn(`⚠️  Redis version ${config.version} is not compatible. Required: 5.0.0+. Redis features will be disabled.`);
  }
  
  return {
    ...config,
    compatible
  };
}
