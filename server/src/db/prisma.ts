import { PrismaClient } from '@prisma/client';

// Create a singleton PrismaClient instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: [
    // Always log warnings and errors
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
    // Only log queries in development
    ...(process.env.NODE_ENV === 'development' 
      ? [{ level: 'query', emit: 'event' }] 
      : []
    ),
  ],
});

// Handle query logging in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    console.log('Query: ' + e.query);
    console.log('Params: ' + e.params);
    console.log('Duration: ' + e.duration + 'ms');
  });
}

// Handle warning logging
prisma.$on('warn', (e) => {
  console.warn('Prisma Warning:', e);
});

// Handle error logging
prisma.$on('error', (e) => {
  console.error('Prisma Error:', e);
});

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
