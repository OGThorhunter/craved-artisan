import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Helper function to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper function to generate unique slug
async function generateUniqueSlug(title: string): Promise<string> {
  let slug = generateSlug(title);
  let counter = 1;
  while (await prisma.event.findUnique({ where: { slug } })) {
    slug = `${generateSlug(title)}-${counter}`;
    counter++;
  }
  return slug;
}

// Sample event data
const eventCategories = [
  'farmers_market',
  'craft_fair',
  'popup',
  'class',
  'festival',
  'workshop',
  'food_truck',
  'art_show',
  'music_event',
  'community_gathering'
];

const eventTags = [
  'local', 'organic', 'handmade', 'artisan', 'sustainable', 'family-friendly',
  'food', 'crafts', 'music', 'art', 'education', 'community', 'outdoor',
  'indoor', 'weekend', 'weekday', 'free', 'paid', 'all-ages', 'adults-only'
];

const cities = [
  { city: 'Atlanta', state: 'GA', country: 'USA' },
  { city: 'Macon', state: 'GA', country: 'USA' },
  { city: 'Savannah', state: 'GA', country: 'USA' },
  { city: 'Augusta', state: 'GA', country: 'USA' },
  { city: 'Columbus', state: 'GA', country: 'USA' },
  { city: 'Athens', state: 'GA', country: 'USA' },
  { city: 'Sandy Springs', state: 'GA', country: 'USA' },
  { city: 'Roswell', state: 'GA', country: 'USA' },
  { city: 'Albany', state: 'GA', country: 'USA' },
  { city: 'Johns Creek', state: 'GA', country: 'USA' }
];

const stallTypes = [
  { name: '10x10 Outdoor Booth', basePrice: 150, perks: ['power', 'shade'] },
  { name: '10x10 Indoor Booth', basePrice: 200, perks: ['power', 'air-conditioning'] },
  { name: 'Food Truck Space', basePrice: 300, perks: ['power', 'water', 'drainage'] },
  { name: 'Artist Corner', basePrice: 100, perks: ['display-wall'] },
  { name: 'Premium Location', basePrice: 250, perks: ['power', 'shade', 'high-traffic'] },
  { name: 'Community Table', basePrice: 75, perks: ['shared-space'] }
];

