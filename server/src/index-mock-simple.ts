import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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
app.use(cookieParser());

// Mount routers
app.use('/api/analytics-communications', analyticsCommunicationsRouter);

// Analytics endpoints
app.get('/api/analytics/vendor/:vendorId/overview', (req, res) => {
  const { vendorId } = req.params;
  const { interval = 'day' } = req.query;
  
  // Mock overview data
  const overviewData = {
    totals: {
      totalRevenue: 15420.00,
      totalOrders: 342,
      avgOrderValue: 45.09
    },
    series: [
      { date: '2024-01-01', revenue: 342.50, orders: 8 },
      { date: '2024-01-02', revenue: 567.30, orders: 12 },
      { date: '2024-01-03', revenue: 423.80, orders: 9 },
      { date: '2024-01-04', revenue: 789.20, orders: 16 },
      { date: '2024-01-05', revenue: 634.90, orders: 13 },
      { date: '2024-01-06', revenue: 891.40, orders: 18 },
      { date: '2024-01-07', revenue: 756.30, orders: 15 }
    ]
  };
  
  res.json(overviewData);
});

app.get('/api/analytics/vendor/:vendorId/best-sellers', (req, res) => {
  const { vendorId } = req.params;
  const { limit = 10 } = req.query;
  
  // Mock best sellers data
  const bestSellersData = {
    items: [
      {
        productId: 'product_artisan_croissant',
        name: 'Artisan Croissant',
        qtySold: 45,
        totalRevenue: 1247.50,
        category: 'Bakery',
        rating: 4.8,
        stockLevel: 85,
        units: 45,
        reorderRate: 65,
        stock: 85,
        trend: 12.5,
        trendData: [
          { date: '2024-01-01', value: 38 },
          { date: '2024-01-02', value: 42 },
          { date: '2024-01-03', value: 39 },
          { date: '2024-01-04', value: 47 },
          { date: '2024-01-05', value: 43 },
          { date: '2024-01-06', value: 51 },
          { date: '2024-01-07', value: 45 }
        ]
      },
      {
        productId: 'product_chocolate_chip_cookies',
        name: 'Chocolate Chip Cookies',
        qtySold: 38,
        totalRevenue: 1083.00,
        category: 'Bakery',
        rating: 4.7,
        stockLevel: 92,
        units: 38,
        reorderRate: 58,
        stock: 92,
        trend: 8.3,
        trendData: [
          { date: '2024-01-01', value: 32 },
          { date: '2024-01-02', value: 35 },
          { date: '2024-01-03', value: 33 },
          { date: '2024-01-04', value: 39 },
          { date: '2024-01-05', value: 36 },
          { date: '2024-01-06', value: 42 },
          { date: '2024-01-07', value: 38 }
        ]
      },
      {
        productId: 'product_fresh_rosemary_focaccia',
        name: 'Fresh Rosemary Focaccia',
        qtySold: 32,
        totalRevenue: 896.00,
        category: 'Bakery',
        rating: 4.9,
        stockLevel: 78,
        units: 32,
        reorderRate: 72,
        stock: 78,
        trend: 15.2,
        trendData: [
          { date: '2024-01-01', value: 28 },
          { date: '2024-01-02', value: 31 },
          { date: '2024-01-03', value: 29 },
          { date: '2024-01-04', value: 35 },
          { date: '2024-01-05', value: 33 },
          { date: '2024-01-06', value: 37 },
          { date: '2024-01-07', value: 32 }
        ]
      }
    ]
  };
  
  res.json(bestSellersData);
});

app.get('/api/vendor/:vendorId/analytics/conversion', (req, res) => {
  const { vendorId } = req.params;
  const { range = 'monthly' } = req.query;
  
  // Mock conversion funnel data
  const baseData = {
    daily: {
      visitors: 1250,
      pageViews: 3400,
      addToCart: 485,
      checkoutStarted: 287,
      ordersCompleted: 234,
      revenue: 42150
    },
    weekly: {
      visitors: 8750,
      pageViews: 23800,
      addToCart: 3395,
      checkoutStarted: 2009,
      ordersCompleted: 1638,
      revenue: 295050
    },
    monthly: {
      visitors: 37500,
      pageViews: 102000,
      addToCart: 14550,
      checkoutStarted: 8610,
      ordersCompleted: 7020,
      revenue: 1263600
    }
  };

  const data = baseData[range as keyof typeof baseData] || baseData.monthly;

  const conversionData = {
    data,
    meta: {
      vendorId,
      vendorName: 'Demo Vendor',
      range,
      conversionRate: 20.2,
      avgOrderValue: 180,
      topFunnelDropoff: 'Page Views to Cart',
      improvementOpportunity: 'Optimize product pages and add social proof'
    }
  };
  
  res.json(conversionData);
});

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
  },
  {
    id: 3,
    email: 'vendor@cravedartisan.com',
    password: 'vendor123',
    role: 'VENDOR',
    name: 'Demo Vendor'
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

app.get('/api/auth/session', (req, res) => {
  // Mock session check - return the last logged in user or default to coordinator
  const sessionCookie = req.cookies?.session;
  
  // For demo purposes, we'll check if there's a session and return appropriate user
  // In a real app, this would validate the session token
  if (sessionCookie === 'mock-session-id') {
    // Return the vendor user for demo
    res.json({
      success: true,
      user: {
        userId: '3',
        email: 'vendor@cravedartisan.com',
        role: 'VENDOR',
        name: 'Demo Vendor',
        isAuthenticated: true,
        lastActivity: new Date().toISOString()
      }
    });
  } else {
    // Default to coordinator if no session
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
  }
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
  console.log(`🏪 Vendor user: vendor@cravedartisan.com / vendor123`);
});

export default app;
