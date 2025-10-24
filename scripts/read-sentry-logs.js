#!/usr/bin/env node

/**
 * Simple Sentry Log Reader
 * 
 * This script reads the Sentry data we already have and shows you
 * the errors that are being captured.
 */

const fs = require('fs');
const path = require('path');

function readSentryData() {
  console.log('🔍 Reading Sentry data from your project...');
  console.log('');

  // Check if sentry-data directory exists
  const sentryDataDir = path.join(__dirname, '..', 'sentry-data');
  if (!fs.existsSync(sentryDataDir)) {
    console.log('❌ No sentry-data directory found');
    console.log('Run the MCP integration script first:');
    console.log('node scripts/sentry-mcp-integration.js --summary');
    return;
  }

  // Read summary file
  const summaryPath = path.join(sentryDataDir, 'sentry-summary.json');
  if (fs.existsSync(summaryPath)) {
    try {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      console.log('📊 Sentry Summary:');
      console.log(`   Timestamp: ${summary.timestamp}`);
      console.log(`   Recent Issues: ${summary.recentIssues}`);
      console.log(`   Signup Errors: ${summary.signupErrors}`);
      console.log(`   Critical Issues: ${summary.criticalIssues}`);
      console.log(`   Warning Issues: ${summary.warningIssues}`);
      console.log('');

      if (summary.issues && summary.issues.length > 0) {
        console.log('🚨 Recent Issues:');
        summary.issues.forEach((issue, index) => {
          console.log(`   ${index + 1}. ${issue.title}`);
          console.log(`      Level: ${issue.level}`);
          console.log(`      Count: ${issue.count}`);
          console.log(`      Last Seen: ${new Date(issue.lastSeen).toLocaleString()}`);
          console.log('');
        });
      }

      if (summary.signupIssues && summary.signupIssues.length > 0) {
        console.log('🔐 Signup Issues:');
        summary.signupIssues.forEach((issue, index) => {
          console.log(`   ${index + 1}. ${issue.title}`);
          console.log(`      Level: ${issue.level}`);
          console.log(`      Count: ${issue.count}`);
          console.log(`      Last Seen: ${new Date(issue.lastSeen).toLocaleString()}`);
          console.log('');
        });
      }

    } catch (error) {
      console.error('❌ Error reading summary:', error.message);
    }
  }

  // List all available files
  console.log('📁 Available Sentry data files:');
  const files = fs.readdirSync(sentryDataDir);
  files.forEach(file => {
    const filePath = path.join(sentryDataDir, file);
    const stats = fs.statSync(filePath);
    console.log(`   ${file} (${stats.size} bytes)`);
  });
}

function showCurrentErrors() {
  console.log('🔍 Current errors from your terminal logs:');
  console.log('');
  console.log('1. Port Conflict:');
  console.log('   Error: listen EADDRINUSE: address already in use :::3001');
  console.log('   Solution: Kill existing process on port 3001');
  console.log('');
  console.log('2. Redis Version Issue:');
  console.log('   Error: Redis version needs to be greater or equal than 5.0.0 Current: 3.0.504');
  console.log('   Solution: Update Redis or disable Redis features');
  console.log('');
  console.log('3. Database Connection:');
  console.log('   Error: Prisma Client connection failed');
  console.log('   Solution: Check DATABASE_URL in .env file');
  console.log('');
}

function main() {
  console.log('🚀 Sentry Log Reader for Craved Artisan');
  console.log('=====================================');
  console.log('');

  readSentryData();
  console.log('');
  showCurrentErrors();

  console.log('🎯 Next Steps:');
  console.log('1. Fix the port conflict: netstat -ano | findstr :3001');
  console.log('2. Restart your server: cd server && npm run dev');
  console.log('3. Test your signup flow');
  console.log('4. Check Sentry dashboard: https://sentry.io');
}

if (require.main === module) {
  main();
}

module.exports = { readSentryData, showCurrentErrors };
