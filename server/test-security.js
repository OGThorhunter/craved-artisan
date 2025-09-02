const axios = require('axios');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

// Create cookie jar
const cookieJar = new tough.CookieJar();

// Create axios instance
const client = wrapper(axios.create({
  baseURL: 'http://localhost:3001',
  jar: cookieJar,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
}));

async function testSecurity() {
  try {
    console.log('🔒 Testing Security Features...\n');
    
    // Test 1: Invalid email format
    console.log('1. Testing invalid email format...');
    try {
      const invalidEmail = await client.post('/api/auth/login', {
        email: 'not-an-email',
        password: 'password123'
      });
      console.log('   Response:', invalidEmail.data);
    } catch (error) {
      console.log('   Response:', error.response?.data || 'Error occurred');
    }
    
    // Test 2: Invalid password (too short)
    console.log('\n2. Testing invalid password (too short)...');
    try {
      const invalidPassword = await client.post('/api/auth/login', {
        email: 'test@example.com',
        password: '123'
      });
      console.log('   Response:', invalidPassword.data);
    } catch (error) {
      console.log('   Response:', error.response?.data || 'Error occurred');
    }
    
    // Test 3: Wrong credentials
    console.log('\n3. Testing wrong credentials...');
    try {
      const wrongCreds = await client.post('/api/auth/login', {
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      console.log('   Response:', wrongCreds.data);
    } catch (error) {
      console.log('   Response:', error.response?.data || 'Error occurred');
    }
    
    // Test 4: Valid login
    console.log('\n4. Testing valid login...');
    try {
      const validLogin = await client.post('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('   Response:', validLogin.data.success ? '✅ LOGIN SUCCESS' : '❌ LOGIN FAILED');
    } catch (error) {
      console.log('   Response:', error.response?.data || 'Error occurred');
    }
    
    // Test 5: Access protected route without auth (before login)
    console.log('\n5. Testing protected route without auth (before login)...');
    try {
      const protectedRoute = await client.post('/api/auth/logout');
      console.log('   Response:', protectedRoute.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   Response: ✅ PROPERLY BLOCKED (401 Unauthorized)');
      } else {
        console.log('   Response:', error.response?.data || 'Error occurred');
      }
    }
    
    // Test 6: Check session after valid login
    console.log('\n6. Checking session after valid login...');
    try {
      const session = await client.get('/api/auth/session');
      console.log('   Response:', session.data.success ? '✅ SESSION ACTIVE' : '❌ SESSION INACTIVE');
    } catch (error) {
      console.log('   Response:', error.response?.data || 'Error occurred');
    }
    
    // Test 7: Access protected route with auth (should work)
    console.log('\n7. Testing protected route with auth (should work)...');
    try {
      const protectedRouteWithAuth = await client.post('/api/auth/logout');
      console.log('   Response:', protectedRouteWithAuth.data.success ? '✅ ACCESS GRANTED' : '❌ ACCESS DENIED');
    } catch (error) {
      console.log('   Response:', error.response?.data || 'Error occurred');
    }
    
    // Test 8: Check session after logout
    console.log('\n8. Checking session after logout...');
    try {
      const sessionAfterLogout = await client.get('/api/auth/session');
      console.log('   Response:', sessionAfterLogout.data.success ? '❌ STILL ACTIVE' : '✅ PROPERLY LOGGED OUT');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   Response: ✅ PROPERLY LOGGED OUT (401 Unauthorized)');
      } else {
        console.log('   Response:', error.response?.data || 'Error occurred');
      }
    }
    
    console.log('\n🔒 Security Test Complete!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testSecurity();
