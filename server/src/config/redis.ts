import Redis from 'ioredis';
import { logger } from '../logger';

// Redis client configuration
let redisClient: Redis | null = null;
let isConnected = false;

/**
 * Initialize Redis client
 * Falls back to mock implementation if Redis is not available (development)
 */
export function createRedisClient(): Redis {
  const redisUrl = process.env.REDIS_URL;
  
  // If no Redis URL provided, log warning and use mock
  if (!redisUrl) {
    logger.warn('⚠️  No REDIS_URL configured. Using in-memory cache (NOT suitable for production)');
    // Return a mock client for development
    return createMockRedisClient();
  }

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          // Only reconnect when the error contains "READONLY"
          return true;
        }
        return false;
      },
      enableReadyCheck: true,
      lazyConnect: false,
    });

    // Connection events
    client.on('connect', () => {
      isConnected = true;
      logger.info('✅ Redis client connected successfully');
    });

    client.on('ready', () => {
      logger.info('✅ Redis client ready to accept commands');
    });

    client.on('error', (err: Error) => {
      isConnected = false;
      logger.error({ error: err.message }, '❌ Redis client error');
    });

    client.on('close', () => {
      isConnected = false;
      logger.warn('⚠️  Redis client connection closed');
    });

    client.on('reconnecting', () => {
      logger.info('🔄 Redis client reconnecting...');
    });

    client.on('end', () => {
      isConnected = false;
      logger.warn('⚠️  Redis client connection ended');
    });

    return client;
  } catch (error) {
    logger.error({ error }, '❌ Failed to create Redis client, falling back to mock');
    return createMockRedisClient();
  }
}

/**
 * Get or create Redis client singleton
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

/**
 * Check if Redis is connected
 */
export function isRedisConnected(): boolean {
  return isConnected;
}

/**
 * Gracefully close Redis connection
 */
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    logger.info('Closing Redis connection...');
    await redisClient.quit();
    redisClient = null;
    isConnected = false;
    logger.info('✅ Redis connection closed');
  }
}

/**
 * Mock Redis client for development without Redis
 */
function createMockRedisClient(): any {
  const store = new Map<string, { value: string; expiry?: number }>();
  
  logger.warn('🔧 Using mock Redis client - sessions will not persist across restarts');

  return {
    // Basic operations
    get: async (key: string) => {
      const item = store.get(key);
      if (!item) return null;
      if (item.expiry && Date.now() > item.expiry) {
        store.delete(key);
        return null;
      }
      return item.value;
    },
    
    set: async (key: string, value: string) => {
      store.set(key, { value });
      return 'OK';
    },
    
    setex: async (key: string, seconds: number, value: string) => {
      store.set(key, { 
        value, 
        expiry: Date.now() + (seconds * 1000) 
      });
      return 'OK';
    },
    
    del: async (key: string) => {
      store.delete(key);
      return 1;
    },
    
    exists: async (key: string) => {
      return store.has(key) ? 1 : 0;
    },
    
    ttl: async (key: string) => {
      const item = store.get(key);
      if (!item) return -2;
      if (!item.expiry) return -1;
      const remaining = Math.floor((item.expiry - Date.now()) / 1000);
      return remaining > 0 ? remaining : -2;
    },
    
    expire: async (key: string, seconds: number) => {
      const item = store.get(key);
      if (!item) return 0;
      item.expiry = Date.now() + (seconds * 1000);
      return 1;
    },
    
    keys: async (pattern: string) => {
      // Simple pattern matching for mock
      const regex = new RegExp(pattern.replace('*', '.*'));
      return Array.from(store.keys()).filter(key => regex.test(key));
    },
    
    flushall: async () => {
      store.clear();
      return 'OK';
    },
    
    dbsize: async () => {
      return store.size;
    },
    
    // Session store compatibility
    on: () => {},
    off: () => {},
    quit: async () => {},
    disconnect: () => {},
    
    // Redis info
    status: 'ready',
  };
}

// Export for testing
export { createMockRedisClient };

