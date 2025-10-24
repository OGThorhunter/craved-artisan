#!/usr/bin/env node

/**
 * Sentry MCP Configuration Helper
 * 
 * This script helps you find the correct Sentry organization and project names
 * for the MCP integration.
 */

const axios = require('axios');

async function findSentryConfig() {
  const token = process.env.SENTRY_AUTH_TOKEN;
  
  if (!token) {
    console.log('❌ SENTRY_AUTH_TOKEN environment variable is required');
    console.log('Set it in your .env file or export it:');
    console.log('export SENTRY_AUTH_TOKEN=your_token_here');
    return;
  }

  try {
    console.log('🔍 Finding your Sentry organizations...');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Get organizations
    const orgsResponse = await axios.get('https://sentry.io/api/0/organizations/', {
      headers
    });

    console.log('\n📋 Your Sentry Organizations:');
    orgsResponse.data.forEach((org, index) => {
      console.log(`${index + 1}. ${org.name} (${org.slug})`);
    });

    if (orgsResponse.data.length > 0) {
      const firstOrg = orgsResponse.data[0];
      console.log(`\n🔍 Getting projects for organization: ${firstOrg.name}`);
      
      // Get projects for the first organization
      const projectsResponse = await axios.get(`https://sentry.io/api/0/organizations/${firstOrg.slug}/projects/`, {
        headers
      });

      console.log('\n📋 Projects in this organization:');
      projectsResponse.data.forEach((project, index) => {
        console.log(`${index + 1}. ${project.name} (${project.slug})`);
      });

      console.log('\n✅ Configuration for your scripts:');
      console.log(`SENTRY_ORG="${firstOrg.slug}"`);
      console.log(`SENTRY_PROJECT="${projectsResponse.data[0]?.slug || 'your-project-slug'}"`);
      
      console.log('\n📝 Update your scripts with these values:');
      console.log('1. Update scripts/sentry-mcp-integration.js');
      console.log('2. Update scripts/fetch-sentry-logs.js');
      console.log('3. Update scripts/fetch-sentry-logs.ps1');
    }

  } catch (error) {
    console.error('❌ Error fetching Sentry data:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

if (require.main === module) {
  findSentryConfig().catch(console.error);
}

module.exports = { findSentryConfig };
