import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables from project root
dotenv.config({ path: '../.env' });

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting role normalization...');

  // Update UserRole table to convert old roles to new ones
  const userRoleB2B = await prisma.userRole.updateMany({
    where: { role: 'B2B_VENDOR' },
    data: { role: 'VENDOR' },
  });
  console.log(`✅ Updated ${userRoleB2B.count} UserRole records: B2B_VENDOR → VENDOR`);

  const userRoleDropoff = await prisma.userRole.updateMany({
    where: { role: 'DROPOFF_MANAGER' },
    data: { role: 'ADMIN' },
  });
  console.log(`✅ Updated ${userRoleDropoff.count} UserRole records: DROPOFF_MANAGER → ADMIN`);

  const userRoleSuper = await prisma.userRole.updateMany({
    where: { role: 'SUPER_ADMIN' },
    data: { role: 'ADMIN' },
  });
  console.log(`✅ Updated ${userRoleSuper.count} UserRole records: SUPER_ADMIN → ADMIN`);

  console.log('\n✅ Role normalization complete!');
  console.log('Next step: Run npx prisma migrate dev --name consolidate-roles-to-4');
}

main()
  .catch((e) => {
    console.error('❌ Error during role normalization:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

