import { PrismaClient, OrderStatus, Role } from '@prisma/client';

// Create a singleton Prisma client instance
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = (global as any).prisma;
}

export default prisma;
export { OrderStatus, Role }; 