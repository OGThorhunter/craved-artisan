import { Router } from 'express';
import { logger } from '../logger';
import { prisma } from '../lib/prisma';
import { getRedisClient, isRedisConnected } from '../config/redis';

const router = Router();
const serverStartTime = Date.now();

/**
 * GET /api/status
 * Comprehensive health check endpoint for infrastructure verification
 * Public endpoint - no authentication required
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Initialize status object
    const status: any = {
      service: 'craved-artisan-api',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - serverStartTime) / 1000),
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: { status: 'unknown', message: '', latency: 0 },
        redis: { status: 'unknown', message: '', latency: 0 },
        environment: { status: 'unknown', message: '', required: [], missing: [] }
      }
    };

    // 1. Database Connection Check
    try {
      const dbCheckStart = Date.now();
      
      // Simple query to verify database connectivity
      await prisma.$queryRaw`SELECT 1 as health_check`;
      
      const dbLatency = Date.now() - dbCheckStart;
      
      status.checks.database = {
        status: 'healthy',
        message: 'Database connected successfully',
        latency: dbLatency,
        type: 'postgresql'
      };
      
      logger.info({ latency: dbLatency }, 'Database health check passed');
    } catch (dbError: any) {
      status.checks.database = {
        status: 'unhealthy',
        message: `Database connection failed: ${dbError.message}`,
        latency: 0,
        error: dbError.message
      };
      
      logger.error({ error: dbError }, 'Database health check failed');
    }

    // 2. Redis Connection Check
    try {
      const redisCheckStart = Date.now();
      const redisClient = getRedisClient();
      
      if (!isRedisConnected()) {
        status.checks.redis = {
          status: 'degraded',
          message: 'Redis not connected - using in-memory fallback',
          latency: 0,
          fallback: true
        };
      } else {
        // Test write and read operation
        const testKey = `health:check:${Date.now()}`;
        const testValue = 'ok';
        
        await redisClient.set(testKey, testValue, 'EX', 10); // Expires in 10 seconds
        const retrievedValue = await redisClient.get(testKey);
        await redisClient.del(testKey);
        
        const redisLatency = Date.now() - redisCheckStart;
        
        if (retrievedValue === testValue) {
          status.checks.redis = {
            status: 'healthy',
            message: 'Redis connected and operational',
            latency: redisLatency,
            operations: ['set', 'get', 'del']
          };
          
          logger.info({ latency: redisLatency }, 'Redis health check passed');
        } else {
          status.checks.redis = {
            status: 'degraded',
            message: 'Redis connected but read/write test failed',
            latency: redisLatency
          };
        }
      }
    } catch (redisError: any) {
      status.checks.redis = {
        status: 'degraded',
        message: `Redis error: ${redisError.message}`,
        latency: 0,
        fallback: true,
        error: redisError.message
      };
      
      logger.warn({ error: redisError }, 'Redis health check failed - fallback active');
    }

    // 3. Environment Configuration Check
    try {
      const requiredEnvVars = [
        'DATABASE_URL',
        'SESSION_SECRET',
        'NODE_ENV'
      ];
      
      const optionalEnvVars = [
        'REDIS_URL',
        'FRONTEND_URL',
        'BACKEND_URL',
        'STRIPE_SECRET_KEY',
        'GOOGLE_CLIENT_ID',
        'FACEBOOK_APP_ID'
      ];
      
      const missingRequired: string[] = [];
      const presentOptional: string[] = [];
      
      // Check required variables
      requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
          missingRequired.push(envVar);
        }
      });
      
      // Check optional variables
      optionalEnvVars.forEach(envVar => {
        if (process.env[envVar]) {
          presentOptional.push(envVar);
        }
      });
      
      if (missingRequired.length === 0) {
        status.checks.environment = {
          status: 'healthy',
          message: 'All required environment variables present',
          required: requiredEnvVars.length,
          missing: 0,
          optional: presentOptional.length
        };
      } else {
        status.checks.environment = {
          status: 'unhealthy',
          message: 'Missing required environment variables',
          required: requiredEnvVars.length,
          missing: missingRequired.length,
          missingVars: missingRequired
        };
      }
    } catch (envError: any) {
      status.checks.environment = {
        status: 'unknown',
        message: `Environment check failed: ${envError.message}`,
        error: envError.message
      };
      
      logger.error({ error: envError }, 'Environment health check failed');
    }

    // Calculate overall status
    const allHealthy = 
      status.checks.database.status === 'healthy' && 
      (status.checks.redis.status === 'healthy' || status.checks.redis.status === 'degraded') &&
      status.checks.environment.status === 'healthy';
    
    const anyUnhealthy = 
      status.checks.database.status === 'unhealthy' || 
      status.checks.environment.status === 'unhealthy';

    status.overall = anyUnhealthy ? 'unhealthy' : (allHealthy ? 'healthy' : 'degraded');
    status.totalLatency = Date.now() - startTime;

    // Set appropriate HTTP status code
    const httpStatus = anyUnhealthy ? 503 : 200;

    logger.info(
      { 
        overall: status.overall,
        database: status.checks.database.status,
        redis: status.checks.redis.status,
        environment: status.checks.environment.status,
        latency: status.totalLatency
      },
      'Health check completed'
    );

    res.status(httpStatus).json(status);

  } catch (error: any) {
    logger.error({ error }, 'Health check endpoint error');
    
    res.status(500).json({
      service: 'craved-artisan-api',
      timestamp: new Date().toISOString(),
      overall: 'error',
      error: 'Health check failed',
      message: error.message
    });
  }
});

/**
 * GET /api/status/ping
 * Simple ping endpoint for quick availability check
 */
router.get('/ping', (_req, res) => {
  res.json({ 
    ok: true, 
    timestamp: Date.now(),
    uptime: Math.floor((Date.now() - serverStartTime) / 1000)
  });
});

export default router;

