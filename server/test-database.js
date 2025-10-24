/**
 * Simple database connection test script
 * Run this with: node test-database.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  console.log('🔍 Testing database connection...');
  
  // Check environment variables
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set');
    return;
  }
  
  console.log('✅ DATABASE_URL is set');
  
  // Parse the connection string
  try {
    const url = new URL(databaseUrl);
    console.log('🔍 Host:', url.hostname);
    console.log('🔍 Port:', url.port);
    console.log('🔍 Database:', url.pathname.slice(1));
    console.log('🔍 Username:', url.username ? '***SET***' : 'NOT SET');
    console.log('🔍 Password:', url.password ? '***SET***' : 'NOT SET');
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL format:', error.message);
    return;
  }
  
  // Test connection
  try {
    const prisma = new PrismaClient();
    
    console.log('🔍 Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Connection successful!');
    
    console.log('🔍 Testing simple query...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query successful:', result);
    
    console.log('🔍 Testing user table...');
    const userCount = await prisma.user.count();
    console.log('✅ User table accessible, count:', userCount);
    
    await prisma.$disconnect();
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('\n🔧 AUTHENTICATION ERROR:');
      console.error('   The database credentials are invalid.');
      console.error('   Please check your DATABASE_URL username and password.');
    } else if (error.message.includes('connection refused')) {
      console.error('\n🔧 CONNECTION ERROR:');
      console.error('   Cannot connect to the database server.');
      console.error('   Please check if the database server is running.');
    }
  }
}

testDatabase();
