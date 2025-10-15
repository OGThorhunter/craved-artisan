import { prisma } from '../db';
import { FeeScope, PromoScope, LedgerType } from '@prisma/client';

async function seedRevenueData() {
  console.log('🌱 Seeding revenue system data...');

  try {
    // 1. Create a global fee schedule
    const globalFeeSchedule = await prisma.feeSchedule.create({
      data: {
        name: 'Global Default Fee Schedule',
        scope: 'GLOBAL' as FeeScope,
        scopeRefId: null,
        takeRateBps: 1000, // 10%
        feeFloorCents: 50, // $0.50 minimum
        feeCapCents: null, // no cap
        activeFrom: new Date('2024-01-01'),
        activeTo: null,
        createdById: 'system',
        version: 1,
      },
    });
    console.log('✅ Created global fee schedule');

    // 2. Create a vendor-specific override
    const vendors = await prisma.vendorProfile.findMany({ take: 1 });
    if (vendors.length > 0) {
      await prisma.feeSchedule.create({
        data: {
          name: 'Premium Vendor Rate',
          scope: 'VENDOR' as FeeScope,
          scopeRefId: vendors[0].id,
          takeRateBps: 500, // 5% for this vendor
          feeFloorCents: 25, // $0.25 minimum
          feeCapCents: null,
          activeFrom: new Date('2024-01-01'),
          activeTo: null,
          createdById: 'system',
          version: 1,
        },
      });
      console.log('✅ Created vendor-specific fee schedule');
    }

    // 3. Create some promo codes
    const promo1 = await prisma.platformPromo.create({
      data: {
        code: 'WELCOME10',
        appliesTo: 'PLATFORM_FEE' as PromoScope,
        percentOffBps: 1000, // 10% off
        amountOffCents: null,
        startsAt: new Date('2024-01-01'),
        endsAt: new Date('2024-12-31'),
        audienceTag: null,
        maxRedemptions: 1000,
        currentUses: 45,
      },
    });

    const promo2 = await prisma.platformPromo.create({
      data: {
        code: 'SAVE5',
        appliesTo: 'PLATFORM_FEE' as PromoScope,
        percentOffBps: null,
        amountOffCents: 500, // $5 off
        startsAt: new Date('2024-01-01'),
        endsAt: null,
        audienceTag: null,
        maxRedemptions: null,
        currentUses: 12,
      },
    });
    console.log('✅ Created promo codes');

    // 4. Create some ledger entries for the past 30 days
    const users = await prisma.user.findMany({ take: 5 });
    const orders = await prisma.order.findMany({ take: 10 });

    if (users.length > 0 && orders.length > 0) {
      const ledgerEntries = [];

      // Create entries for each day in the past 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Order fees
        ledgerEntries.push({
          type: 'ORDER_FEE' as LedgerType,
          amountCents: Math.floor(Math.random() * 5000) + 1000, // $10-$60
          currency: 'usd',
          userId: users[i % users.length].id,
          orderId: orders[i % orders.length]?.id,
          stripeChargeId: `ch_test_${Date.now()}_${i}`,
          createdById: 'system',
          occurredAt: date,
        });

        // Processing fees
        ledgerEntries.push({
          type: 'PROCESSING_FEE' as LedgerType,
          amountCents: -Math.floor(Math.random() * 300) - 50, // -$0.50 to -$3.50
          currency: 'usd',
          userId: users[i % users.length].id,
          orderId: orders[i % orders.length]?.id,
          stripeChargeId: `ch_test_${Date.now()}_${i}`,
          createdById: 'system',
          occurredAt: date,
        });
      }

      // Add some event fees
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i * 3);

        ledgerEntries.push({
          type: 'EVENT_FEE' as LedgerType,
          amountCents: Math.floor(Math.random() * 10000) + 5000, // $50-$150
          currency: 'usd',
          userId: users[i % users.length].id,
          createdById: 'system',
          occurredAt: date,
        });
      }

      // Add some subscription fees
      for (let i = 0; i < 3; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i * 10);

        ledgerEntries.push({
          type: 'SUBSCRIPTION_FEE' as LedgerType,
          amountCents: 2999, // $29.99
          currency: 'usd',
          userId: users[i % users.length].id,
          createdById: 'system',
          occurredAt: date,
        });
      }

      await prisma.ledgerEntry.createMany({
        data: ledgerEntries,
      });
      console.log(`✅ Created ${ledgerEntries.length} ledger entries`);
    }

    // 5. Create some revenue payouts
    if (users.length > 0) {
      for (let i = 0; i < 5; i++) {
        await prisma.revenuePayout.create({
          data: {
            userId: users[i % users.length].id,
            grossCents: Math.floor(Math.random() * 50000) + 10000, // $100-$600
            feeCents: 100, // $1 fee
            netCents: Math.floor(Math.random() * 50000) + 9900,
            status: ['PENDING', 'IN_TRANSIT', 'PAID'][i % 3] as any,
            expectedDate: new Date(Date.now() + i * 86400000),
            stripePayoutId: `po_test_${Date.now()}_${i}`,
          },
        });
      }
      console.log('✅ Created revenue payouts');
    }

    // 6. Create revenue snapshots for the past 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const gmv = Math.floor(Math.random() * 100000) + 50000; // $500-$1500
      const platformRev = Math.floor(gmv * 0.1); // 10% take rate
      const processingCost = Math.floor(platformRev * 0.03); // 3% processing
      
      await prisma.revenueSnapshot.upsert({
        where: { date },
        create: {
          date,
          gmvCents: gmv,
          platformRevenueCents: platformRev,
          marketplaceFeeCents: Math.floor(platformRev * 0.7),
          eventFeeCents: Math.floor(platformRev * 0.2),
          subscriptionFeeCents: Math.floor(platformRev * 0.1),
          processingCostCents: processingCost,
          refundsCents: Math.floor(Math.random() * 1000),
          disputesCents: Math.floor(Math.random() * 500),
          netRevenueCents: platformRev - processingCost,
          takeRateBps: 1000, // 10%
          payoutsPendingCents: Math.floor(Math.random() * 10000),
          payoutsInTransitCents: Math.floor(Math.random() * 5000),
          payoutsCompletedCents: Math.floor(Math.random() * 50000),
          taxCollectedCents: Math.floor(Math.random() * 2000),
        },
        update: {},
      });
    }
    console.log('✅ Created revenue snapshots');

    // 7. Create revenue policies
    const policies = [
      { key: 'refund_behavior', value: JSON.stringify({ type: 'proportional' }), description: 'How platform fees are handled on refunds' },
      { key: 'processing_fee_bearer', value: JSON.stringify({ bearer: 'vendor' }), description: 'Who bears processing fees' },
      { key: 'dispute_loss_split', value: JSON.stringify({ platform: 50, vendor: 50 }), description: 'How dispute losses are split' },
      { key: 'accounting_mode', value: JSON.stringify({ default: 'accrual' }), description: 'Default accounting mode' },
    ];

    for (const policy of policies) {
      await prisma.revenuePolicy.upsert({
        where: { key: policy.key },
        create: {
          ...policy,
          updatedBy: 'system',
        },
        update: {
          value: policy.value,
          updatedBy: 'system',
        },
      });
    }
    console.log('✅ Created revenue policies');

    console.log('✨ Revenue system seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding revenue data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedRevenueData()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

export { seedRevenueData };

