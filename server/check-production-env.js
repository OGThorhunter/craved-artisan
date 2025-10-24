/**
 * Production environment variables checker
 * This helps verify production database configuration
 */

require('dotenv').config();

function checkProductionEnvironment() {
  console.log('🔍 Production Environment Check:');
  console.log('================================');
  
  // Check critical environment variables
  const criticalVars = [
    'DATABASE_URL',
    'NODE_ENV',
    'SESSION_SECRET',
    'SENTRY_DSN'
  ];
  
  console.log('🔍 Critical Environment Variables:');
  criticalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${varName.includes('SECRET') || varName.includes('URL') ? '***SET***' : value}`);
    } else {
      console.error(`❌ ${varName}: NOT SET`);
    }
  });
  
  // Check database URL format
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      console.log('\n🔍 Database Configuration:');
      console.log(`   Host: ${url.hostname}`);
      console.log(`   Port: ${url.port}`);
      console.log(`   Database: ${url.pathname.slice(1)}`);
      console.log(`   Username: ${url.username ? '***SET***' : 'NOT SET'}`);
      console.log(`   Password: ${url.password ? '***SET***' : 'NOT SET'}`);
      console.log(`   SSL Mode: ${url.searchParams.get('sslmode')}`);
      
      // Check if it's a Neon database
      if (url.hostname.includes('neon.tech')) {
        console.log('✅ Detected Neon database');
      } else {
        console.log('⚠️  Not a Neon database URL');
      }
      
    } catch (error) {
      console.error('❌ Invalid DATABASE_URL format:', error.message);
    }
  }
  
  // Check optional variables
  console.log('\n🔍 Optional Environment Variables:');
  const optionalVars = ['REDIS_URL', 'STRIPE_SECRET_KEY', 'DIRECT_URL'];
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`   ${varName}: ${value ? '***SET***' : 'NOT SET'}`);
  });
  
  // Production recommendations
  console.log('\n🔧 Production Recommendations:');
  if (!process.env.DATABASE_URL) {
    console.log('❌ CRITICAL: DATABASE_URL must be set in production');
  }
  if (!process.env.SESSION_SECRET) {
    console.log('❌ CRITICAL: SESSION_SECRET must be set in production');
  }
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚠️  NODE_ENV should be "production" in production deployment');
  }
  if (!process.env.SENTRY_DSN) {
    console.log('⚠️  SENTRY_DSN should be set for error tracking');
  }
}

checkProductionEnvironment();
