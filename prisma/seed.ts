import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ZIP Analytics seed...');

  // Define ZIP codes for testing
  const zipCodes = ['30248', '30223', '30236', '30281', '30274'];
  
  // Create or get existing vendor
  let vendor = await prisma.vendorProfile.findFirst();
  if (!vendor) {
    // Create a test user first
    const testUser = await prisma.user.create({
      data: {
        email: 'vendor@test.com',
        password: 'hashedpassword',
        name: 'Test Vendor'
      }
    });

    vendor = await prisma.vendorProfile.create({
      data: {
        user_id: testUser.id,
        business_name: 'Test Artisan Bakery',
        description: 'Premium artisan bakery specializing in fresh bread and pastries',
        category: 'Bakery'
      }
    });
  }

  // Create products for the vendor
  const products = [];
  const productNames = [
    'Sourdough Bread', 'Croissants', 'Blueberry Muffins', 'Chocolate Chip Cookies',
    'Artisan Pizza', 'Cinnamon Rolls', 'Bagels', 'Danish Pastries'
  ];

  for (const name of productNames) {
    const product = await prisma.product.create({
      data: {
        vendor_id: vendor.id,
        name,
        description: `Fresh ${name.toLowerCase()} made daily`,
        price: faker.number.float({ min: 3.99, max: 24.99, fractionDigits: 2 }),
        category: name.includes('Bread') || name.includes('Bagels') ? 'Bread' : 'Pastries',
        stock_quantity: faker.number.int({ min: 10, max: 100 })
      }
    });
    products.push(product);
  }

  // Create users distributed across ZIP codes
  const users = [];
  for (let i = 0; i < 100; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: 'hashedpassword',
        name: faker.person.fullName(),
        zip_code: faker.helpers.arrayElement(zipCodes),
        loyalty_member: faker.datatype.boolean({ probability: 0.3 }) // 30% loyalty members
      }
    });
    users.push(user);
  }

  // Create orders spread over 60 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 60);
  
  for (let i = 0; i < 300; i++) {
    // Random date within the last 60 days
    const orderDate = new Date(startDate.getTime() + Math.random() * (60 * 24 * 60 * 60 * 1000));
    
    const user = faker.helpers.arrayElement(users);
    const numItems = faker.number.int({ min: 1, max: 4 });
    
    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];
    
    for (let j = 0; j < numItems; j++) {
      const product = faker.helpers.arrayElement(products);
      const quantity = faker.number.int({ min: 1, max: 3 });
      const price = product.price;
      
      orderItems.push({
        product_id: product.id,
        quantity,
        price
      });
      
      totalAmount += Number(price) * quantity;
    }

    const order = await prisma.order.create({
      data: {
        user_id: user.id,
        vendor_id: vendor.id,
        total_amount: totalAmount,
        status: faker.helpers.arrayElement(['completed', 'delivered', 'completed', 'delivered']), // Mostly completed/delivered
        order_date: orderDate,
        created_at: orderDate
      }
    });

    // Create order items
    for (const item of orderItems) {
      await prisma.orderItem.create({
        data: {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        }
      });
    }
  }

  console.log('✅ ZIP Analytics seed completed!');
  console.log(`📊 Created:`);
  console.log(`   - 1 vendor (${vendor.business_name})`);
  console.log(`   - ${products.length} products`);
  console.log(`   - 100 users across ${zipCodes.length} ZIP codes`);
  console.log(`   - 300 orders over 60 days`);
  console.log(`   - ZIP codes: ${zipCodes.join(', ')}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });