import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedDemoUsers() {
  console.log('🌱 Seeding demo users...');

  try {
    // Hash passwords
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    const vendorPassword = await bcrypt.hash('vendor123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);
    const coordinatorPassword = await bcrypt.hash('coordinator123', 10);

    // Create Admin User
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@cravedartisan.com' },
      update: {},
      create: {
        email: 'admin@cravedartisan.com',
        password: adminPassword,
        name: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1-555-0001',
        zip_code: '10001',
        loyalty_member: false,
      }
    });

    // Create Vendor User
    const vendorUser = await prisma.user.upsert({
      where: { email: 'vendor@cravedartisan.com' },
      update: {},
      create: {
        email: 'vendor@cravedartisan.com',
        password: vendorPassword,
        name: 'Vendor User',
        firstName: 'Vendor',
        lastName: 'User',
        phone: '+1-555-0002',
        zip_code: '10002',
        loyalty_member: false,
      }
    });

    // Create Customer User
    const customerUser = await prisma.user.upsert({
      where: { email: 'customer@cravedartisan.com' },
      update: {},
      create: {
        email: 'customer@cravedartisan.com',
        password: customerPassword,
        name: 'Customer User',
        firstName: 'Customer',
        lastName: 'User',
        phone: '+1-555-0003',
        zip_code: '10003',
        loyalty_member: true,
      }
    });

    // Create Event Coordinator User
    const coordinatorUser = await prisma.user.upsert({
      where: { email: 'coordinator@cravedartisan.com' },
      update: {},
      create: {
        email: 'coordinator@cravedartisan.com',
        password: coordinatorPassword,
        name: 'Event Coordinator',
        firstName: 'Event',
        lastName: 'Coordinator',
        phone: '+1-555-0004',
        zip_code: '10004',
        loyalty_member: false,
      }
    });

    // Create Vendor Profile for vendor user
    const vendorProfile = await prisma.vendorProfile.upsert({
      where: { userId: vendorUser.id },
      update: {},
      create: {
        userId: vendorUser.id,
        storeName: 'Artisan Bakery',
        bio: 'Handcrafted breads and pastries made with love and traditional techniques.',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
        slug: 'artisan-bakery',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        baseLocation: 'New York, NY',
        shipsNational: true,
        ratingAvg: 4.8,
        ratingCount: 127,
        marketplaceTags: 'bakery,bread,pastries,artisan',
        minMarginPercent: 30.0,
        marginOverrideEnabled: true,
      }
    });

    // Create some sample products for the vendor
    const products = [
      {
        vendorProfileId: vendorProfile.id,
        name: 'Sourdough Bread',
        slug: 'sourdough-bread',
        description: 'Traditional sourdough bread with a crispy crust and tangy flavor.',
        price: 8.99,
        baseCost: 3.50,
        laborCost: 2.00,
        targetMarginLowPct: 30,
        targetMarginHighPct: 45,
        type: 'FOOD' as const,
        active: true,
        imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400',
        tags: '["bread", "sourdough", "traditional"]',
        allergenFlags: '["gluten", "wheat"]',
      },
      {
        vendorProfileId: vendorProfile.id,
        name: 'Chocolate Croissant',
        slug: 'chocolate-croissant',
        description: 'Buttery croissant filled with rich chocolate.',
        price: 4.99,
        baseCost: 1.80,
        laborCost: 1.20,
        targetMarginLowPct: 30,
        targetMarginHighPct: 45,
        type: 'FOOD' as const,
        active: true,
        imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
        tags: '["pastry", "chocolate", "croissant"]',
        allergenFlags: '["gluten", "wheat", "dairy", "eggs"]',
      },
      {
        vendorProfileId: vendorProfile.id,
        name: 'Artisan Coffee',
        slug: 'artisan-coffee',
        description: 'Premium roasted coffee beans from local farms.',
        price: 12.99,
        baseCost: 6.00,
        laborCost: 1.50,
        targetMarginLowPct: 30,
        targetMarginHighPct: 45,
        type: 'FOOD' as const,
        active: true,
        imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
        tags: '["coffee", "beans", "roasted"]',
        allergenFlags: '[]',
      }
    ];

    for (const product of products) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product
      });
    }

    // Create sample events for coordinator
    const events = [
      {
        coordinatorId: coordinatorUser.id,
        title: 'Spring Farmers Market',
        slug: 'spring-farmers-market',
        summary: 'Join us for our annual spring farmers market featuring local vendors and artisans.',
        description: 'A celebration of local agriculture and craftsmanship. Featuring fresh produce, handmade goods, and live music.',
        imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600',
        category: 'farmers_market',
        tags: 'farmers,market,spring,local',
        startAt: new Date('2024-04-15T09:00:00Z'),
        endAt: new Date('2024-04-15T17:00:00Z'),
        addressText: 'Central Park, New York, NY',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        timezone: 'America/New_York',
        status: 'PUBLISHED' as const,
        capacity: 500,
        minStallPrice: 50.00,
        socialLinks: JSON.stringify({
          instagram: '@springfarmersmarket',
          facebook: 'SpringFarmersMarketNY',
          website: 'https://springfarmersmarket.com'
        }),
      },
      {
        coordinatorId: coordinatorUser.id,
        title: 'Artisan Craft Fair',
        slug: 'artisan-craft-fair',
        summary: 'Showcase of local artisans and their handmade creations.',
        description: 'Discover unique handmade items from local craftspeople. Perfect for finding one-of-a-kind gifts.',
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
        category: 'craft_fair',
        tags: 'craft,artisan,handmade,local',
        startAt: new Date('2024-05-20T10:00:00Z'),
        endAt: new Date('2024-05-20T18:00:00Z'),
        addressText: 'Brooklyn Bridge Park, Brooklyn, NY',
        city: 'Brooklyn',
        state: 'NY',
        country: 'USA',
        timezone: 'America/New_York',
        status: 'PUBLISHED' as const,
        capacity: 300,
        minStallPrice: 75.00,
        socialLinks: JSON.stringify({
          instagram: '@artisancraftfair',
          facebook: 'ArtisanCraftFairNY',
          website: 'https://artisancraftfair.com'
        }),
      }
    ];

    for (const event of events) {
      await prisma.event.upsert({
        where: { slug: event.slug },
        update: {},
        create: event
      });
    }

    console.log('✅ Demo users seeded successfully!');
    console.log('📋 Login Credentials:');
    console.log('   Admin Dashboard:');
    console.log('     Email: admin@cravedartisan.com');
    console.log('     Password: admin123');
    console.log('   Vendor Dashboard:');
    console.log('     Email: vendor@cravedartisan.com');
    console.log('     Password: vendor123');
    console.log('   Customer Dashboard:');
    console.log('     Email: customer@cravedartisan.com');
    console.log('     Password: customer123');
    console.log('   Event Coordinator Dashboard:');
    console.log('     Email: coordinator@cravedartisan.com');
    console.log('     Password: coordinator123');

  } catch (error) {
    console.error('❌ Error seeding demo users:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedDemoUsers()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default seedDemoUsers;


