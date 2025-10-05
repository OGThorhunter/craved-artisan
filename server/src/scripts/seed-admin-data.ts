import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function seedAdminData() {
  console.log('🌱 Seeding admin data...');

  try {
    // Get the first vendor profile ID for system messages
    const vendorProfile = await prisma.vendorProfile.findFirst();
    if (!vendorProfile) {
      console.log('⚠️ No vendor profiles found, skipping system messages');
      return;
    }

    // Create sample system messages
    const sampleMessages = [
      {
        vendorProfileId: vendorProfile.id,
        scope: 'orders',
        type: 'warning',
        title: 'High order volume detected',
        body: 'Your store has received 50+ orders in the last hour. Consider reviewing your inventory levels.',
        data: JSON.stringify({
          orderCount: 52,
          timeWindow: '1 hour',
          recommendation: 'check_inventory'
        })
      },
      {
        vendorProfileId: vendorProfile.id,
        scope: 'inventory',
        type: 'error',
        title: 'Low stock alert',
        body: 'Product "Artisan Bread Mix" is running low (3 units remaining).',
        data: JSON.stringify({
          productId: 'prod-123',
          productName: 'Artisan Bread Mix',
          currentStock: 3,
          threshold: 10
        })
      },
      {
        vendorProfileId: vendorProfile.id,
        scope: 'labels',
        type: 'info',
        title: 'Label print queue updated',
        body: '15 new labels have been added to your print queue.',
        data: JSON.stringify({
          queueSize: 15,
          estimatedTime: '5 minutes'
        })
      },
      {
        vendorProfileId: vendorProfile.id,
        scope: 'events',
        type: 'success',
        title: 'Event application approved',
        body: 'Your application for "Farmers Market Spring 2024" has been approved.',
        data: JSON.stringify({
          eventId: 'event-456',
          eventName: 'Farmers Market Spring 2024',
          stallNumber: 'B-12'
        })
      },
      {
        vendorProfileId: vendorProfile.id,
        scope: 'support',
        type: 'info',
        title: 'Support ticket created',
        body: 'A new support ticket has been created regarding your account settings.',
        data: JSON.stringify({
          ticketId: 'ticket-789',
          priority: 'normal',
          category: 'account'
        })
      }
    ];

    for (const message of sampleMessages) {
      await (prisma as any).systemMessage.create({
        data: {
          ...message,
          createdAt: faker.date.recent({ days: 7 })
        }
      });
    }

    // Create sample system checks
    const systemChecks = [
      {
        kind: 'http',
        name: 'API Health',
        status: 'OK',
        value: 150,
        unit: 'ms',
        details: JSON.stringify({
          endpoint: '/api/health',
          responseTime: 150,
          statusCode: 200
        })
      },
      {
        kind: 'db',
        name: 'PostgreSQL',
        status: 'OK',
        value: 45,
        unit: 'ms',
        details: JSON.stringify({
          connectionCount: 12,
          cacheHitRatio: 95.2,
          slowQueryCount: 2
        })
      },
      {
        kind: 'queue',
        name: 'Queue: email',
        status: 'WARN',
        value: 25,
        unit: 'jobs',
        details: JSON.stringify({
          waiting: 25,
          active: 3,
          completed: 1500,
          failed: 1
        })
      },
      {
        kind: 'queue',
        name: 'Queue: labels',
        status: 'OK',
        value: 5,
        unit: 'jobs',
        details: JSON.stringify({
          waiting: 5,
          active: 1,
          completed: 800,
          failed: 0
        })
      },
      {
        kind: 'storage',
        name: 'File System',
        status: 'OK',
        details: JSON.stringify({
          available: true,
          diskUsage: '45%'
        })
      }
    ];

    for (const check of systemChecks) {
      await (prisma as any).systemCheck.upsert({
        where: {
          kind_name: {
            kind: check.kind,
            name: check.name
          }
        },
        update: {
          status: check.status,
          value: check.value,
          unit: check.unit,
          details: check.details,
          updatedAt: new Date()
        },
        create: {
          kind: check.kind,
          name: check.name,
          status: check.status,
          value: check.value,
          unit: check.unit,
          details: check.details
        }
      });
    }

    // Create sample feature flags
    const featureFlags = [
      {
        key: 'enable_ai_insights',
        enabled: true,
        notes: 'Enable AI-powered insights for inventory management'
      },
      {
        key: 'beta_marketplace_search',
        enabled: false,
        notes: 'Beta version of enhanced marketplace search'
      },
      {
        key: 'advanced_analytics',
        enabled: true,
        notes: 'Enable advanced analytics dashboard for vendors'
      },
      {
        key: 'mobile_app_notifications',
        enabled: false,
        notes: 'Push notifications for mobile app users'
      }
    ];

    for (const flag of featureFlags) {
      await (prisma as any).featureFlag.upsert({
        where: { key: flag.key },
        update: {
          enabled: flag.enabled,
          notes: flag.notes,
          updatedAt: new Date()
        },
        create: {
          key: flag.key,
          enabled: flag.enabled,
          notes: flag.notes
        }
      });
    }

    // Create sample incidents
    const incidents = [
      {
        title: 'High API latency detected',
        severity: 'SEV2',
        status: 'MITIGATED',
        affected: 'api,database',
        timeline: JSON.stringify([
          {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            action: 'created',
            user: 'system',
            message: 'High latency detected on /api/orders endpoint'
          },
          {
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            action: 'mitigated',
            user: 'admin@cravedartisan.com',
            message: 'Database connection pool optimized'
          }
        ])
      },
      {
        title: 'Email queue backlog',
        severity: 'SEV3',
        status: 'OPEN',
        affected: 'email,notifications',
        timeline: JSON.stringify([
          {
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            action: 'created',
            user: 'system',
            message: 'Email queue has 100+ pending messages'
          }
        ])
      }
    ];

    for (const incident of incidents) {
      await (prisma as any).incident.create({
        data: {
          ...incident,
          startedAt: faker.date.recent({ days: 2 }),
          endedAt: incident.status === 'MITIGATED' ? faker.date.recent({ days: 1 }) : null
        }
      });
    }

    console.log('✅ Admin data seeded successfully!');
    console.log(`   - ${sampleMessages.length} system messages`);
    console.log(`   - ${systemChecks.length} system checks`);
    console.log(`   - ${featureFlags.length} feature flags`);
    console.log(`   - ${incidents.length} incidents`);

  } catch (error) {
    console.error('❌ Error seeding admin data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedAdminData()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default seedAdminData;
