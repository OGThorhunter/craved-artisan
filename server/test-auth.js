const axios = require('axios');

// Create axios instance that handles cookies
const client = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testAuth() {
  try {
    console.log('🔍 Testing Auth Endpoints...\n');
    
    // Test 1: Check initial session
    console.log('1. Checking initial session...');
    try {
      const session1 = await client.get('/api/auth/session');
      console.log('   Response:', session1.data);
    } catch (error) {
      console.log('   Response:', error.response?.data || 'Error occurred');
    }
    
    // Test 2: Login
    console.log('\n2. Attempting login...');
    try {
      const login = await client.post('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('   Response:', login.data);
    } catch (error) {
      console.log('   Response:', error.response?.data || 'Error occurred');
    }
    
    // Test 3: Check session after login
    console.log('\n3. Checking session after login...');
    try {
      const session2 = await client.get('/api/auth/session');
      console.log('   Response:', session2.data);
    } catch (error) {
      console.log('   Response:', error.response?.data || 'Error occurred');
    }
    
    // Test 4: Logout
    console.log('\n4. Attempting logout...');
    try {
      const logout = await client.post('/api/auth/logout');
      console.log('   Response:', logout.data);
    } catch (error) {
      console.log('   Response:', error.response?.data || 'Error occurred');
    }
    
    // Test 5: Check session after logout
    console.log('\n5. Checking session after logout...');
    try {
      const session3 = await client.get('/api/auth/session');
      console.log('   Response:', session3.data);
    } catch (error) {
      console.log('   Response:', error.response?.data || 'Error occurred');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testAuth();
