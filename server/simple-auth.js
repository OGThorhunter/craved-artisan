const http = require('http');
const url = require('url');

// Simple in-memory storage
const sessions = new Map();
const users = [
  {
    id: '1',
    email: 'vendor@cravedartisan.com',
    password: 'password123',
    role: 'VENDOR',
    name: 'Demo Vendor'
  }
];

// Helper functions
function findUser(email, password) {
  return users.find(user => 
    user.email === email && user.password === password
  );
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

function sendResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Create server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  console.log(`${method} ${path}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // Health check
  if (path === '/health') {
    sendResponse(res, 200, { 
      status: 'OK', 
      service: 'simple-auth-server',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Test endpoint
  if (path === '/test') {
    sendResponse(res, 200, {
      message: 'Simple auth server is working!',
      endpoints: [
        'POST /api/auth-test/login',
        'GET /api/auth-test/session',
        'POST /api/auth-test/logout'
      ],
      testCredentials: {
        email: 'vendor@cravedartisan.com',
        password: 'password123'
      }
    });
    return;
  }

  // Login endpoint
  if (path === '/api/auth-test/login' && method === 'POST') {
    const body = await parseBody(req);
    const { email, password } = body;

    console.log('Login attempt:', { email, password: password ? '***' : 'missing' });

    if (!email || !password) {
      sendResponse(res, 400, {
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    const user = findUser(email, password);

    if (user) {
      const sessionId = 'session-' + Date.now();
      sessions.set(sessionId, {
        userId: user.id,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        }
      });

      console.log('Login successful for:', user.email);

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Access-Control-Allow-Credentials': 'true',
        'Set-Cookie': `sessionId=${sessionId}; HttpOnly; Path=/; SameSite=Lax`
      });
      res.end(JSON.stringify({
        success: true,
        user: sessions.get(sessionId).user,
        message: 'Login successful'
      }));
    } else {
      console.log('Login failed for:', email);
      sendResponse(res, 401, {
        success: false,
        message: 'Invalid email or password'
      });
    }
    return;
  }

  // Session check endpoint
  if (path === '/api/auth-test/session' && method === 'GET') {
    const cookies = req.headers.cookie || '';
    const sessionId = cookies.split(';')
      .find(c => c.trim().startsWith('sessionId='))
      ?.split('=')[1];

    console.log('Session check - sessionId:', sessionId);

    if (sessionId && sessions.has(sessionId)) {
      const session = sessions.get(sessionId);
      sendResponse(res, 200, {
        success: true,
        user: session.user,
        authenticated: true
      });
    } else {
      sendResponse(res, 401, {
        success: false,
        authenticated: false,
        message: 'Not authenticated'
      });
    }
    return;
  }

  // Logout endpoint
  if (path === '/api/auth-test/logout' && method === 'POST') {
    const cookies = req.headers.cookie || '';
    const sessionId = cookies.split(';')
      .find(c => c.trim().startsWith('sessionId='))
      ?.split('=')[1];

    if (sessionId) {
      sessions.delete(sessionId);
      console.log('Logout successful for session:', sessionId);
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Credentials': 'true',
      'Set-Cookie': 'sessionId=; HttpOnly; Path=/; Max-Age=0'
    });
    res.end(JSON.stringify({
      success: true,
      message: 'Logged out successfully'
    }));
    return;
  }

  // 404 handler
  sendResponse(res, 404, {
    error: 'Route not found',
    path: path,
    availableEndpoints: [
      '/health',
      '/test',
      '/api/auth-test/login',
      '/api/auth-test/session',
      '/api/auth-test/logout'
    ]
  });
});

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log('🚀 Simple Auth Server Started!');
  console.log(`📍 Server running on port ${PORT}`);
  console.log('✅ CORS enabled for http://localhost:5173');
  console.log('🔐 Test credentials: vendor@cravedartisan.com / password123');
  console.log('📡 Health check: http://localhost:3001/health');
  console.log('🧪 Test endpoint: http://localhost:3001/test');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
