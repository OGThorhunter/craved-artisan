import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with proper error handling
let prisma: PrismaClient;

try {
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: [
      { level: 'warn', emit: 'event' },
      { level: 'error', emit: 'event' },
      ...(process.env.NODE_ENV === 'development' ? [{ level: 'query', emit: 'event' }] : []),
    ],
  });

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

  // Test the connection on startup with retry logic
  const testConnection = async () => {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      logger.info('✅ Prisma Client connected successfully');
    } catch (error) {
      logger.error('❌ Prisma Client connection failed:', error);
      // Don't throw here, let the application start and retry later
    }
  };
  
  // Run connection test asynchronously
  testConnection();

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
} catch (error) {
  logger.error('❌ Failed to initialize Prisma Client:', error);
  throw error;
}

export { prisma };
