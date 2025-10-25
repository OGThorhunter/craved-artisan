import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function seedVendorSegments() {
  console.log('🌱 Seeding vendor segments...');

  try {
    // Create sample vendor segments
    const segments = [
      {
        name: 'High Performers',
        description: 'Vendors with high revenue and excellent ratings',
        criteria: JSON.stringify({
          rating: { min: 4.5 },
          revenue: { min: 10000 },
          orderCount: { min: 50 }
        })
      },
      {
        name: 'New Vendors',
        description: 'Recently joined vendors who need onboarding support',
        criteria: JSON.stringify({
          createdAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          isActive: true
        })
      },
      {
        name: 'Inactive Vendors',
        description: 'Vendors who haven\'t logged in recently',
        criteria: JSON.stringify({
          lastLoginDays: 30,
          isActive: false
        })
      },
      {
        name: 'Local California Vendors',
        description: 'Active vendors based in California',
        criteria: JSON.stringify({
          location: { state: 'California' },
          isActive: true,
          hasActiveProducts: true
        })
      },
      {
        name: 'Food & Beverage',
        description: 'Vendors in the food and beverage category',
        criteria: JSON.stringify({
          tags: ['food', 'beverage', 'restaurant', 'bakery', 'coffee'],
          isActive: true
        })
      },
      {
        name: 'Artisan Crafts',
        description: 'Handcrafted and artisanal product vendors',
        criteria: JSON.stringify({
          tags: ['handmade', 'artisan', 'craft', 'handcrafted'],
          isActive: true
        })
      },
      {
        name: 'High Volume',
        description: 'Vendors with high order volume',
        criteria: JSON.stringify({
          orderCount: { min: 100 },
          revenue: { min: 20000 }
        })
      },
      {
        name: 'Premium Vendors',
        description: 'Vendors with premium products and high ratings',
        criteria: JSON.stringify({
          rating: { min: 4.8 },
          tags: ['premium', 'luxury', 'gourmet'],
          isActive: true
        })
      }
    ];

    for (const segment of segments) {
      await (prisma as any).vendorSegment.upsert({
        where: { name: segment.name },
        update: {
          description: segment.description,
          criteria: segment.criteria,
          updatedAt: new Date()
        },
        create: {
          name: segment.name,
          description: segment.description,
          criteria: segment.criteria,
          vendorCount: 0, // Will be calculated when vendors are created
          isActive: true
        }
      });
    }

    console.log('✅ Vendor segments seeded successfully!');
    console.log(`   - ${segments.length} vendor segments created`);

  } catch (error) {
    console.error('❌ Error seeding vendor segments:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedVendorSegments()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default seedVendorSegments;

































