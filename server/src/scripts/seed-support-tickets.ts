import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const prisma = new PrismaClient();

async function seedSupportTickets() {
  try {
    logger.info('🌱 Seeding support tickets...');
    
    // Find or create admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: 'ADMIN',
          },
        },
      },
    });
    
    let adminUser = adminUsers[0];
    
    // If no admin exists, find any user or create one
    if (!adminUser) {
      const anyUser = await prisma.user.findFirst();
      if (anyUser) {
        adminUser = anyUser;
        logger.warn('No admin found, using first user for seeding');
      } else {
        adminUser = await prisma.user.create({
          data: {
            email: 'admin@craved-artisan.com',
            password: 'hashed_password_placeholder',
            name: 'Admin User',
          },
        });
        logger.info('Created admin user for seeding');
      }
    }
    
    // Find customers for requester field
    const customers = await prisma.user.findMany({
      take: 5,
    });
    
    // Sample tickets data
    const ticketsData = [
      {
        subject: 'Payment not processing for order #12345',
        description: 'Customer reports that their credit card payment keeps failing. They\'ve tried 3 different cards.',
        status: 'OPEN',
        severity: 'HIGH',
        category: 'PAYMENT',
        source: 'DASHBOARD',
        requesterId: customers[0]?.id || adminUser.id,
      },
      {
        subject: 'Cannot login to vendor dashboard',
        description: 'Vendor is getting "Invalid credentials" error even after password reset.',
        status: 'PENDING',
        severity: 'NORMAL',
        category: 'ACCOUNT',
        source: 'EMAIL',
        requesterId: customers[1]?.id || adminUser.id,
        assignedToId: adminUser.id,
      },
      {
        subject: 'Order #54321 never arrived',
        description: 'Customer placed order 2 weeks ago and still hasn\'t received it. Tracking shows delivered but customer says they didn\'t get it.',
        status: 'ESCALATED',
        severity: 'CRITICAL',
        category: 'ORDER',
        source: 'CHAT',
        requesterId: customers[2]?.id || adminUser.id,
        assignedToId: adminUser.id,
      },
      {
        subject: 'Feature request: Dark mode',
        description: 'It would be great to have a dark mode option for the customer dashboard.',
        status: 'OPEN',
        severity: 'LOW',
        category: 'FEEDBACK',
        source: 'DASHBOARD',
        requesterId: customers[3]?.id || adminUser.id,
      },
      {
        subject: 'Product images not loading',
        description: 'Several product images are showing broken image icons on the marketplace.',
        status: 'OPEN',
        severity: 'HIGH',
        category: 'TECH',
        source: 'SYSTEM',
      },
      {
        subject: 'Refund request for cancelled event',
        description: 'Customer purchased tickets for an event that was cancelled. Requesting full refund.',
        status: 'AWAITING_VENDOR',
        severity: 'NORMAL',
        category: 'PAYMENT',
        source: 'EMAIL',
        requesterId: customers[4]?.id || adminUser.id,
      },
      {
        subject: 'Missing tax documents',
        description: 'Vendor needs to submit W-9 form for 1099 processing.',
        status: 'OPEN',
        severity: 'NORMAL',
        category: 'COMPLIANCE',
        source: 'SYSTEM',
      },
      {
        subject: 'Inventory tracking issue',
        description: 'Vendor reports that inventory counts are not updating correctly after sales.',
        status: 'PENDING',
        severity: 'HIGH',
        category: 'INVENTORY',
        source: 'DASHBOARD',
        assignedToId: adminUser.id,
      },
      {
        subject: 'Duplicate charge on customer account',
        description: 'Customer was charged twice for the same order. Need to investigate and refund.',
        status: 'OPEN',
        severity: 'CRITICAL',
        category: 'PAYMENT',
        source: 'EMAIL',
        requesterId: customers[0]?.id || adminUser.id,
      },
      {
        subject: 'Event listing not appearing in search',
        description: 'Event coordinator created a new event but it\'s not showing up in the events search page.',
        status: 'RESOLVED',
        severity: 'NORMAL',
        category: 'EVENT',
        source: 'DASHBOARD',
      },
    ];
    
    // Calculate SLA for each ticket
    const SLA_TIMES = {
      CRITICAL: 2 * 60, // 2 hours
      HIGH: 8 * 60, // 8 hours
      NORMAL: 24 * 60, // 24 hours
      LOW: 72 * 60, // 72 hours
    };
    
    // Create tickets
    for (const ticketData of ticketsData) {
      const slaDueAt = new Date();
      const slaMinutes = SLA_TIMES[ticketData.severity as keyof typeof SLA_TIMES] || SLA_TIMES.NORMAL;
      slaDueAt.setMinutes(slaDueAt.getMinutes() + slaMinutes);
      
      const ticket = await prisma.supportTicket.create({
        data: {
          ...ticketData,
          slaDueAt,
          tags: JSON.stringify([ticketData.category.toLowerCase()]),
          auditTrail: JSON.stringify([{
            action: 'CREATED',
            by: 'SYSTEM_SEED',
            timestamp: new Date().toISOString(),
          }]),
        },
      });
      
      // Add initial message to each ticket
      await prisma.supportMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: ticketData.requesterId || null,
          senderRole: 'CUSTOMER',
          body: ticketData.description,
          internal: false,
        },
      });
      
      // Add a response for some tickets
      if (ticket.status === 'PENDING' || ticket.status === 'AWAITING_VENDOR') {
        await prisma.supportMessage.create({
          data: {
            ticketId: ticket.id,
            senderId: adminUser.id,
            senderRole: 'ADMIN',
            body: 'Thank you for contacting us. We are looking into this issue and will get back to you shortly.',
            internal: false,
          },
        });
      }
      
      // Add internal note for escalated tickets
      if (ticket.status === 'ESCALATED') {
        await prisma.supportMessage.create({
          data: {
            ticketId: ticket.id,
            senderId: adminUser.id,
            senderRole: 'ADMIN',
            body: 'Escalated to senior support team. This requires immediate attention.',
            internal: true,
          },
        });
      }
      
      logger.info(`✅ Created ticket: ${ticket.subject}`);
    }
    
    logger.info(`🎉 Successfully seeded ${ticketsData.length} support tickets!`);
    
    // Log summary
    const stats = await prisma.supportTicket.groupBy({
      by: ['status'],
      _count: true,
    });
    
    logger.info('📊 Ticket status distribution:');
    stats.forEach(stat => {
      logger.info(`  - ${stat.status}: ${stat._count}`);
    });
    
  } catch (error) {
    logger.error('❌ Failed to seed support tickets:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedSupportTickets()
    .then(() => {
      logger.info('✅ Seed script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Seed script failed:', error);
      process.exit(1);
    });
}

export { seedSupportTickets };

