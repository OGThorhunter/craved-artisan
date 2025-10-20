import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

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

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

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


