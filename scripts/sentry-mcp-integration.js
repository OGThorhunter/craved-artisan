#!/usr/bin/env node

/**
 * Sentry MCP Integration for Craved Artisan
 * 
 * This script provides MCP-compatible access to Sentry data
 * and can be used with the MCP tools we've set up.
 * 
 * Usage:
 *   node scripts/sentry-mcp-integration.js
 *   node scripts/sentry-mcp-integration.js --recent
 *   node scripts/sentry-mcp-integration.js --signup
 *   node scripts/sentry-mcp-integration.js --issue <id>
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const SENTRY_ORG = 'your-sentry-org'; // Replace with your Sentry org
const SENTRY_PROJECT = 'craved-artisan-backend'; // Replace with your project
const SENTRY_TOKEN = process.env.SENTRY_AUTH_TOKEN; // Set this in your .env

const SENTRY_API_BASE = 'https://sentry.io/api/0';

class SentryMCPIntegration {
  constructor() {
    this.headers = {
      'Authorization': `Bearer ${SENTRY_TOKEN}`,
      'Content-Type': 'application/json'
    };
  }

  async fetchRecentIssues(limit = 10) {
    try {
      console.log('🔍 Fetching recent Sentry issues...');
      
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

      const issues = response.data.map(issue => ({
        id: issue.id,
        title: issue.title,
        count: issue.count,
        level: issue.level,
        status: issue.status,
        lastSeen: issue.lastSeen,
        firstSeen: issue.firstSeen,
        culprit: issue.culprit,
        metadata: issue.metadata
      }));

      // Save to file for MCP access
      const outputPath = path.join(__dirname, '..', 'sentry-data', 'recent-issues.json');
      await this.saveToFile(outputPath, issues);

      console.log(`✅ Found ${issues.length} recent issues`);
      console.log(`📁 Saved to: ${outputPath}`);
      
      return issues;
    } catch (error) {
      console.error('❌ Error fetching issues:', error.message);
      return [];
    }
  }

  async fetchSignupErrors() {
    try {
      console.log('🔍 Fetching signup-related errors...');
      
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

      const issues = response.data.map(issue => ({
        id: issue.id,
        title: issue.title,
        count: issue.count,
        level: issue.level,
        status: issue.status,
        lastSeen: issue.lastSeen,
        firstSeen: issue.firstSeen,
        culprit: issue.culprit,
        metadata: issue.metadata
      }));

      // Save to file for MCP access
      const outputPath = path.join(__dirname, '..', 'sentry-data', 'signup-errors.json');
      await this.saveToFile(outputPath, issues);

      console.log(`✅ Found ${issues.length} signup-related issues`);
      console.log(`📁 Saved to: ${outputPath}`);
      
      return issues;
    } catch (error) {
      console.error('❌ Error fetching signup errors:', error.message);
      return [];
    }
  }

  async fetchIssueDetails(issueId) {
    try {
      console.log(`🔍 Fetching details for issue ${issueId}...`);
      
      const response = await axios.get(
        `${SENTRY_API_BASE}/issues/${issueId}/`,
        {
          headers: this.headers
        }
      );

      const issue = response.data;
      
      // Save to file for MCP access
      const outputPath = path.join(__dirname, '..', 'sentry-data', `issue-${issueId}.json`);
      await this.saveToFile(outputPath, issue);

      console.log(`✅ Issue details saved to: ${outputPath}`);
      
      return issue;
    } catch (error) {
      console.error('❌ Error fetching issue details:', error.message);
      return null;
    }
  }

  async fetchIssueEvents(issueId, limit = 5) {
    try {
      console.log(`🔍 Fetching recent events for issue ${issueId}...`);
      
      const response = await axios.get(
        `${SENTRY_API_BASE}/issues/${issueId}/events/`,
        {
          headers: this.headers,
          params: { limit }
        }
      );

      const events = response.data.map(event => ({
        id: event.id,
        dateCreated: event.dateCreated,
        user: event.user,
        context: event.context,
        tags: event.tags,
        message: event.message
      }));

      // Save to file for MCP access
      const outputPath = path.join(__dirname, '..', 'sentry-data', `issue-${issueId}-events.json`);
      await this.saveToFile(outputPath, events);

      console.log(`✅ Found ${events.length} recent events`);
      console.log(`📁 Saved to: ${outputPath}`);
      
      return events;
    } catch (error) {
      console.error('❌ Error fetching events:', error.message);
      return [];
    }
  }

  async saveToFile(filePath, data) {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Save data to file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('❌ Error saving to file:', error.message);
      return false;
    }
  }

  async createSentrySummary() {
    try {
      console.log('📊 Creating Sentry summary...');
      
      const recentIssues = await this.fetchRecentIssues(5);
      const signupErrors = await this.fetchSignupErrors();
      
      const summary = {
        timestamp: new Date().toISOString(),
        recentIssues: recentIssues.length,
        signupErrors: signupErrors.length,
        criticalIssues: recentIssues.filter(issue => issue.level === 'error').length,
        warningIssues: recentIssues.filter(issue => issue.level === 'warning').length,
        issues: recentIssues.map(issue => ({
          id: issue.id,
          title: issue.title,
          level: issue.level,
          count: issue.count,
          lastSeen: issue.lastSeen
        })),
        signupIssues: signupErrors.map(issue => ({
          id: issue.id,
          title: issue.title,
          level: issue.level,
          count: issue.count,
          lastSeen: issue.lastSeen
        }))
      };

      // Save summary to file for MCP access
      const outputPath = path.join(__dirname, '..', 'sentry-data', 'sentry-summary.json');
      await this.saveToFile(outputPath, summary);

      console.log(`✅ Sentry summary created`);
      console.log(`📁 Saved to: ${outputPath}`);
      
      return summary;
    } catch (error) {
      console.error('❌ Error creating summary:', error.message);
      return null;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const integration = new SentryMCPIntegration();

  if (!SENTRY_TOKEN) {
    console.error('❌ SENTRY_AUTH_TOKEN environment variable is required');
    console.log('Set it in your .env file or export it:');
    console.log('export SENTRY_AUTH_TOKEN=your_token_here');
    process.exit(1);
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log('Sentry MCP Integration for Craved Artisan');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/sentry-mcp-integration.js                    # Create summary');
    console.log('  node scripts/sentry-mcp-integration.js --recent           # Fetch recent issues');
    console.log('  node scripts/sentry-mcp-integration.js --signup          # Fetch signup errors');
    console.log('  node scripts/sentry-mcp-integration.js --issue <id>      # Fetch specific issue');
    console.log('  node scripts/sentry-mcp-integration.js --summary         # Create summary');
    console.log('');
    return;
  }

  if (args.includes('--recent')) {
    await integration.fetchRecentIssues();
    return;
  }

  if (args.includes('--signup')) {
    await integration.fetchSignupErrors();
    return;
  }

  if (args.includes('--summary')) {
    await integration.createSentrySummary();
    return;
  }

  const issueIndex = args.indexOf('--issue');
  if (issueIndex !== -1 && args[issueIndex + 1]) {
    const issueId = args[issueIndex + 1];
    await integration.fetchIssueDetails(issueId);
    await integration.fetchIssueEvents(issueId);
    return;
  }

  // Default: create summary
  await integration.createSentrySummary();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SentryMCPIntegration;
