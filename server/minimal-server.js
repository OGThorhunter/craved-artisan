const express = require('express');
const app = express();
const PORT = 3001;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple cookie parser
app.use((req, res, next) => {
  if (req.headers.cookie) {
    req.cookies = {};
    req.headers.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        req.cookies[name] = value;
      }
    });
  }
  next();
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Simple session storage
const sessions = new Map();

// Auth routes - matching frontend expectations
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'vendor@cravedartisan.com' && password === 'password123') {
    const sessionId = 'mock-session-' + Date.now();
    const user = { 
      userId: 'mock-user-id', 
      id: 'mock-user-id',
      email, 
      role: 'VENDOR',
      lastActivity: new Date().toISOString()
    };
    sessions.set(sessionId, {
      userId: 'mock-user-id',
      user: user
    });
    
    res.cookie('sessionId', sessionId, { httpOnly: true });
    res.json({ success: true, user: user });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/api/auth/session', (req, res) => {
  const sessionId = req.cookies?.sessionId;
  const session = sessions.get(sessionId);
  
  if (session) {
    res.json({ success: true, user: session.user, authenticated: true });
  } else {
    res.status(401).json({ success: false, authenticated: false });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const sessionId = req.cookies?.sessionId;
  if (sessionId) sessions.delete(sessionId);
  res.json({ success: true });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'minimal-auth-server' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Minimal auth server running on port ${PORT}`);
  console.log('✅ Test login: vendor@cravedartisan.com / password123');
  console.log('✅ Routes: /api/auth/login, /api/auth/session, /api/auth/logout');
});




