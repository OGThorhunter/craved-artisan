import express from 'express';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import cors from 'cors';
import morgan from 'morgan';
import { createLogger, format, transports } from 'winston';
import dotenv from 'dotenv';
import { logCors, corsWithLogging, getCorsConfigForSession } from './middleware/logCors';
import { devHelmetConfig } from './middleware/helmetConfig';

// Import mock routes only
import authRoutes from './routes/auth-test';
import protectedRoutes from './routes/protected-demo';
import vendorRoutes from './routes/vendor-mock';
import vendorProductsRoutes from './routes/vendor-products-mock';
// import vendorRecipesRoutes from './routes/vendor-recipes-mock';
import vendorOrdersRoutes from './routes/vendor-orders-mock';
import ingredientRoutes from './routes/ingredients-mock';
import recipeRoutes from './routes/recipes-mock';
import orderRoutes from './routes/orders-mock';
import fulfillmentRoutes from './routes/fulfillment-mock';
import routeOptimizationRoutes from './routes/route-optimization-mock';
import financialRoutes from './routes/financial-mock';
// import inventoryDeductionRoutes from './routes/inventory-deduction-mock';
// import supplierMarketplaceRoutes from './routes/supplier-marketplace-mock';
import debugRoutes from './routes/debug';
import { vendors, products } from './mocks/fixtures';

// Analytics fixtures
function makeSeries(days = 14) {
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push({
      date: d.toISOString().slice(0, 10),
      revenue: +(200 + Math.random() * 400).toFixed(2),
      orders: Math.floor(5 + Math.random() * 20),
    });
  }
  return out;
}

const series = makeSeries(14);
const totals = series.reduce(
  (acc, d) => ({ 
    totalRevenue: +(acc.totalRevenue + d.revenue).toFixed(2), 
    totalOrders: acc.totalOrders + d.orders 
  }), 
  { totalRevenue: 0, totalOrders: 0 }
);
const avgOrderValue = totals.totalOrders ? +(totals.totalRevenue / totals.totalOrders).toFixed(2) : 0;

// Reuse product fixtures to build top sellers
const bestSellers = {
  items: [
    { productId: "prod-sourdough-1", name: "Country Sourdough Loaf", qtySold: 140, totalRevenue: 1190.00 },
    { productId: "prod-granola-1", name: "Honey Almond Granola", qtySold: 85, totalRevenue: 1020.00 },
    { productId: "prod-soap-1", name: "Lavender Goat Milk Soap", qtySold: 60, totalRevenue: 420.00 },
  ]
};

// Load environment variables
dotenv.config();

