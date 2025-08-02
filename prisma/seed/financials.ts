import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  const vendors = await prisma.vendorProfile.findMany();

  for (const vendor of vendors) {
    for (let i = 0; i < 6; i++) {
      const revenue = faker.number.float({ min: 3000, max: 15000 });
      const cogs = faker.number.float({ min: 1000, max: revenue * 0.6 });
      const opex = faker.number.float({ min: 500, max: 2000 });
      const netProfit = revenue - cogs - opex;
      const cashIn = revenue;
      const cashOut = cogs + opex;
      const assets = faker.number.float({ min: 5000, max: 20000 });
      const liabilities = faker.number.float({ min: 1000, max: 10000 });
      const equity = assets - liabilities;

      await prisma.financialSnapshot.create({
        data: {
          vendorId: vendor.id,
          date: faker.date.recent({ days: 180 }),
          revenue,
          cogs,
          opex,
          netProfit,
          assets,
          liabilities,
          equity,
          cashIn,
          cashOut,
          notes: faker.finance.transactionDescription(),
        },
      });
    }
  }
}

main()
  .then(() => {
    console.log("✅ Financial snapshots seeded");
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  }); 