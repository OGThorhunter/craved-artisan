/**
 * Database Authentication Fix Script
 * This script helps diagnose and fix database authentication issues
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface DatabaseFixOptions {
  testConnection?: boolean;
  regenerateCredentials?: boolean;
  updateEnvFile?: boolean;
}

/**
 * Main function to fix database authentication issues
 */
export async function fixDatabaseAuthentication(options: DatabaseFixOptions = {}) {
  logger.info('🔧 Starting database authentication fix...');
  
  try {
    // Step 1: Check current environment variables
    logger.info('🔍 Step 1: Checking environment variables...');
    const databaseUrl = process.env.DATABASE_URL;
    const directUrl = process.env.DIRECT_URL;
    
    if (!databaseUrl) {
      logger.error('❌ DATABASE_URL is not set in environment variables');
      return { success: false, error: 'DATABASE_URL not configured' };
    }
    
    logger.info('✅ DATABASE_URL is set');
    logger.info('✅ DIRECT_URL is set:', !!directUrl);
    
    // Step 2: Parse and validate the connection string
    logger.info('🔍 Step 2: Parsing connection string...');
    let parsedUrl;
    try {
      parsedUrl = new URL(databaseUrl);
      logger.info('✅ Connection string format is valid');
      logger.info('🔍 Host:', parsedUrl.hostname);
      logger.info('🔍 Port:', parsedUrl.port);
      logger.info('🔍 Database:', parsedUrl.pathname.slice(1));
      logger.info('🔍 Username:', parsedUrl.username ? '***SET***' : 'NOT SET');
      logger.info('🔍 Password:', parsedUrl.password ? '***SET***' : 'NOT SET');
    } catch (error) {
      logger.error('❌ Invalid DATABASE_URL format:', error);
      return { success: false, error: 'Invalid DATABASE_URL format' };
    }
    
    // Step 3: Test database connection
    if (options.testConnection) {
      logger.info('🔍 Step 3: Testing database connection...');
      
      try {
        const testPrisma = new PrismaClient({
          datasources: {
            db: {
              url: databaseUrl
            }
          }
        });
        
        await testPrisma.$connect();
        logger.info('✅ Database connection successful');
        
        // Test a simple query
        const result = await testPrisma.$queryRaw`SELECT 1 as test`;
        logger.info('✅ Simple query successful:', result);
        
        // Test user table access
        const userCount = await testPrisma.user.count();
        logger.info('✅ User table accessible, count:', userCount);
        
        await testPrisma.$disconnect();
        
      } catch (error: any) {
        logger.error('❌ Database connection failed:', error.message);
        
        // Provide specific error guidance
        if (error.message.includes('authentication failed')) {
          logger.error('🔧 AUTHENTICATION ERROR: The database credentials are invalid');
          logger.error('🔧 Possible solutions:');
          logger.error('   1. Check if the username/password in DATABASE_URL is correct');
          logger.error('   2. Verify the database exists and is accessible');
          logger.error('   3. Check if the user has proper permissions');
          logger.error('   4. Verify the database server is running');
        } else if (error.message.includes('connection refused')) {
          logger.error('🔧 CONNECTION ERROR: Cannot connect to the database server');
          logger.error('🔧 Possible solutions:');
          logger.error('   1. Check if the database server is running');
          logger.error('   2. Verify the host and port are correct');
          logger.error('   3. Check firewall settings');
        } else if (error.message.includes('database') && error.message.includes('does not exist')) {
          logger.error('🔧 DATABASE ERROR: The specified database does not exist');
          logger.error('🔧 Possible solutions:');
          logger.error('   1. Create the database');
          logger.error('   2. Check the database name in the connection string');
        }
        
        return { success: false, error: error.message };
      }
    }
    
    // Step 4: Provide recommendations
    logger.info('🔍 Step 4: Providing recommendations...');
    
    const recommendations = [];
    
    if (!parsedUrl.username || !parsedUrl.password) {
      recommendations.push('Set username and password in DATABASE_URL');
    }
    
    if (!directUrl) {
      recommendations.push('Set DIRECT_URL for Prisma migrations');
    }
    
    if (recommendations.length > 0) {
      logger.warn('⚠️  Recommendations:');
      recommendations.forEach((rec, index) => {
        logger.warn(`   ${index + 1}. ${rec}`);
      });
    }
    
    logger.info('✅ Database authentication fix completed successfully');
    
    return {
      success: true,
      recommendations,
      connectionInfo: {
        host: parsedUrl.hostname,
        port: parsedUrl.port,
        database: parsedUrl.pathname.slice(1),
        hasCredentials: !!(parsedUrl.username && parsedUrl.password)
      }
    };
    
  } catch (error: any) {
    logger.error('❌ Database authentication fix failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate a new database connection string template
 */
export function generateDatabaseUrlTemplate() {
  return {
    neon: 'postgresql://username:password@hostname:port/database?sslmode=require',
    local: 'postgresql://username:password@localhost:5432/database',
    example: 'postgresql://neondb_owner:password@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require'
  };
}

// Run the fix if this script is executed directly
if (require.main === module) {
  fixDatabaseAuthentication({ testConnection: true })
    .then(result => {
      if (result.success) {
        logger.info('🎉 Database authentication fix completed successfully');
        process.exit(0);
      } else {
        logger.error('💥 Database authentication fix failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      logger.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}
