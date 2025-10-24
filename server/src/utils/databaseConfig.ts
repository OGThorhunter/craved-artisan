/**
 * Centralized database configuration utility
 * This ensures consistent database configuration across the application
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

export interface DatabaseConfig {
  url: string;
  directUrl?: string;
  host: string;
  port: string;
  database: string;
  username: string;
  hasPassword: boolean;
}

/**
 * Get and validate database configuration
 */
export function getDatabaseConfig(): DatabaseConfig {
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  try {
    const url = new URL(databaseUrl);
    
    return {
      url: databaseUrl,
      directUrl,
      host: url.hostname,
      port: url.port,
      database: url.pathname.slice(1),
      username: url.username,
      hasPassword: !!url.password
    };
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a properly configured Prisma client
 */
export function createPrismaClient(): PrismaClient {
  const config = getDatabaseConfig();
  
  logger.info('🔍 Creating Prisma client with config:', {
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.username,
    hasPassword: config.hasPassword,
    hasDirectUrl: !!config.directUrl
  });
  
  return new PrismaClient({
    datasources: {
      db: {
        url: config.url
      }
    },
    log: [
      { level: 'warn', emit: 'event' },
      { level: 'error', emit: 'event' },
      ...(process.env.NODE_ENV === 'development' ? [{ level: 'query', emit: 'event' }] : []),
    ],
  });
}

/**
 * Test database connection with detailed error reporting
 */
export async function testDatabaseConnection(): Promise<{
  success: boolean;
  error?: string;
  config?: DatabaseConfig;
}> {
  try {
    logger.info('🔍 Testing database connection...');
    
    const config = getDatabaseConfig();
    const prisma = createPrismaClient();
    
    // Test connection
    await prisma.$connect();
    logger.info('✅ Database connection successful');
    
    // Test simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    logger.info('✅ Simple query successful:', result);
    
    // Test user table access
    const userCount = await prisma.user.count();
    logger.info('✅ User table accessible, count:', userCount);
    
    await prisma.$disconnect();
    
    return {
      success: true,
      config
    };
    
  } catch (error: any) {
    logger.error('❌ Database connection test failed:', error.message);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate database configuration on startup
 */
export async function validateDatabaseConfig(): Promise<boolean> {
  try {
    logger.info('🔍 Validating database configuration...');
    
    const result = await testDatabaseConnection();
    
    if (result.success) {
      logger.info('✅ Database configuration validation successful');
      return true;
    } else {
      logger.error('❌ Database configuration validation failed:', result.error);
      return false;
    }
    
  } catch (error: any) {
    logger.error('❌ Database configuration validation error:', error.message);
    return false;
  }
}
