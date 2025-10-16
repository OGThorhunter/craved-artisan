import { PrismaClient, ConfigCategory } from '@prisma/client';

const prisma = new PrismaClient();

const defaultSettings = [
  // PLATFORM_IDENTITY
  {
    key: 'platform.name',
    value: 'Craved Artisan',
    category: ConfigCategory.PLATFORM_IDENTITY,
    description: 'Platform name',
    isPublic: true
  },
  {
    key: 'platform.tagline',
    value: 'Discover Handcrafted Artisan Products',
    category: ConfigCategory.PLATFORM_IDENTITY,
    description: 'Platform tagline',
    isPublic: true
  },
  {
    key: 'platform.contact_email',
    value: 'support@cravedartisan.com',
    category: ConfigCategory.PLATFORM_IDENTITY,
    description: 'Primary contact email',
    isPublic: true
  },
  {
    key: 'platform.timezone',
    value: 'America/New_York',
    category: ConfigCategory.PLATFORM_IDENTITY,
    description: 'Default timezone',
    isPublic: true
  },
  {
    key: 'platform.currency',
    value: 'USD',
    category: ConfigCategory.PLATFORM_IDENTITY,
    description: 'Default currency',
    isPublic: true
  },
  {
    key: 'platform.locale',
    value: 'en',
    category: ConfigCategory.PLATFORM_IDENTITY,
    description: 'Default locale',
    isPublic: true
  },
  {
    key: 'platform.environment',
    value: process.env.NODE_ENV || 'development',
    category: ConfigCategory.PLATFORM_IDENTITY,
    description: 'Current environment',
    isPublic: false
  },

  // AUTH_SECURITY
  {
    key: 'auth.session_expiration_minutes',
    value: 1440, // 24 hours
    category: ConfigCategory.AUTH_SECURITY,
    description: 'Session expiration in minutes',
    isPublic: false
  },
  {
    key: 'auth.mfa_enforce_admins',
    value: false,
    category: ConfigCategory.AUTH_SECURITY,
    description: 'Enforce MFA for admins',
    isPublic: false
  },
  {
    key: 'auth.mfa_enforce_vendors',
    value: false,
    category: ConfigCategory.AUTH_SECURITY,
    description: 'Enforce MFA for vendors',
    isPublic: false
  },
  {
    key: 'auth.mfa_enforce_customers',
    value: false,
    category: ConfigCategory.AUTH_SECURITY,
    description: 'Enforce MFA for customers',
    isPublic: false
  },
  {
    key: 'auth.password_min_length',
    value: 8,
    category: ConfigCategory.AUTH_SECURITY,
    description: 'Minimum password length',
    isPublic: true
  },
  {
    key: 'auth.password_expiry_days',
    value: 0, // 0 = never expires
    category: ConfigCategory.AUTH_SECURITY,
    description: 'Password expiry in days (0 = never)',
    isPublic: false
  },
  {
    key: 'auth.login_rate_limit',
    value: 5, // requests per minute
    category: ConfigCategory.AUTH_SECURITY,
    description: 'Login rate limit per minute',
    isPublic: false
  },
  {
    key: 'auth.account_lockout_threshold',
    value: 5,
    category: ConfigCategory.AUTH_SECURITY,
    description: 'Failed login attempts before lockout',
    isPublic: false
  },
  {
    key: 'auth.cors_origins',
    value: ['http://localhost:5173', 'http://localhost:3000'],
    category: ConfigCategory.AUTH_SECURITY,
    description: 'Allowed CORS origins',
    isPublic: false
  },

  // PAYMENTS_FEES
  {
    key: 'payments.platform_fee_percent',
    value: 2.0,
    category: ConfigCategory.PAYMENTS_FEES,
    description: 'Global platform fee percentage',
    isPublic: false
  },
  {
    key: 'payments.platform_fee_min_cents',
    value: 50, // $0.50
    category: ConfigCategory.PAYMENTS_FEES,
    description: 'Minimum platform fee in cents',
    isPublic: false
  },
  {
    key: 'payments.platform_fee_max_cents',
    value: 10000, // $100
    category: ConfigCategory.PAYMENTS_FEES,
    description: 'Maximum platform fee in cents',
    isPublic: false
  },
  {
    key: 'payments.fee_rounding',
    value: 'up', // up, down, nearest
    category: ConfigCategory.PAYMENTS_FEES,
    description: 'Fee rounding rule',
    isPublic: false
  },
  {
    key: 'payments.tax_jar_enabled',
    value: false,
    category: ConfigCategory.PAYMENTS_FEES,
    description: 'Enable TaxJar integration',
    isPublic: false
  },
  {
    key: 'payments.tax_inclusive',
    value: false,
    category: ConfigCategory.PAYMENTS_FEES,
    description: 'Tax inclusive pricing',
    isPublic: true
  },
  {
    key: 'payments.refund_platform_fee',
    value: true,
    category: ConfigCategory.PAYMENTS_FEES,
    description: 'Refund platform fee on refunds',
    isPublic: false
  },
  {
    key: 'payments.refund_processing_fee',
    value: false,
    category: ConfigCategory.PAYMENTS_FEES,
    description: 'Refund processing fee on refunds',
    isPublic: false
  },
  {
    key: 'payments.vacation_mode_max_days',
    value: 90,
    category: ConfigCategory.PAYMENTS_FEES,
    description: 'Maximum vacation mode duration in days',
    isPublic: false
  },

  // NOTIFICATIONS
  {
    key: 'notifications.email_sender',
    value: 'support@cravedartisan.com',
    category: ConfigCategory.NOTIFICATIONS,
    description: 'Default email sender address',
    isPublic: false
  },
  {
    key: 'notifications.email_sender_name',
    value: 'Craved Artisan',
    category: ConfigCategory.NOTIFICATIONS,
    description: 'Default email sender name',
    isPublic: false
  },
  {
    key: 'notifications.daily_digest_enabled',
    value: true,
    category: ConfigCategory.NOTIFICATIONS,
    description: 'Enable daily digest emails',
    isPublic: false
  },
  {
    key: 'notifications.error_alert_recipients',
    value: ['ops@cravedartisan.com', 'dev@cravedartisan.com'],
    category: ConfigCategory.NOTIFICATIONS,
    description: 'Error alert recipient emails',
    isPublic: false
  },
  {
    key: 'notifications.default_preferences',
    value: {
      customer: { email: true, push: false, sms: false },
      vendor: { email: true, push: true, sms: false },
      admin: { email: true, push: true, sms: true }
    },
    category: ConfigCategory.NOTIFICATIONS,
    description: 'Default notification preferences by role',
    isPublic: false
  },

  // AI_FEATURES
  {
    key: 'ai.master_enabled',
    value: true,
    category: ConfigCategory.AI_FEATURES,
    description: 'Master AI enable/disable',
    isPublic: false
  },
  {
    key: 'ai.inventory_wizard_enabled',
    value: true,
    category: ConfigCategory.AI_FEATURES,
    description: 'AI Inventory Wizard enabled',
    isPublic: false
  },
  {
    key: 'ai.label_generator_enabled',
    value: true,
    category: ConfigCategory.AI_FEATURES,
    description: 'AI Label Generator enabled',
    isPublic: false
  },
  {
    key: 'ai.support_sage_enabled',
    value: true,
    category: ConfigCategory.AI_FEATURES,
    description: 'AI Support Sage enabled',
    isPublic: false
  },
  {
    key: 'ai.recipe_import_enabled',
    value: true,
    category: ConfigCategory.AI_FEATURES,
    description: 'AI Recipe Import/Scaling enabled',
    isPublic: false
  },
  {
    key: 'ai.rate_limit_calls_per_minute',
    value: 10,
    category: ConfigCategory.AI_FEATURES,
    description: 'AI API rate limit per user per minute',
    isPublic: false
  },

  // INTEGRATIONS
  {
    key: 'integration.stripe_enabled',
    value: true,
    category: ConfigCategory.INTEGRATIONS,
    description: 'Stripe integration enabled',
    isPublic: false
  },
  {
    key: 'integration.sendgrid_enabled',
    value: !!process.env.SENDGRID_API_KEY,
    category: ConfigCategory.INTEGRATIONS,
    description: 'SendGrid integration enabled',
    isPublic: false
  },
  {
    key: 'integration.twilio_enabled',
    value: !!process.env.TWILIO_SID,
    category: ConfigCategory.INTEGRATIONS,
    description: 'Twilio integration enabled',
    isPublic: false
  },
  {
    key: 'integration.s3_enabled',
    value: !!process.env.AWS_ACCESS_KEY_ID,
    category: ConfigCategory.INTEGRATIONS,
    description: 'S3 integration enabled',
    isPublic: false
  },

  // COMPLIANCE
  {
    key: 'compliance.data_retention_days',
    value: 2555, // 7 years
    category: ConfigCategory.COMPLIANCE,
    description: 'Data retention period in days',
    isPublic: false
  },
  {
    key: 'compliance.gdpr_enabled',
    value: true,
    category: ConfigCategory.COMPLIANCE,
    description: 'GDPR compliance enabled',
    isPublic: true
  },
  {
    key: 'compliance.ccpa_enabled',
    value: true,
    category: ConfigCategory.COMPLIANCE,
    description: 'CCPA compliance enabled',
    isPublic: true
  },

  // MAINTENANCE
  {
    key: 'maintenance.global_readonly',
    value: false,
    category: ConfigCategory.MAINTENANCE,
    description: 'Global read-only mode',
    isPublic: false
  },
  {
    key: 'maintenance.vendor_readonly',
    value: false,
    category: ConfigCategory.MAINTENANCE,
    description: 'Vendor read-only mode',
    isPublic: false
  },
  {
    key: 'maintenance.queue_drain',
    value: false,
    category: ConfigCategory.MAINTENANCE,
    description: 'Queue drain mode',
    isPublic: false
  }
];

async function seedSettings() {
  console.log('🌱 Seeding default settings...');

  for (const setting of defaultSettings) {
    try {
      await prisma.configSetting.upsert({
        where: { key: setting.key },
        update: {}, // Don't overwrite existing settings
        create: setting
      });
      console.log(`✓ ${setting.key}`);
    } catch (error) {
      console.error(`✗ Failed to seed ${setting.key}:`, error);
    }
  }

  console.log(`\n✅ Seeded ${defaultSettings.length} default settings`);
}

// Run if called directly
if (require.main === module) {
  seedSettings()
    .then(() => {
      console.log('✅ Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export { seedSettings };

