import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Helper function to generate random dates
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to generate random status
const randomStatus = (statuses: string[]) => {
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Helper function to generate random priority
const randomPriority = () => {
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'RUSH'];
  return priorities[Math.floor(Math.random() * priorities.length)];
};

async function seedVendorDashboard() {
  console.log('🌱 Seeding vendor dashboard with dummy data...');

  try {
    // Create a test user first
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@artisanbakery.com' }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          id: 'test-user-id',
          email: 'test@artisanbakery.com',
          password: 'hashed-password-for-testing',
          name: 'Test Vendor',
          firstName: 'Test',
          lastName: 'Vendor',
          phone: '+1-555-0123',
          zip_code: '12345',
          loyalty_member: false
        }
      });
      console.log('✅ Created test user:', testUser.email);
    }

    // Find or create a vendor profile
    let vendorProfile = await prisma.vendorProfile.findFirst({
      where: { storeName: { contains: 'Test' } }
    });

    if (!vendorProfile) {
      vendorProfile = await prisma.vendorProfile.create({
        data: {
          userId: testUser.id,
          storeName: 'Test Artisan Bakery',
          bio: 'A test bakery for demonstrating the vendor dashboard',
          slug: 'test-artisan-bakery',
          imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
          tags: JSON.stringify(['bakery', 'artisan', 'test']),
          minMarginPercent: 30.0,
          marginOverrideEnabled: true
        }
      });
      console.log('✅ Created vendor profile:', vendorProfile.storeName);
    }

    // Create categories
    const categories = [
      { name: 'Bread' },
      { name: 'Pastries' },
      { name: 'Cakes' },
      { name: 'Cookies' },
      { name: 'Seasonal' }
    ];

    const createdCategories = [];
    for (const category of categories) {
      const existing = await prisma.category.findFirst({
        where: { name: category.name, vendorProfileId: vendorProfile.id }
      });
      
      if (!existing) {
        const created = await prisma.category.create({
          data: {
            vendorProfileId: vendorProfile.id,
            name: category.name
          }
        });
        createdCategories.push(created);
      } else {
        createdCategories.push(existing);
      }
    }
    console.log('✅ Created categories:', createdCategories.length);

    // Create products
    const products = [
      { name: 'Sourdough Bread', category: 'Bread', price: 8.50, baseCost: 3.20 },
      { name: 'Croissant', category: 'Pastries', price: 4.25, baseCost: 1.80 },
      { name: 'Chocolate Chip Cookie', category: 'Cookies', price: 2.50, baseCost: 0.95 },
      { name: 'Birthday Cake', category: 'Cakes', price: 45.00, baseCost: 18.00 },
      { name: 'Pumpkin Spice Muffin', category: 'Seasonal', price: 3.75, baseCost: 1.50 },
      { name: 'Baguette', category: 'Bread', price: 6.00, baseCost: 2.40 },
      { name: 'Danish Pastry', category: 'Pastries', price: 5.50, baseCost: 2.20 },
      { name: 'Sugar Cookie', category: 'Cookies', price: 2.00, baseCost: 0.75 },
      { name: 'Wedding Cake', category: 'Cakes', price: 120.00, baseCost: 48.00 },
      { name: 'Apple Cider Donut', category: 'Seasonal', price: 3.25, baseCost: 1.30 }
    ];

    const createdProducts = [];
    for (const product of products) {
      const category = createdCategories.find(c => c.name === product.category);
      if (category) {
        const existing = await prisma.product.findFirst({
          where: { name: product.name, vendorProfileId: vendorProfile.id }
        });
        
        if (!existing) {
          const created = await prisma.product.create({
            data: {
              vendorProfileId: vendorProfile.id,
              type: 'FOOD',
              name: product.name,
              slug: product.name.toLowerCase().replace(/\s+/g, '-'),
              description: `Delicious ${product.name.toLowerCase()} made with premium ingredients`,
              categoryId: category.id,
              price: product.price,
              baseCost: product.baseCost,
              active: true,
              sku: `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              allergenFlags: JSON.stringify(['gluten', 'dairy']),
              nutritionNotes: 'Contains gluten and dairy products'
            }
          });
          createdProducts.push(created);
        } else {
          createdProducts.push(existing);
        }
      }
    }
    console.log('✅ Created products:', createdProducts.length);

    // Create inventory items
    const inventoryItems = [
      { name: 'All-Purpose Flour', category: 'FOOD_GRADE', unit: 'lb', currentQty: 50, reorderPoint: 10, preferredQty: 100, avgCost: 0.85 },
      { name: 'Butter', category: 'FOOD_GRADE', unit: 'lb', currentQty: 25, reorderPoint: 5, preferredQty: 50, avgCost: 4.50 },
      { name: 'Sugar', category: 'FOOD_GRADE', unit: 'lb', currentQty: 30, reorderPoint: 8, preferredQty: 60, avgCost: 1.20 },
      { name: 'Eggs', category: 'FOOD_GRADE', unit: 'dozen', currentQty: 15, reorderPoint: 3, preferredQty: 30, avgCost: 3.25 },
      { name: 'Vanilla Extract', category: 'FOOD_GRADE', unit: 'oz', currentQty: 8, reorderPoint: 2, preferredQty: 16, avgCost: 12.00 },
      { name: 'Chocolate Chips', category: 'FOOD_GRADE', unit: 'lb', currentQty: 12, reorderPoint: 3, preferredQty: 24, avgCost: 6.75 },
      { name: 'Yeast', category: 'FOOD_GRADE', unit: 'oz', currentQty: 6, reorderPoint: 1, preferredQty: 12, avgCost: 8.50 },
      { name: 'Salt', category: 'FOOD_GRADE', unit: 'lb', currentQty: 20, reorderPoint: 5, preferredQty: 40, avgCost: 0.45 }
    ];

    const createdInventoryItems = [];
    for (const item of inventoryItems) {
      const existing = await prisma.inventoryItem.findFirst({
        where: { name: item.name, vendorProfileId: vendorProfile.id }
      });
      
      if (!existing) {
        const created = await prisma.inventoryItem.create({
          data: {
            vendorProfileId: vendorProfile.id,
            name: item.name,
            category: item.category,
            unit: item.unit,
            current_qty: item.currentQty,
            reorder_point: item.reorderPoint,
            preferred_qty: item.preferredQty,
            avg_cost: item.avgCost,
            last_cost: item.avgCost,
            supplier_name: faker.company.name(),
            location: faker.helpers.arrayElement(['Pantry A', 'Pantry B', 'Refrigerator', 'Freezer']),
            batch_number: `BATCH-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            expiry_date: randomDate(new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
            tags: JSON.stringify(['ingredient', 'baking'])
          }
        });
        createdInventoryItems.push(created);
      } else {
        createdInventoryItems.push(existing);
      }
    }
    console.log('✅ Created inventory items:', createdInventoryItems.length);

    // Create sales windows
    const salesWindows = [
      { name: 'Weekend Market', type: 'MARKET', status: 'OPEN' },
      { name: 'Online Orders', type: 'DELIVERY', status: 'OPEN' },
      { name: 'Wholesale', type: 'WHOLESALE', status: 'OPEN' },
      { name: 'Holiday Special', type: 'PARK_PICKUP', status: 'DRAFT' }
    ];

    const createdSalesWindows = [];
    for (const window of salesWindows) {
      const existing = await prisma.salesWindow.findFirst({
        where: { name: window.name, vendorId: vendorProfile.id }
      });
      
      if (!existing) {
        const created = await prisma.salesWindow.create({
          data: {
            vendorId: vendorProfile.id,
            type: window.type as any,
            name: window.name,
            description: `${window.name} sales window for ${vendorProfile.storeName}`,
            status: window.status as any,
            location_name: faker.location.streetAddress(),
            address_text: faker.location.streetAddress(),
            preorder_open_at: randomDate(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
            preorder_close_at: randomDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
            fulfill_start_at: randomDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)),
            fulfill_end_at: randomDate(new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)),
            capacity_total: faker.number.int({ min: 50, max: 200 }),
            slot_size_min: 15,
            slot_capacity: faker.number.int({ min: 5, max: 20 }),
            max_items_total: faker.number.int({ min: 100, max: 500 })
          }
        });
        createdSalesWindows.push(created);
      } else {
        createdSalesWindows.push(existing);
      }
    }
    console.log('✅ Created sales windows:', createdSalesWindows.length);

    // Create orders
    const orderStatuses = ['PENDING', 'PAID', 'CANCELLED', 'FAILED', 'REFUNDED'];
    const orderSources = ['online', 'pos', 'manual', 'wholesale', 'market'];
    const paymentStatuses = ['paid', 'pending', 'refunded', 'cod'];

    const createdOrders = [];
    for (let i = 0; i < 25; i++) {
      const orderNumber = `ORD-${Date.now()}-${(i + 1).toString().padStart(4, '0')}`;
      const status = randomStatus(orderStatuses);
      const priority = randomPriority();
      const source = randomStatus(orderSources);
      const paymentStatus = randomStatus(paymentStatuses);
      const salesWindow = faker.helpers.arrayElement(createdSalesWindows);
      
      const order = await prisma.order.create({
        data: {
          vendorProfileId: vendorProfile.id,
          userId: testUser.id,
          orderNumber,
          customerName: faker.person.fullName(),
          customerEmail: faker.internet.email(),
          phone: faker.phone.number(),
          status: status as any,
          priority: priority as any,
          source,
          salesWindowId: salesWindow.id,
          subtotal: faker.number.float({ min: 15, max: 150, fractionDigits: 2 }),
          tax: faker.number.float({ min: 1, max: 15, fractionDigits: 2 }),
          shipping: faker.number.float({ min: 0, max: 10, fractionDigits: 2 }),
          total: faker.number.float({ min: 20, max: 175, fractionDigits: 2 }),
          notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
          customFields: JSON.stringify({
            specialInstructions: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }),
            deliveryNotes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 })
          }),
          station: faker.helpers.arrayElement(['PREP', 'BAKE', 'PACK', 'DELIVER']),
          tags: JSON.stringify(faker.helpers.arrayElements(['rush', 'large', 'special', 'holiday'], { min: 0, max: 2 })),
          expectedAt: randomDate(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
          dueAt: randomDate(new Date(), new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
          paymentStatus,
          createdAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
          updatedAt: new Date()
        }
      });

      // Create order items
      const numItems = faker.number.int({ min: 1, max: 5 });
      const selectedProducts = faker.helpers.arrayElements(createdProducts, { min: 1, max: numItems });
      
      for (const product of selectedProducts) {
        const quantity = faker.number.int({ min: 1, max: 6 });
        const unitPrice = product.price;
        const subtotal = quantity * unitPrice;
        
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            vendorProfileId: vendorProfile.id,
            productName: product.name,
            quantity,
            qty: quantity,
            unitPrice,
            subtotal,
            total: subtotal,
            notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }),
            status: faker.helpers.arrayElement(['QUEUED', 'PREP', 'COOK', 'COOL', 'PACK', 'READY']) as any,
            madeQty: faker.number.int({ min: 0, max: quantity })
          }
        });
      }

      // Create timeline entries
      await prisma.orderTimeline.create({
        data: {
          orderId: order.id,
          type: 'created',
          data: JSON.stringify({
            status,
            priority,
            source,
            notes: 'Order created'
          }),
          createdAt: order.createdAt
        }
      });

      if (status !== 'PENDING') {
        await prisma.orderTimeline.create({
          data: {
            orderId: order.id,
            type: 'status',
            data: JSON.stringify({
              status,
              previousStatus: 'PENDING',
              notes: `Status updated to ${status}`
            }),
            createdAt: randomDate(order.createdAt, new Date())
          }
        });
      }

      createdOrders.push(order);
    }
    console.log('✅ Created orders:', createdOrders.length);

    // Create system messages
    const messageTypes = ['order_created', 'status_change', 'inventory_low', 'payment_received', 'delivery_scheduled'];
    const messageScopes = ['orders', 'inventory', 'payments', 'delivery'];

    for (let i = 0; i < 15; i++) {
      const type = randomStatus(messageTypes);
      const scope = randomStatus(messageScopes);
      const order = faker.helpers.arrayElement(createdOrders);
      
      await prisma.systemMessage.create({
        data: {
          vendorProfileId: vendorProfile.id,
          scope,
          type,
          title: faker.lorem.sentence({ min: 3, max: 8 }),
          body: faker.lorem.paragraph({ min: 1, max: 3 }),
          data: JSON.stringify({
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName
          }),
          readAt: faker.helpers.maybe(() => new Date(), { probability: 0.3 }),
          createdAt: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date())
        }
      });
    }
    console.log('✅ Created system messages: 15');

    // Create inventory movements
    for (const item of createdInventoryItems) {
      const numMovements = faker.number.int({ min: 3, max: 8 });
      
      for (let i = 0; i < numMovements; i++) {
        const movementType = faker.helpers.arrayElement(['RECEIVE', 'ADJUST', 'CONSUME', 'WASTE']);
        const quantity = faker.number.int({ min: 1, max: 20 });
        const unitCost = item.unitCost;
        
        await prisma.inventoryMovement.create({
          data: {
            inventoryItemId: item.id,
            vendorProfileId: vendorProfile.id,
            type: movementType as any,
            qty: quantity,
            unit_cost: unitCost,
            refType: faker.helpers.arrayElement(['ORDER', 'PRODUCTION', 'WINDOW', 'MANUAL']),
            refId: faker.helpers.maybe(() => `REF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`, { probability: 0.7 }),
            notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.4 }),
            createdAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
          }
        });
      }
    }
    console.log('✅ Created inventory movements');

    // Create custom field definitions
    const fieldDefinitions = [
      { key: 'allergen_note', label: 'Allergen Notes', type: 'text', required: false },
      { key: 'gift_message', label: 'Gift Message', type: 'text', required: false },
      { key: 'delivery_instructions', label: 'Delivery Instructions', type: 'text', required: false },
      { key: 'special_requests', label: 'Special Requests', type: 'text', required: false },
      { key: 'urgency_level', label: 'Urgency Level', type: 'select', required: false, options: ['Low', 'Medium', 'High', 'Rush'] }
    ];

    for (const field of fieldDefinitions) {
      const existing = await prisma.orderFieldDef.findFirst({
        where: { key: field.key, vendorProfileId: vendorProfile.id }
      });
      
      if (!existing) {
        await prisma.orderFieldDef.create({
          data: {
            vendorProfileId: vendorProfile.id,
            key: field.key,
            label: field.label,
            type: field.type as any,
            options: field.options ? JSON.stringify(field.options) : null,
            required: field.required,
            order: fieldDefinitions.indexOf(field) + 1
          }
        });
      }
    }
    console.log('✅ Created custom field definitions:', fieldDefinitions.length);

    console.log('🎉 Vendor dashboard seeded successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Vendor: ${vendorProfile.storeName}`);
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Inventory Items: ${createdInventoryItems.length}`);
    console.log(`   - Sales Windows: ${createdSalesWindows.length}`);
    console.log(`   - Orders: ${createdOrders.length}`);
    console.log(`   - System Messages: 15`);
    console.log(`   - Custom Fields: ${fieldDefinitions.length}`);

  } catch (error) {
    console.error('❌ Error seeding vendor dashboard:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedVendorDashboard()
  .then(() => {
    console.log('✅ Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
