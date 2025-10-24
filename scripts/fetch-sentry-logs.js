#!/usr/bin/env node

/**
 * Sentry Log Fetcher for Craved Artisan
 * 
 * This script automatically fetches recent Sentry issues and displays them
 * in a developer-friendly format.
 * 
 * Usage:
 *   node scripts/fetch-sentry-logs.js
 *   node scripts/fetch-sentry-logs.js --limit 5
 *   node scripts/fetch-sentry-logs.js --issue <issue-id>
 */

const axios = require('axios');
const chalk = require('chalk');

// Configuration
const SENTRY_ORG = 'your-sentry-org'; // Replace with your Sentry org
const SENTRY_PROJECT = 'craved-artisan-backend'; // Replace with your project
const SENTRY_TOKEN = process.env.SENTRY_AUTH_TOKEN; // Set this in your .env

const SENTRY_API_BASE = 'https://sentry.io/api/0';

class SentryLogFetcher {
  constructor() {
    this.headers = {
      'Authorization': `Bearer ${SENTRY_TOKEN}`,
      'Content-Type': 'application/json'
    };
  }

  async fetchRecentIssues(limit = 10) {
    try {
      console.log(chalk.blue('🔍 Fetching recent Sentry issues...'));
      
      const response = await axios.get(
        `${SENTRY_API_BASE}/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/`,
        {
          headers: this.headers,
          params: {
            limit,
            sort: '-lastSeen'
          }
        }
      );

      console.log(chalk.green(`✅ Found ${response.data.length} recent issues:`));
      console.log('');

      response.data.forEach((issue, index) => {
        console.log(chalk.yellow(`${index + 1}. ${issue.title}`));
        console.log(chalk.gray(`   ID: ${issue.id}`));
        console.log(chalk.gray(`   Count: ${issue.count}`));
        console.log(chalk.gray(`   Last Seen: ${new Date(issue.lastSeen).toLocaleString()}`));
        console.log(chalk.gray(`   Level: ${issue.level}`));
        console.log(chalk.gray(`   Status: ${issue.status}`));
        console.log('');
      });

      return response.data;
    } catch (error) {
      console.error(chalk.red('❌ Error fetching issues:'), error.message);
      if (error.response) {
        console.error(chalk.red('Response:'), error.response.data);
      }
      return [];
    }
  }

  async fetchIssueDetails(issueId) {
    try {
      console.log(chalk.blue(`🔍 Fetching details for issue ${issueId}...`));
      
      const response = await axios.get(
        `${SENTRY_API_BASE}/issues/${issueId}/`,
        {
          headers: this.headers
        }
      );

      const issue = response.data;
      
      console.log(chalk.green(`✅ Issue Details:`));
      console.log(chalk.yellow(`Title: ${issue.title}`));
      console.log(chalk.gray(`ID: ${issue.id}`));
      console.log(chalk.gray(`Count: ${issue.count}`));
      console.log(chalk.gray(`Level: ${issue.level}`));
      console.log(chalk.gray(`Status: ${issue.status}`));
      console.log(chalk.gray(`Last Seen: ${new Date(issue.lastSeen).toLocaleString()}`));
      console.log(chalk.gray(`First Seen: ${new Date(issue.firstSeen).toLocaleString()}`));
      
      if (issue.culprit) {
        console.log(chalk.gray(`Culprit: ${issue.culprit}`));
      }
      
      console.log('');
      console.log(chalk.blue('Stack Trace:'));
      if (issue.metadata && issue.metadata.filename) {
        console.log(chalk.gray(`File: ${issue.metadata.filename}`));
        console.log(chalk.gray(`Function: ${issue.metadata.function || 'N/A'}`));
      }
      
      return issue;
    } catch (error) {
      console.error(chalk.red('❌ Error fetching issue details:'), error.message);
      return null;
    }
  }

  async fetchIssueEvents(issueId, limit = 5) {
    try {
      console.log(chalk.blue(`🔍 Fetching recent events for issue ${issueId}...`));
      
      const response = await axios.get(
        `${SENTry_API_BASE}/issues/${issueId}/events/`,
        {
          headers: this.headers,
          params: { limit }
        }
      );

      console.log(chalk.green(`✅ Found ${response.data.length} recent events:`));
      console.log('');

      response.data.forEach((event, index) => {
        console.log(chalk.yellow(`Event ${index + 1}:`));
        console.log(chalk.gray(`  ID: ${event.id}`));
        console.log(chalk.gray(`  Date: ${new Date(event.dateCreated).toLocaleString()}`));
        console.log(chalk.gray(`  User: ${event.user?.email || 'N/A'}`));
        console.log(chalk.gray(`  IP: ${event.context?.ip || 'N/A'}`));
        
        if (event.tags) {
          console.log(chalk.gray(`  Tags:`));
          Object.entries(event.tags).forEach(([key, value]) => {
            console.log(chalk.gray(`    ${key}: ${value}`));
          });
        }
        
        console.log('');
      });

      return response.data;
    } catch (error) {
      console.error(chalk.red('❌ Error fetching events:'), error.message);
      return [];
    }
  }

  async fetchSignupErrors() {
    try {
      console.log(chalk.blue('🔍 Fetching signup-related errors...'));
      
      const response = await axios.get(
        `${SENTRY_API_BASE}/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/`,
        {
          headers: this.headers,
          params: {
            query: 'endpoint:signup',
            limit: 20,
            sort: '-lastSeen'
          }
        }
      );

      console.log(chalk.green(`✅ Found ${response.data.length} signup-related issues:`));
      console.log('');

      response.data.forEach((issue, index) => {
        console.log(chalk.yellow(`${index + 1}. ${issue.title}`));
        console.log(chalk.gray(`   ID: ${issue.id}`));
        console.log(chalk.gray(`   Count: ${issue.count}`));
        console.log(chalk.gray(`   Last Seen: ${new Date(issue.lastSeen).toLocaleString()}`));
        console.log('');
      });

      return response.data;
    } catch (error) {
      console.error(chalk.red('❌ Error fetching signup errors:'), error.message);
      return [];
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const fetcher = new SentryLogFetcher();

  if (!SENTRY_TOKEN) {
    console.error(chalk.red('❌ SENTRY_AUTH_TOKEN environment variable is required'));
    console.log(chalk.gray('Set it in your .env file or export it:'));
    console.log(chalk.gray('export SENTRY_AUTH_TOKEN=your_token_here'));
    process.exit(1);
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(chalk.blue('Sentry Log Fetcher for Craved Artisan'));
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/fetch-sentry-logs.js                    # Fetch recent issues');
    console.log('  node scripts/fetch-sentry-logs.js --limit 5         # Fetch 5 recent issues');
    console.log('  node scripts/fetch-sentry-logs.js --issue <id>      # Fetch specific issue');
    console.log('  node scripts/fetch-sentry-logs.js --signup          # Fetch signup errors');
    console.log('');
    return;
  }

  if (args.includes('--signup')) {
    await fetcher.fetchSignupErrors();
    return;
  }

  const issueIndex = args.indexOf('--issue');
  if (issueIndex !== -1 && args[issueIndex + 1]) {
    const issueId = args[issueIndex + 1];
    await fetcher.fetchIssueDetails(issueId);
    await fetcher.fetchIssueEvents(issueId);
    return;
  }

  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : 10;
  
  await fetcher.fetchRecentIssues(limit);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SentryLogFetcher;
