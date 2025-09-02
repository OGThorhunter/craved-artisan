const axios = require('axios');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

// Create multiple cookie jars for different users
const user1Jar = new tough.CookieJar();
const user2Jar = new tough.CookieJar();

// Create axios instances for different users
const user1Client = wrapper(axios.create({
  baseURL: 'http://localhost:3001',
  jar: user1Jar,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
}));

const user2Client = wrapper(axios.create({
  baseURL: 'http://localhost:3001',
  jar: user2Jar,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
}));

async function testMultiSessions() {
  try {
    console.log('🔥 Testing Multiple Concurrent Sessions...\n');
    
    // Test 1: User 1 login
    console.log('1. User 1 logging in...');
    const user1Login = await user1Client.post('/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('   User 1 Response:', user1Login.data.success ? '✅ LOGIN SUCCESS' : '❌ LOGIN FAILED');
    
    // Test 2: User 2 login (should work independently)
    console.log('\n2. User 2 logging in...');
    const user2Login = await user2Client.post('/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('   User 2 Response:', user2Login.data.success ? '✅ LOGIN SUCCESS' : '❌ LOGIN FAILED');
    
    // Test 3: Check User 1 session (should still be logged in)
    console.log('\n3. Checking User 1 session...');
    const user1Session = await user1Client.get('/api/auth/session');
    console.log('   User 1 Session:', user1Session.data.success ? '✅ STILL LOGGED IN' : '❌ SESSION LOST');
    
    // Test 4: Check User 2 session (should be logged in)
    console.log('\n4. Checking User 2 session...');
    const user2Session = await user2Client.get('/api/auth/session');
    console.log('   User 2 Session:', user2Session.data.success ? '✅ STILL LOGGED IN' : '❌ SESSION LOST');
    
    // Test 5: User 1 logout
    console.log('\n5. User 1 logging out...');
    const user1Logout = await user1Client.post('/api/auth/logout');
    console.log('   User 1 Logout:', user1Logout.data.success ? '✅ LOGOUT SUCCESS' : '❌ LOGOUT FAILED');
    
    // Test 6: Check User 1 session after logout (should be logged out)
    console.log('\n6. Checking User 1 session after logout...');
    try {
      const user1SessionAfter = await user1Client.get('/api/auth/session');
      console.log('   User 1 Session:', user1SessionAfter.data.success ? '❌ STILL LOGGED IN' : '✅ PROPERLY LOGGED OUT');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   User 1 Session: ✅ PROPERLY LOGGED OUT (401 Unauthorized)');
      } else {
        console.log('   User 1 Session: ❌ Unexpected error:', error.message);
      }
    }
    
    // Test 7: Check User 2 session (should still be logged in)
    console.log('\n7. Checking User 2 session (should be unaffected)...');
    const user2SessionAfter = await user2Client.get('/api/auth/session');
    console.log('   User 2 Session:', user2SessionAfter.data.success ? '✅ STILL LOGGED IN' : '❌ SESSION LOST');
    
    // Test 8: User 2 logout
    console.log('\n8. User 2 logging out...');
    const user2Logout = await user2Client.post('/api/auth/logout');
    console.log('   User 2 Logout:', user2Logout.data.success ? '✅ LOGOUT SUCCESS' : '❌ LOGOUT FAILED');
    
    // Test 9: Final session check for both users
    console.log('\n9. Final session check for both users...');
    try {
      const finalUser1Session = await user1Client.get('/api/auth/session');
      console.log('   User 1 Final Session:', finalUser1Session.data.success ? '❌ STILL LOGGED IN' : '✅ PROPERLY LOGGED OUT');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   User 1 Final Session: ✅ PROPERLY LOGGED OUT (401 Unauthorized)');
      } else {
        console.log('   User 1 Final Session: ❌ Unexpected error:', error.message);
      }
    }
    
    try {
      const finalUser2Session = await user2Client.get('/api/auth/session');
      console.log('   User 2 Final Session:', finalUser2Session.data.success ? '❌ STILL LOGGED IN' : '✅ PROPERLY LOGGED OUT');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   User 2 Final Session: ✅ PROPERLY LOGGED OUT (401 Unauthorized)');
      } else {
        console.log('   User 2 Final Session: ❌ Unexpected error:', error.message);
      }
    }
    
    console.log('\n🎯 Multi-Session Test Complete!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testMultiSessions();
