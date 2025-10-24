/**
 * Database connection testing utility
 * This helps diagnose and fix database authentication issues
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

export interface DatabaseTestResult {
  success: boolean;
  error?: string;
  details?: any;
}

/**
 * Test database connection with detailed error reporting
 */
export async function testDatabaseConnection(): Promise<DatabaseTestResult> {
  const startTime = Date.now();
  
  try {
    logger.info('🔍 Testing database connection...');
    
    // Create a new Prisma client for testing
    const testPrisma = new PrismaClient({
      log: ['error', 'warn'],
    });

    // Test basic connection
    logger.info('🔍 Testing basic connection...');
    await testPrisma.$connect();
    
    // Test simple query
    logger.info('🔍 Testing simple query...');
    const result = await testPrisma.$queryRaw`SELECT 1 as test`;
    logger.info('✅ Simple query result:', result);
    
    // Test user table access
    logger.info('🔍 Testing user table access...');
    const userCount = await testPrisma.user.count();
    logger.info('✅ User table accessible, count:', userCount);
    
    // Test specific query that was failing
    logger.info('🔍 Testing findUnique query...');
    const testUser = await testPrisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    logger.info('✅ findUnique query successful, result:', testUser);
    
    await testPrisma.$disconnect();
    
    const duration = Date.now() - startTime;
    logger.info(`✅ Database connection test successful in ${duration}ms`);
    
    return {
      success: true,
      details: {
        duration,
        userCount,
        testUser
      }
    };
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error(`❌ Database connection test failed in ${duration}ms:`, error);
    
    return {
      success: false,
      error: error.message,
      details: {
        duration,
        errorType: error.constructor.name,
        errorCode: error.code,
        errorMeta: error.meta
      }
    };
  }
}

/**
 * Test database credentials specifically
 */
export async function testDatabaseCredentials(): Promise<DatabaseTestResult> {
  try {
    logger.info('🔍 Testing database credentials...');
    
    // Check environment variables
    const databaseUrl = process.env.DATABASE_URL;
    const directUrl = process.env.DIRECT_URL;
    
    if (!databaseUrl) {
      return {
        success: false,
        error: 'DATABASE_URL environment variable is not set'
      };
    }
    
    logger.info('🔍 DATABASE_URL is set');
    logger.info('🔍 DIRECT_URL is set:', !!directUrl);
    
    // Parse the connection string to check credentials
    try {
      const url = new URL(databaseUrl);
      logger.info('🔍 Database host:', url.hostname);
      logger.info('🔍 Database port:', url.port);
      logger.info('🔍 Database name:', url.pathname.slice(1));
      logger.info('🔍 Username is set:', !!url.username);
      logger.info('🔍 Password is set:', !!url.password);
      
      // Test connection with current credentials
      const testPrisma = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl
          }
        }
      });
      
      await testPrisma.$connect();
      await testPrisma.$queryRaw`SELECT 1`;
      await testPrisma.$disconnect();
      
      return {
        success: true,
        details: {
          host: url.hostname,
          port: url.port,
          database: url.pathname.slice(1),
          hasUsername: !!url.username,
          hasPassword: !!url.password
        }
      };
      
    } catch (urlError: any) {
      return {
        success: false,
        error: `Invalid DATABASE_URL format: ${urlError.message}`
      };
    }
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      details: {
        errorType: error.constructor.name,
        errorCode: error.code
      }
    };
  }
}

/**
 * Comprehensive database health check
 */
export async function runDatabaseHealthCheck(): Promise<{
  connection: DatabaseTestResult;
  credentials: DatabaseTestResult;
  overall: boolean;
}> {
  logger.info('🏥 Running comprehensive database health check...');
  
  const credentialsTest = await testDatabaseCredentials();
  const connectionTest = await testDatabaseConnection();
  
  const overall = credentialsTest.success && connectionTest.success;
  
  logger.info(`🏥 Database health check complete. Overall: ${overall ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
  
  return {
    connection: connectionTest,
    credentials: credentialsTest,
    overall
  };
}
