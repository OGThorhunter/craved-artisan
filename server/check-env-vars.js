/**
 * Check environment variables being used
 * Run this with: node check-env-vars.js
 */

require('dotenv').config();

console.log('🔍 Environment Variables Check:');
console.log('================================');

// Check if .env file is being loaded
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔍 DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('🔍 DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);

if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log('🔍 Database Host:', url.hostname);
    console.log('🔍 Database Port:', url.port);
    console.log('🔍 Database Name:', url.pathname.slice(1));
    console.log('🔍 Username:', url.username ? '***SET***' : 'NOT SET');
    console.log('🔍 Password:', url.password ? '***SET***' : 'NOT SET');
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL format:', error.message);
  }
} else {
  console.error('❌ DATABASE_URL is not set!');
}

console.log('🔍 DIRECT_URL exists:', !!process.env.DIRECT_URL);
console.log('🔍 BACKEND_URL:', process.env.BACKEND_URL);
console.log('🔍 REDIS_URL exists:', !!process.env.REDIS_URL);

// Check for any other database-related env vars
const dbVars = Object.keys(process.env).filter(key => 
  key.toLowerCase().includes('database') || 
  key.toLowerCase().includes('db') ||
  key.toLowerCase().includes('postgres')
);

if (dbVars.length > 0) {
  console.log('🔍 Other database-related environment variables:');
  dbVars.forEach(key => {
    console.log(`   ${key}: ${process.env[key] ? '***SET***' : 'NOT SET'}`);
  });
}
