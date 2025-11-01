import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting role normalization...');

  // 1) B2B_VENDOR -> VENDOR
  const b2bVendorCount = await prisma.user.updateMany({
    where: { role: 'B2B_VENDOR' as any },
    data: { role: 'VENDOR' },
  });
  console.log(`✅ Converted ${b2bVendorCount.count} B2B_VENDOR → VENDOR`);

  // 2) DROPOFF_MANAGER -> ADMIN
  const dropoffManagerCount = await prisma.user.updateMany({
    where: { role: 'DROPOFF_MANAGER' as any },
    data: { role: 'ADMIN' },
  });
  console.log(`✅ Converted ${dropoffManagerCount.count} DROPOFF_MANAGER → ADMIN`);

  // 3) SUPER_ADMIN -> ADMIN
  const superAdminCount = await prisma.user.updateMany({
    where: { role: 'SUPER_ADMIN' as any },
    data: { role: 'ADMIN' },
  });
  console.log(`✅ Converted ${superAdminCount.count} SUPER_ADMIN → ADMIN`);

  // Also update UserRole table if it exists
  const userRoleB2B = await prisma.userRole.updateMany({
    where: { role: 'B2B_VENDOR' as any },
    data: { role: 'VENDOR' },
  });
  console.log(`✅ Updated ${userRoleB2B.count} UserRole records: B2B_VENDOR → VENDOR`);

  const userRoleDropoff = await prisma.userRole.updateMany({
    where: { role: 'DROPOFF_MANAGER' as any },
    data: { role: 'ADMIN' },
  });
  console.log(`✅ Updated ${userRoleDropoff.count} UserRole records: DROPOFF_MANAGER → ADMIN`);

  const userRoleSuper = await prisma.userRole.updateMany({
    where: { role: 'SUPER_ADMIN' as any },
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