async function seedEvents() {
  console.log('🌱 Seeding Events data...');

  // Get or create a coordinator (vendor profile)
  let coordinator = await prisma.vendorProfile.findFirst({
    where: { storeName: { contains: 'Event' } }
  });

  if (!coordinator) {
    // Create a user first
    const user = await prisma.user.create({
      data: {
        name: 'Event Coordinator',
        email: 'coordinator@craved-artisan.com',
        role: 'vendor'
      }
    });

    coordinator = await prisma.vendorProfile.create({
      data: {
        userId: user.id,
        storeName: 'Event Coordination Services',
        slug: 'event-coordination-services',
        description: 'Professional event coordination for local markets and fairs',
        city: 'Atlanta',
        state: 'GA',
        country: 'USA',
        imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=400&auto=format&fit=crop'
      }
    });
  }

  // Create events
  const events = [];
  for (let i = 0; i < 25; i++) {
    const location = faker.helpers.arrayElement(cities);
    const category = faker.helpers.arrayElement(eventCategories);
    const tags = faker.helpers.arrayElements(eventTags, { min: 2, max: 6 });
    
    const startDate = faker.date.future({ years: 1 });
    const endDate = new Date(startDate.getTime() + faker.number.int({ min: 2, max: 8 }) * 60 * 60 * 1000);
    
    const title = faker.helpers.arrayElement([
      `${location.city} ${category.replace('_', ' ')}`,
      `Annual ${location.city} ${category.replace('_', ' ')}`,
      `${location.city} Community ${category.replace('_', ' ')}`,
      `Spring ${category.replace('_', ' ')} in ${location.city}`,
      `${location.city} ${category.replace('_', ' ')} Festival`,
      `Local ${category.replace('_', ' ')} at ${location.city}`,
      `${category.replace('_', ' ')} Showcase ${location.city}`,
      `${location.city} ${category.replace('_', ' ')} Market`
    ]);

    const slug = await generateUniqueSlug(title);
    
    const event = await prisma.event.create({
      data: {
        coordinatorId: coordinator.id,
        title,
        slug,
        summary: faker.lorem.sentence({ min: 10, max: 20 }),
        description: faker.lorem.paragraphs({ min: 2, max: 4 }),
        category,
        tags,
        startAt: startDate,
        endAt: endDate,
        addressText: `${faker.location.streetAddress()}, ${location.city}, ${location.state}`,
        city: location.city,
        state: location.state,
        country: location.country,
        timezone: 'America/New_York',
        imageUrl: faker.helpers.arrayElement([
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1464207687429-7505649dae38?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800&auto=format&fit=crop'
        ]),
        capacity: faker.number.int({ min: 50, max: 500 }),
        status: faker.helpers.arrayElement(['DRAFT', 'PUBLISHED', 'PUBLISHED', 'PUBLISHED']), // More published events
        socialLinks: {
          website: faker.internet.url(),
          instagram: `@${faker.lorem.word()}_events`,
          facebook: faker.internet.url()
        }
      }
    });

    events.push(event);
    console.log(`✅ Created event: ${title}`);
  }

  // Create stalls for each event
  for (const event of events) {
    const numStalls = faker.number.int({ min: 2, max: 6 });
    const selectedStalls = faker.helpers.arrayElements(stallTypes, { min: 2, max: numStalls });
    
    let minPrice = Infinity;
    
    for (let i = 0; i < selectedStalls.length; i++) {
      const stallType = selectedStalls[i];
      const price = stallType.basePrice + faker.number.int({ min: -25, max: 50 });
      const qtyTotal = faker.number.int({ min: 5, max: 20 });
      const qtySold = faker.number.int({ min: 0, max: Math.floor(qtyTotal * 0.8) });
      
      await prisma.eventStall.create({
        data: {
          eventId: event.id,
          name: stallType.name,
          price,
          qtyTotal,
          qtySold,
          perks: stallType.perks,
          notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
          sort: i
        }
      });
      
      minPrice = Math.min(minPrice, price);
    }
    
    // Update event with min stall price
    await prisma.event.update({
      where: { id: event.id },
      data: { minStallPrice: minPrice }
    });
  }

  // Create vendor applications for some events
  const vendors = await prisma.vendorProfile.findMany({ take: 15 });
  
  for (const event of events.slice(0, 15)) { // Only for first 15 events
    const numApplications = faker.number.int({ min: 2, max: 8 });
    const selectedVendors = faker.helpers.arrayElements(vendors, { min: 2, max: numApplications });
    
    for (const vendor of selectedVendors) {
      const stalls = await prisma.eventStall.findMany({
        where: { eventId: event.id }
      });
      
      const selectedStall = faker.helpers.maybe(() => faker.helpers.arrayElement(stalls), { probability: 0.7 });
      
      await prisma.eventVendor.create({
        data: {
          eventId: event.id,
          vendorId: vendor.id,
          stallId: selectedStall?.id,
          status: faker.helpers.arrayElement(['APPLIED', 'APPROVED', 'PAID', 'WAITLIST']),
          message: faker.helpers.maybe(() => faker.lorem.sentence({ min: 5, max: 15 }), { probability: 0.6 })
        }
      });
    }
  }

  // Create some user interests and favorites
  const users = await prisma.user.findMany({ take: 10 });
  
  for (const event of events.slice(0, 10)) {
    const numInterests = faker.number.int({ min: 5, max: 25 });
    const selectedUsers = faker.helpers.arrayElements(users, { min: 5, max: numInterests });
    
    for (const user of selectedUsers) {
      // Create interest
      await prisma.eventInterest.create({
        data: {
          eventId: event.id,
          userId: user.id,
          status: faker.helpers.arrayElement(['INTERESTED', 'GOING'])
        }
      });
      
      // Maybe create favorite
      if (faker.datatype.boolean({ probability: 0.3 })) {
        await prisma.eventFavorite.create({
          data: {
            eventId: event.id,
            userId: user.id
          }
        });
      }
    }
  }

  // Create some reviews
  for (const event of events.slice(0, 8)) {
    const numReviews = faker.number.int({ min: 3, max: 12 });
    const selectedUsers = faker.helpers.arrayElements(users, { min: 3, max: numReviews });
    
    for (const user of selectedUsers) {
      await prisma.eventReview.create({
        data: {
          eventId: event.id,
          userId: user.id,
          rating: faker.number.int({ min: 3, max: 5 }),
          body: faker.helpers.maybe(() => faker.lorem.sentences({ min: 1, max: 3 }), { probability: 0.8 })
        }
      });
    }
  }

  // Create some FAQs
  for (const event of events.slice(0, 10)) {
    const numFaqs = faker.number.int({ min: 2, max: 5 });
    
    for (let i = 0; i < numFaqs; i++) {
      await prisma.eventFaq.create({
        data: {
          eventId: event.id,
          q: faker.helpers.arrayElement([
            'What time does the event start?',
            'Is parking available?',
            'Are pets allowed?',
            'What should I bring?',
            'Is there food available?',
            'What happens if it rains?',
            'Are there restrooms on site?',
            'Is the event wheelchair accessible?'
          ]),
          a: faker.lorem.sentences({ min: 1, max: 2 }),
          order: i
        }
      });
    }
  }

  // Create some perks
  for (const event of events.slice(0, 8)) {
    const numPerks = faker.number.int({ min: 1, max: 4 });
    
    for (let i = 0; i < numPerks; i++) {
      await prisma.eventPerk.create({
        data: {
          eventId: event.id,
          title: faker.helpers.arrayElement([
            'Free Parking',
            'Live Music',
            'Food Trucks',
            'Kids Activities',
            'Free Samples',
            'Raffle Prizes',
            'Photo Booth',
            'Local Art Display'
          ]),
          details: faker.lorem.sentence(),
          code: faker.helpers.maybe(() => faker.string.alphanumeric(8).toUpperCase(), { probability: 0.4 }),
          kind: faker.helpers.arrayElement(['gift', 'coupon', 'raffle', 'badge'])
        }
      });
    }
  }

  console.log('🎉 Events seeding completed!');
  console.log(`📊 Created:`);
  console.log(`   - ${events.length} events`);
  console.log(`   - Multiple stalls per event`);
  console.log(`   - Vendor applications`);
  console.log(`   - User interests and favorites`);
  console.log(`   - Event reviews`);
  console.log(`   - FAQs and perks`);
}

async function main() {
  try {
    await seedEvents();
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
