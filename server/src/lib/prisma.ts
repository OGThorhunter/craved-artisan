import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';
import { createPrismaClient, validateDatabaseConfig } from '../utils/databaseConfig';

/**
 * Singleton Prisma Client
 * 
 * This ensures only one Prisma Client instance is created
 * and reused across the application, preventing connection
 * pool exhaustion in production environments.
 */

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create Prisma client with validated configuration
let prisma: PrismaClient;

try {
  prisma = global.prisma || createPrismaClient();
  
  // Set up event listeners for better error tracking
  prisma.$on('warn', (e) => {
    logger.warn('Prisma Warning:', e);
  });

  prisma.$on('error', (e) => {
    logger.error('Prisma Error:', e);
  });

  if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
      logger.debug(`Query: ${e.query}, Params: ${e.params}, Duration: ${e.duration}ms`);
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
  }
} catch (error) {
  logger.error('❌ Failed to initialize Prisma Client:', error);
  throw error;
}

export { prisma };

// Graceful shutdown
process.on('beforeExit', async () => {
  logger.info('Disconnecting Prisma Client...');
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Disconnecting Prisma Client...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Disconnecting Prisma Client...');
  await prisma.$disconnect();
  process.exit(0);
});






