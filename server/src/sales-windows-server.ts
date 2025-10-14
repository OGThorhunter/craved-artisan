import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = 3001;
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://[::1]:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: Date.now(), message: 'Sales Windows server running' });
});

// Mock auth middleware
const mockAuth = (req: any, res: any, next: any) => {
  req.user = {
    userId: 'mock-user-id',
    email: 'vendor@cravedartisan.com',
    role: 'VENDOR',
    vendorProfileId: 'mock-vendor-id',
    isAuthenticated: true,
    lastActivity: new Date(),
  };
  next();
};

// Sales Windows routes
app.get('/api/vendor/sales-windows', mockAuth, async (req, res) => {
  try {
    const { status, q, page = '1', pageSize = '20', type } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);
    const take = parseInt(pageSize as string);
    
    const where: any = {
      vendorId: req.user.vendorProfileId,
    };
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (q) {
      where.OR = [
        { name: { contains: q as string } },
        { description: { contains: q as string } },
      ];
    }
    
    const [windows, total] = await Promise.all([
      prisma.salesWindow.findMany({
        where,
        skip,
        take,
        include: {
          products: true,
          metrics: true,
          slots: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.salesWindow.count({ where }),
    ]);
    
    return res.json({
      success: true,
      data: windows,
      pagination: {
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Error fetching sales windows:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sales windows',
    });
  }
});

// Auth routes for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'vendor@cravedartisan.com' && password === 'vendor123') {
    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        userId: 'mock-user-id',
        email: 'vendor@cravedartisan.com',
        role: 'VENDOR',
        vendorProfileId: 'mock-vendor-id',
        isAuthenticated: true,
        lastActivity: new Date(),
      },
    });
  }
  
  return res.status(401).json({
    success: false,
    message: 'Invalid credentials',
  });
});

app.get('/api/auth/session', (req, res) => {
  return res.status(401).json({
    success: false,
    message: 'No active session',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sales Windows server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

export default app;

























