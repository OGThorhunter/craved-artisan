import express from 'express';
import cors from 'cors';
import analyticsCommunicationsRouter from './routes/analytics-communications.router';

const app = express();
const PORT = 3001;

// CORS middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://[::1]:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Mount routers
app.use('/api/analytics-communications', analyticsCommunicationsRouter);

// Mock users data
const mockUsers = [
  {
    id: 1,
    email: 'coordinator@cravedartisan.com',
    password: 'coordinator123', // In real app, this would be hashed
    role: 'EVENT_COORDINATOR',
    name: 'Event Coordinator'
  },
  {
    id: 2,
    email: 'admin@cravedartisan.com',
    password: 'admin123',
    role: 'admin',
    name: 'System Admin'
  }
];

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now(), message: 'Mock server running' });
});

// Mock auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Mock session
    res.cookie('session', 'mock-session-id', { 
      httpOnly: true, 
      secure: false, 
      sameSite: 'lax' 
    });
    
    res.json({
      success: true,
      user: {
        userId: user.id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
        isAuthenticated: true,
        lastActivity: new Date().toISOString()
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('session');
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/session', (_req, res) => {
  // Mock session check - return coordinator user
  res.json({
    success: true,
    user: {
      userId: '1',
      email: 'coordinator@cravedartisan.com',
      role: 'EVENT_COORDINATOR',
      name: 'Event Coordinator',
      isAuthenticated: true,
      lastActivity: new Date().toISOString()
    }
  });
});

// Mock event coordinator dashboard data
app.get('/api/coordinator/dashboard', (_req, res) => {
  res.json({
    events: [
      {
        id: 1,
        name: 'Artisan Market Spring 2025',
        date: '2025-04-15',
        status: 'active',
        vendors: 25,
        attendees: 150
      },
      {
        id: 2,
        name: 'Craft Fair Summer 2025',
        date: '2025-06-20',
        status: 'planning',
        vendors: 18,
        attendees: 0
      }
    ],
    stats: {
      totalEvents: 2,
      activeEvents: 1,
      totalVendors: 43,
      totalAttendees: 150
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock server listening on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`👤 Coordinator user: coordinator@cravedartisan.com / coordinator123`);
});

export default app;
