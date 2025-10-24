/**
 * Test the specific signup endpoint that was failing
 * Run this with: node test-signup-endpoint.js
 */

require('dotenv').config();
const axios = require('axios');

async function testSignupEndpoint() {
  console.log('🔍 Testing signup endpoint...');
  
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  const signupUrl = `${baseUrl}/api/auth/signup/step1`;
  
  console.log('🔍 Testing URL:', signupUrl);
  
  // Test data
  const testData = {
    email: 'test@example.com',
    password: 'TestPassword123',
    name: 'Test User',
    role: 'VENDOR'
  };
  
  console.log('🔍 Test data:', {
    email: testData.email,
    name: testData.name,
    role: testData.role,
    hasPassword: !!testData.password
  });
  
  try {
    console.log('🔍 Making POST request...');
    const response = await axios.post(signupUrl, testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('✅ Request successful!');
    console.log('🔍 Status:', response.status);
    console.log('🔍 Response:', response.data);
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    
    if (error.response) {
      console.error('🔍 Status:', error.response.status);
      console.error('🔍 Response data:', error.response.data);
      console.error('🔍 Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('🔍 No response received');
      console.error('🔍 Request config:', error.config);
    } else {
      console.error('🔍 Error setting up request:', error.message);
    }
  }
}

testSignupEndpoint();
