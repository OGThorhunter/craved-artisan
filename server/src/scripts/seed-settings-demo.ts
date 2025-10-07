import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Settings & Account Hub demo data...');

  // Create demo users
  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@craved-artisan.com' },
    update: {},
    create: {
      email: 'owner@craved-artisan.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1-555-0123',
      password: await bcrypt.hash('password123', 12),
      name: 'Sarah Johnson',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    }
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@craved-artisan.com' },
    update: {},
    create: {
      email: 'admin@craved-artisan.com',
      firstName: 'Michael',
      lastName: 'Chen',
      phone: '+1-555-0124',
      password: await bcrypt.hash('password123', 12),
      name: 'Michael Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  });

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@craved-artisan.com' },
    update: {},
    create: {
      email: 'staff@craved-artisan.com',
      firstName: 'Emily',
      lastName: 'Rodriguez',
      phone: '+1-555-0125',
      password: await bcrypt.hash('password123', 12),
      name: 'Emily Rodriguez',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  });

  // Create demo account address
  const address = await prisma.address.create({
    data: {
      name: 'Headquarters',
      line1: '123 Artisan Way',
      line2: 'Suite 100',
      city: 'Portland',
      state: 'OR',
      postal: '97201',
      country: 'US'
    }
  });

  // Create demo account
  const account = await prisma.account.create({
    data: {
      name: 'Craved Artisan Bakery',
      slug: 'craved-artisan-demo',
      logoUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
      primaryEmail: 'hello@craved-artisan.com',
      primaryPhone: '+1-555-0123',
      taxId: '12-3456789',
      addressId: address.id,
      ownerId: ownerUser.id
    }
  });

  // Create account users
  await prisma.accountUser.createMany({
    data: [
      {
        accountId: account.id,
        userId: ownerUser.id,
        role: 'OWNER',
        status: 'ACTIVE',
        title: 'Founder & CEO',
        workEmail: 'sarah@craved-artisan.com',
        workPhone: '+1-555-0123'
      },
      {
        accountId: account.id,
        userId: adminUser.id,
        role: 'ADMIN',
        status: 'ACTIVE',
        title: 'Operations Manager',
        workEmail: 'michael@craved-artisan.com',
        workPhone: '+1-555-0124'
      },
      {
        accountId: account.id,
        userId: staffUser.id,
        role: 'STAFF',
        status: 'ACTIVE',
        title: 'Bakery Assistant',
        workEmail: 'emily@craved-artisan.com',
        workPhone: '+1-555-0125'
      }
    ]
  });

  // Create social links
  await prisma.socialLink.createMany({
    data: [
      {
        accountId: account.id,
        platform: 'WEBSITE',
        url: 'https://craved-artisan.com',
        handle: 'craved-artisan'
      },
      {
        accountId: account.id,
        platform: 'INSTAGRAM',
        url: 'https://instagram.com/cravedartisan',
        handle: 'cravedartisan'
      },
      {
        accountId: account.id,
        platform: 'FACEBOOK',
        url: 'https://facebook.com/cravedartisan',
        handle: 'cravedartisan'
      }
    ]
  });

  // Create documents
  await prisma.document.createMany({
    data: [
      {
        accountId: account.id,
        title: 'Employee Handbook',
        category: 'POLICY',
        storageKey: 'uploads/documents/employee-handbook.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024000,
        uploadedBy: ownerUser.id,
        signedAt: new Date('2024-01-15')
      },
      {
        accountId: account.id,
        title: 'Vendor Agreement',
        category: 'CONTRACT',
        storageKey: 'uploads/documents/vendor-agreement.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 512000,
        uploadedBy: ownerUser.id,
        signedAt: new Date('2024-01-10')
      }
    ]
  });

  // Create billing profile
  const billingProfile = await prisma.billingProfile.create({
    data: {
      accountId: account.id,
      stripeCustomerId: 'cus_demo123',
      currency: 'USD'
    }
  });

  // Create subscription
  await prisma.subscription.create({
    data: {
      accountId: account.id,
      stripeSubId: 'sub_demo123',
      status: 'ACTIVE',
      planName: 'Professional Plan',
      currentPeriodEnd: new Date('2024-12-31')
    }
  });

  // Create invoices
  await prisma.invoice.createMany({
    data: [
      {
        accountId: account.id,
        stripeInvoiceId: 'in_demo123',
        amountDueCents: 2999,
        amountPaidCents: 2999,
        status: 'PAID',
        hostedUrl: 'https://invoice.stripe.com/i/acct_demo123'
      },
      {
        accountId: account.id,
        stripeInvoiceId: 'in_demo124',
        amountDueCents: 2999,
        amountPaidCents: 0,
        status: 'OPEN',
        hostedUrl: 'https://invoice.stripe.com/i/acct_demo124'
      }
    ]
  });

  // Create audit logs
  const auditActions = [
    { action: 'ACCOUNT_CREATED', entityType: 'Account', entityId: account.id },
    { action: 'TEAM_INVITE', entityType: 'AccountUser', entityId: adminUser.id },
    { action: 'TEAM_INVITE', entityType: 'AccountUser', entityId: staffUser.id },
    { action: 'ROLE_CHANGE', entityType: 'AccountUser', entityId: adminUser.id },
    { action: 'ORG_UPDATE', entityType: 'Account', entityId: account.id },
    { action: 'SOCIAL_LINK_CREATE', entityType: 'SocialLink', entityId: 'social1' },
    { action: 'DOC_UPLOAD', entityType: 'Document', entityId: 'doc1' },
    { action: 'DOC_UPLOAD', entityType: 'Document', entityId: 'doc2' },
    { action: 'BILLING_UPDATE', entityType: 'BillingProfile', entityId: billingProfile.id },
    { action: 'SUBSCRIPTION_CREATED', entityType: 'Subscription', entityId: 'sub1' },
    { action: 'INVOICE_CREATED', entityType: 'Invoice', entityId: 'inv1' },
    { action: 'INVOICE_PAID', entityType: 'Invoice', entityId: 'inv1' }
  ];

  for (const audit of auditActions) {
    await prisma.auditLog.create({
      data: {
        accountId: account.id,
        actorUserId: ownerUser.id,
        action: audit.action,
        entityType: audit.entityType,
        entityId: audit.entityId,
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
  }

  console.log('✅ Settings & Account Hub demo data seeded successfully!');
  console.log('📧 Owner: owner@craved-artisan.com');
  console.log('📧 Admin: admin@craved-artisan.com');
  console.log('📧 Staff: staff@craved-artisan.com');
  console.log('🔑 Password for all users: password123');
  console.log(`🏢 Account slug: ${account.slug}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




