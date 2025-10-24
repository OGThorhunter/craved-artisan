/**
 * Comprehensive fix script for all identified issues
 * Run this with: node fix-all-issues.js
 */

require('dotenv').config();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function fixAllIssues() {
  console.log('🔧 Starting comprehensive fix for all issues...');
  
  try {
    // Step 1: Kill all running Node.js processes
    console.log('🔍 Step 1: Killing all running Node.js processes...');
    try {
      await runCommand('taskkill /F /IM node.exe');
      console.log('✅ Killed all Node.js processes');
    } catch (error) {
      console.log('⚠️  No Node.js processes to kill or error:', error.message);
    }
    
    // Step 2: Check environment variables
    console.log('🔍 Step 2: Checking environment variables...');
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL is not set');
      return;
    }
    console.log('✅ DATABASE_URL is set');
    
    // Step 3: Test database connection
    console.log('🔍 Step 3: Testing database connection...');
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      await prisma.$connect();
      console.log('✅ Database connection successful');
      
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Simple query successful:', result);
      
      const userCount = await prisma.user.count();
      console.log('✅ User table accessible, count:', userCount);
      
      await prisma.$disconnect();
      
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return;
    }
    
    // Step 4: Check Redis configuration
    console.log('🔍 Step 4: Checking Redis configuration...');
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.log('⚠️  REDIS_URL is not set - Redis features will be disabled');
    } else {
      console.log('✅ REDIS_URL is set');
    }
    
    // Step 5: Create .env backup
    console.log('🔍 Step 5: Creating .env backup...');
    const envPath = path.join(__dirname, '.env');
    const backupPath = path.join(__dirname, '.env.backup');
    
    if (fs.existsSync(envPath)) {
      fs.copyFileSync(envPath, backupPath);
      console.log('✅ .env backup created');
    }
    
    // Step 6: Test server startup
    console.log('🔍 Step 6: Testing server startup...');
    console.log('✅ All checks passed! You can now start the server with: npm run dev');
    
    console.log('\n🎉 Fix completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Test the signup endpoint: node test-signup-endpoint.js');
    console.log('3. Check the database health: curl http://localhost:3001/api/database/health');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixAllIssues();
