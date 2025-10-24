/**
 * Test server health and endpoints
 * Run this with: node test-server-health.js
 */

require('dotenv').config();
const axios = require('axios');

async function testServerHealth() {
  console.log('🔍 Testing server health...');
  
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  // Test 1: Basic health check
  console.log('🔍 Test 1: Basic health check...');
  try {
    const response = await axios.get(`${baseUrl}/api/health`, {
      timeout: 5000
    });
    console.log('✅ Health check successful:', response.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('🔧 Server is not running. Start it with: npm run dev');
      return;
    }
  }
  
  // Test 2: Database health check
  console.log('🔍 Test 2: Database health check...');
  try {
    const response = await axios.get(`${baseUrl}/api/database/health`, {
      timeout: 5000
    });
    console.log('✅ Database health check successful:', response.data);
  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
    if (error.response) {
      console.error('🔍 Status:', error.response.status);
      console.error('🔍 Response:', error.response.data);
    }
  }
  
  // Test 3: Auth endpoint availability
  console.log('🔍 Test 3: Auth endpoint availability...');
  try {
    const response = await axios.get(`${baseUrl}/api/auth/status`, {
      timeout: 5000
    });
    console.log('✅ Auth endpoint accessible:', response.data);
  } catch (error) {
    console.error('❌ Auth endpoint failed:', error.message);
    if (error.response) {
      console.error('🔍 Status:', error.response.status);
      console.error('🔍 Response:', error.response.data);
    }
  }
}

testServerHealth();
