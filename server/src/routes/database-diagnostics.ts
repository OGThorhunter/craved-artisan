/**
 * Database diagnostics endpoint
 * This helps diagnose database connection issues
 */

import { Router } from 'express';
import { testDatabaseConnection, testDatabaseCredentials, runDatabaseHealthCheck } from '../utils/testDatabase';
import { logger } from '../logger';

const router = Router();

/**
 * GET /api/database/health
 * Run comprehensive database health check
 */
router.get('/health', async (req, res) => {
  try {
    logger.info('🏥 Database health check requested');
    
    const healthCheck = await runDatabaseHealthCheck();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      health: healthCheck
    });
    
  } catch (error: any) {
    logger.error('❌ Database health check failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/database/test-connection
 * Test basic database connection
 */
router.get('/test-connection', async (req, res) => {
  try {
    logger.info('🔍 Database connection test requested');
    
    const result = await testDatabaseConnection();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Database connection successful',
        timestamp: new Date().toISOString(),
        details: result.details
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        timestamp: new Date().toISOString(),
        details: result.details
      });
    }
    
  } catch (error: any) {
    logger.error('❌ Database connection test failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/database/test-credentials
 * Test database credentials
 */
router.get('/test-credentials', async (req, res) => {
  try {
    logger.info('🔍 Database credentials test requested');
    
    const result = await testDatabaseCredentials();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Database credentials valid',
        timestamp: new Date().toISOString(),
        details: result.details
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        timestamp: new Date().toISOString(),
        details: result.details
      });
    }
    
  } catch (error: any) {
    logger.error('❌ Database credentials test failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/database/info
 * Get database connection information (without sensitive data)
 */
router.get('/info', async (req, res) => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    const directUrl = process.env.DIRECT_URL;
    
    if (!databaseUrl) {
      return res.status(500).json({
        success: false,
        error: 'DATABASE_URL not configured'
      });
    }
    
    // Parse URL to extract safe information
    const url = new URL(databaseUrl);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        host: url.hostname,
        port: url.port,
        database: url.pathname.slice(1),
        protocol: url.protocol,
        hasCredentials: !!(url.username && url.password),
        hasDirectUrl: !!directUrl,
        sslMode: url.searchParams.get('sslmode'),
        channelBinding: url.searchParams.get('channel_binding')
      }
    });
    
  } catch (error: any) {
    logger.error('❌ Database info request failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
