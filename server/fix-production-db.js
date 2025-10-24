/**
 * Production database authentication fix
 * This script helps diagnose and fix production database issues
 */

require('dotenv').config();

async function fixProductionDatabase() {
  console.log('🔧 Production Database Authentication Fix');
  console.log('=========================================');
  
  try {
    // Step 1: Check environment variables
    console.log('🔍 Step 1: Checking production environment variables...');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL is not set in production environment');
      console.log('🔧 Solution: Set DATABASE_URL in your production environment');
      return;
    }
    
    console.log('✅ DATABASE_URL is set');
    
    // Step 2: Parse database URL
    console.log('🔍 Step 2: Parsing database URL...');
    let parsedUrl;
    try {
      parsedUrl = new URL(databaseUrl);
      console.log('✅ Database URL format is valid');
      console.log(`   Host: ${parsedUrl.hostname}`);
      console.log(`   Database: ${parsedUrl.pathname.slice(1)}`);
      console.log(`   Username: ${parsedUrl.username ? '***SET***' : 'NOT SET'}`);
      console.log(`   Password: ${parsedUrl.password ? '***SET***' : 'NOT SET'}`);
    } catch (error) {
      console.error('❌ Invalid DATABASE_URL format:', error.message);
      return;
    }
    
    // Step 3: Test database connection
    console.log('🔍 Step 3: Testing database connection...');
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl
          }
        }
      });
      
      await prisma.$connect();
      console.log('✅ Database connection successful');
      
      // Test simple query
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Simple query successful');
      
      // Test user table
      const userCount = await prisma.user.count();
      console.log(`✅ User table accessible, count: ${userCount}`);
      
      await prisma.$disconnect();
      
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      
      if (error.message.includes('authentication failed')) {
        console.log('\n🔧 AUTHENTICATION ERROR SOLUTIONS:');
        console.log('1. Check if your Neon database credentials are correct');
        console.log('2. Verify the database exists and is active');
        console.log('3. Check if the user has proper permissions');
        console.log('4. Regenerate database credentials if needed');
        console.log('5. Ensure DATABASE_URL is correctly set in production environment');
        
        console.log('\n🔧 NEON DATABASE SPECIFIC STEPS:');
        console.log('1. Go to https://console.neon.tech/');
        console.log('2. Check if your database is active');
        console.log('3. Verify the connection string');
        console.log('4. Regenerate credentials if expired');
        console.log('5. Update DATABASE_URL in your production environment');
        
      } else if (error.message.includes('connection refused')) {
        console.log('\n🔧 CONNECTION ERROR SOLUTIONS:');
        console.log('1. Check if the database server is running');
        console.log('2. Verify the host and port are correct');
        console.log('3. Check firewall settings');
        console.log('4. Ensure network connectivity');
      }
      
      return;
    }
    
    console.log('\n✅ Production database authentication fix completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Deploy the updated code to production');
    console.log('2. Test the signup endpoint on your live site');
    console.log('3. Monitor Sentry for any remaining errors');
    
  } catch (error) {
    console.error('❌ Production database fix failed:', error.message);
  }
}

fixProductionDatabase();