// Create Winston logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'craved-artisan-server' },
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Validate environment variables
try {
  logger.info('Validating environment variables...');
  logger.info(`Database URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
  logger.info(`Node Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Session Secret: ${process.env.SESSION_SECRET ? '✅ Set' : '❌ Missing'}`);
} catch (error) {
  logger.error('Environment validation failed:', error);
  process.exit(1);
}

// Session store (using memory store for mock mode)
const MemoryStore = session.MemoryStore;

// Middleware
// Use development helmet configuration
app.use(devHelmetConfig);

// CORS logging middleware
app.use(logCors);

// CORS configuration with logging
app.use(cors(corsWithLogging));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session middleware (using memory store)
app.use(session({
  store: new MemoryStore(),
  secret: process.env.SESSION_SECRET || 'mock-secret-key',
  resave: true,
  saveUninitialized: true,
  cookie: {
    ...getCorsConfigForSession(),
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Morgan logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    }
  }
}));



// API routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/vendors', vendorRoutes); // Add vendors route for analytics
app.use('/api/vendors', financialRoutes); // Mount financial routes under /api/vendors
app.use('/api/vendor/products', vendorProductsRoutes);
// app.use('/api/vendor/recipes', vendorRecipesRoutes);
app.use('/api/vendor/orders', vendorOrdersRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/fulfillment', fulfillmentRoutes);
app.use('/api/route', routeOptimizationRoutes);
app.use('/api/financial', financialRoutes); // Keep for backward compatibility
// app.use('/api/inventory', inventoryDeductionRoutes);
// app.use('/api/supplier', supplierMarketplaceRoutes);

// Debug routes (development only)
app.use('/api/_debug', debugRoutes);

// 1) helper to mount routes at BOTH "/" and "/api"
const both = (p: string) => [p, `/api${p}`] as const;

const router = express.Router();

// Health (already works)
router.get(both("/health"), (req,res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString(), service: "craved-artisan-server", mode: "MOCK" });
});

// GET /products
router.get("/products", (req, res) => {
  const limit = Math.min(parseInt(String(req.query.limit ?? "20"), 10) || 20, 100);
  const offset = parseInt(String(req.query.offset ?? "0"), 10) || 0;
  const slice = products.slice(offset, offset + limit);
  res.json({
    data: slice,
    meta: { total: products.length, limit, offset }
  });
});

// GET /products/:productId
router.get("/products/:productId", (req, res) => {
  const p = products.find(x => x.id === req.params.productId);
  if (!p) return res.status(404).json({ error: "Not found", message: `Product ${req.params.productId} not found` });
  res.json(p);
});

// GET /vendors/:vendorId
router.get("/vendors/:vendorId", (req, res) => {
  const v = vendors.find(x => x.id === req.params.vendorId);
  if (!v) return res.status(404).json({ error: "Not found", message: `Vendor ${req.params.vendorId} not found` });
  res.json(v);
});

// GET /vendors/:vendorId/products
router.get("/vendors/:vendorId/products", (req, res) => {
  const v = vendors.find(x => x.id === req.params.vendorId);
  if (!v) return res.status(404).json({ error: "Not found", message: `Vendor ${req.params.vendorId} not found` });
  const list = products.filter(p => p.vendorId === v.id);
  res.json({
    data: list,
    meta: { total: list.length }
  });
});

app.use(router);

// 4) Analytics mocks (match your frontend exactly)
app.get(both("/analytics/vendor/:vendorId/summary"), (_req, res) => {
  res.json({ totalRevenue: totals.totalRevenue, totalOrders: totals.totalOrders, avgOrderValue, series });
});
app.get(both("/analytics/vendor/:vendorId/trends"), (_req, res) => {
  res.json({ series });
});
app.get(both("/analytics/vendor/:vendorId/best-sellers"), (_req, res) => {
  res.json({
    items: [
      { productId: "prod-sourdough-1", name: "Country Sourdough Loaf", qtySold: 140, totalRevenue: 1190.00 },
      { productId: "prod-granola-1", name: "Honey Almond Granola", qtySold: 85, totalRevenue: 1020.00 },
      { productId: "prod-soap-1", name: "Lavender Goat Milk Soap", qtySold: 60, totalRevenue: 420.00 },
    ]
  });
});

// Aliases to match current frontend calls
app.get("/api/vendor/:vendorId/analytics/summary", (_req, res) => {
  res.json({ totals, series });
});

app.get("/api/vendor/:vendorId/analytics/trends", (req, res) => {
  res.json({ series });
});

app.get("/api/vendor/:vendorId/analytics/bestsellers", (req, res) => {
  const range = req.query.range || 'monthly';
  const limit = parseInt(req.query.limit as string) || 10;
  
  // Return mock best sellers data with the expected structure
  res.json({
    data: [
      {
        productId: "prod-sourdough-1",
        name: "Country Sourdough Loaf",
        revenue: 1190.00,
        units: 140,
        reorderRate: 85.5,
        rating: 4.8,
        stock: 25,
        category: "Bread",
        trend: 12.5,
        trendData: series.map(s => ({ date: s.date, value: s.revenue }))
      },
      {
        productId: "prod-granola-1",
        name: "Honey Almond Granola",
        revenue: 1020.00,
        units: 85,
        reorderRate: 78.2,
        rating: 4.6,
        stock: 15,
        category: "Snacks",
        trend: 8.3,
        trendData: series.map(s => ({ date: s.date, value: s.revenue * 0.8 }))
      },
      {
        productId: "prod-soap-1",
        name: "Lavender Goat Milk Soap",
        revenue: 420.00,
        units: 60,
        reorderRate: 92.1,
        rating: 4.9,
        stock: 8,
        category: "Personal Care",
        trend: 15.7,
        trendData: series.map(s => ({ date: s.date, value: s.revenue * 0.3 }))
      }
    ].slice(0, limit),
    meta: {
      vendorId: req.params.vendorId,
      vendorName: "Mock Vendor",
      range,
      limit,
      totalRevenue: 2630.00,
      totalUnits: 285,
      avgReorderRate: 85.3
    }
  });
});

// New analytics endpoints for the live analytics feature
app.get("/api/analytics/vendor/:vendorId/overview", (req, res) => {
  const interval = req.query.interval || 'day';
  const from = req.query.from ? new Date(req.query.from as string) : undefined;
  const to = req.query.to ? new Date(req.query.to as string) : undefined;
  
  // Generate mock data based on interval
  const days = interval === 'day' ? 14 : interval === 'week' ? 12 : 12;
  const mockSeries = makeSeries(days);
  const mockTotals = mockSeries.reduce(
    (acc, d) => ({ 
      totalRevenue: +(acc.totalRevenue + d.revenue).toFixed(2), 
      totalOrders: acc.totalOrders + d.orders 
    }), 
    { totalRevenue: 0, totalOrders: 0 }
  );
  const mockAvgOrderValue = mockTotals.totalOrders ? +(mockTotals.totalRevenue / mockTotals.totalOrders).toFixed(2) : 0;
  
  res.json({
    totals: {
      totalRevenue: mockTotals.totalRevenue,
      totalOrders: mockTotals.totalOrders,
      avgOrderValue: mockAvgOrderValue
    },
    series: mockSeries
  });
});

app.get("/api/analytics/vendor/:vendorId/best-sellers", (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const from = req.query.from ? new Date(req.query.from as string) : undefined;
  const to = req.query.to ? new Date(req.query.to as string) : undefined;
  
  res.json({
    items: bestSellers.items.slice(0, limit).map(item => ({
      productId: item.productId,
      name: item.name,
      qtySold: item.qtySold,
      totalRevenue: item.totalRevenue
    }))
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

// 5) 404 LAST
app.use((req,res)=> res.status(404).json({ error:"Not found", message:`Route ${req.path} not found (MOCK)` }));

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running in MOCK MODE on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`📦 Products: http://localhost:${PORT}/products`);
  logger.info(`🏪 Vendors: http://localhost:${PORT}/vendors/:vendorId`);
  logger.info(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  logger.info(`🛡️ Protected endpoints: http://localhost:${PORT}/api/protected`);
  logger.info(`🏪 Vendor endpoints: http://localhost:${PORT}/api/vendor`);
  logger.info(`🥘 Ingredient endpoints: http://localhost:${PORT}/api/ingredients`);
  logger.info(`👨‍🍳 Recipe endpoints: http://localhost:${PORT}/api/recipes`);
  logger.info(`🛒 Order endpoints: http://localhost:${PORT}/api/orders`);
  logger.info(`📦 Vendor Order endpoints: http://localhost:${PORT}/api/vendor/orders`);
  logger.info(`📦 Fulfillment endpoints: http://localhost:${PORT}/api/fulfillment`);
  logger.info(`📦 Inventory endpoints: http://localhost:${PORT}/api/inventory`);
  logger.info(`🏪 Supplier endpoints: http://localhost:${PORT}/api/supplier`);
});