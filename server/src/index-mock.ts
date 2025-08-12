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
import customerRoutes from './routes/customers-mock';
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
app.use('/api/customers', customerRoutes);
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

// Financials endpoints for the live financials feature
app.get("/api/financials/vendor/:vendorId/pnl", (req, res) => {
  const from = req.query.from ? new Date(req.query.from as string) : undefined;
  const to = req.query.to ? new Date(req.query.to as string) : undefined;
  
  // Generate mock P&L data
  const revenue = Math.floor(Math.random() * 10000) + 2000;
  const cogs = Math.floor(revenue * 0.6);
  const platformFees = Math.floor(revenue * 0.01);
  const stripeFees = Math.floor(revenue * 0.029) + 30;
  const totalFees = platformFees + stripeFees;
  const grossProfit = revenue - cogs;
  const netIncome = grossProfit - totalFees;
  
  const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const toDate = to || new Date();
  
  res.json({
    period: { from: fromDate, to: toDate },
    revenue, cogs, 
    fees: { platform: platformFees, stripe: stripeFees, total: totalFees },
    grossProfit, expenses: totalFees, netIncome
  });
});

app.get("/api/financials/vendor/:vendorId/cash-flow", (req, res) => {
  const from = req.query.from ? new Date(req.query.from as string) : undefined;
  const to = req.query.to ? new Date(req.query.to as string) : undefined;
  const method = req.query.method || 'direct';
  
  const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const toDate = to || new Date();
  
  if (method === 'direct') {
    const sales = Math.floor(Math.random() * 10000) + 2000;
    const cogs = Math.floor(sales * 0.6);
    const fees = Math.floor(sales * 0.039) + 30;
    const net = sales - cogs - fees;
    
    res.json({
      period: { from: fromDate, to: toDate },
      method: 'direct',
      inflows: { sales },
      outflows: { cogs, fees },
      net
    });
  } else {
    const netIncome = Math.floor(Math.random() * 3000) + 500;
    const deltaWorkingCapital = Math.floor(Math.random() * 1000) - 500;
    const net = netIncome + deltaWorkingCapital;
    
    res.json({
      period: { from: fromDate, to: toDate },
      method: 'indirect',
      netIncome,
      adjustments: { deltaWorkingCapital },
      net
    });
  }
});

app.get("/api/financials/vendor/:vendorId/balance-sheet", (req, res) => {
  const asOf = req.query.asOf ? new Date(req.query.asOf as string) : new Date();
  
  const cash = Math.floor(Math.random() * 5000) + 1000;
  const inventory = Math.floor(Math.random() * 3000) + 500;
  const payables = Math.floor(Math.random() * 2000) + 200;
  const taxesPayable = Math.floor(Math.random() * 1000) + 100;
  const equity = cash + inventory - payables - taxesPayable;
  
  res.json({
    asOf,
    assets: { cash, inventory },
    liabilities: { payables, taxesPayable },
    equity
  });
});

app.get("/api/financials/vendor/:vendorId/pnl.csv", (req, res) => {
  const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = req.query.to ? new Date(req.query.to as string) : new Date();
  
  const revenue = Math.floor(Math.random() * 10000) + 2000;
  const cogs = Math.floor(revenue * 0.6);
  const platformFees = Math.floor(revenue * 0.01);
  const stripeFees = Math.floor(revenue * 0.029) + 30;
  const totalFees = platformFees + stripeFees;
  const grossProfit = revenue - cogs;
  const netIncome = grossProfit - totalFees;
  
  const csv = `Period From,Period To,Revenue,COGS,Platform Fees,Stripe Fees,Total Fees,Gross Profit,Total Expenses,Net Income\n"${from.toISOString().split('T')[0]}","${to.toISOString().split('T')[0]}",${revenue},${cogs},${platformFees},${stripeFees},${totalFees},${grossProfit},${totalFees},${netIncome}`;
  
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=pnl-${req.params.vendorId}-${new Date().toISOString().split('T')[0]}.csv`);
  res.send(csv);
});

app.get("/api/financials/vendor/:vendorId/cash-flow.csv", (req, res) => {
  const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = req.query.to ? new Date(req.query.to as string) : new Date();
  const method = req.query.method || 'direct';
  
  let csv;
  if (method === 'direct') {
    const sales = Math.floor(Math.random() * 10000) + 2000;
    const cogs = Math.floor(sales * 0.6);
    const fees = Math.floor(sales * 0.039) + 30;
    const net = sales - cogs - fees;
    
    csv = `Period From,Period To,Sales Inflows,COGS Outflows,Fees Outflows,Net Cash Flow\n"${from.toISOString().split('T')[0]}","${to.toISOString().split('T')[0]}",${sales},${cogs},${fees},${net}`;
  } else {
    const netIncome = Math.floor(Math.random() * 3000) + 500;
    const deltaWorkingCapital = Math.floor(Math.random() * 1000) - 500;
    const net = netIncome + deltaWorkingCapital;
    
    csv = `Period From,Period To,Net Income,Working Capital Change,Net Cash Flow\n"${from.toISOString().split('T')[0]}","${to.toISOString().split('T')[0]}",${netIncome},${deltaWorkingCapital},${net}`;
  }
  
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=cashflow-${req.params.vendorId}-${new Date().toISOString().split('T')[0]}.csv`);
  res.send(csv);
});

// Product analytics endpoints for the live product analytics feature
app.get("/api/analytics/vendor/:vendorId/product/:productId/overview", (req, res) => {
  const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = req.query.to ? new Date(req.query.to as string) : new Date();
  
  // Generate mock product overview data
  const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  const series = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
    series.push({
      date: date.toISOString().slice(0, 10),
      revenue: Math.floor(Math.random() * 500) + 50,
      qty: Math.floor(Math.random() * 20) + 1
    });
  }
  
  const totals = series.reduce((acc, item) => ({
    revenue: acc.revenue + item.revenue,
    qtySold: acc.qtySold + item.qty,
    orders: acc.orders + Math.floor(item.qty / 3) + 1
  }), { revenue: 0, qtySold: 0, orders: 0 });
  
  // Generate mock price history
  const priceHistory = series.slice(0, 5).map((item, index) => ({
    date: item.date,
    price: Math.floor(Math.random() * 50) + 10 + index
  }));
  
  res.json({
    totals,
    series,
    priceHistory
  });
});

// Inventory endpoints for the live inventory feature
app.get("/api/inventory/vendor/:vendorId/ingredients", (req, res) => {
  const { vendorId } = req.params;
  
  // Generate mock ingredients with inventory
  const ingredients = [
    {
      id: "ing-1",
      vendorId,
      name: "Organic Flour",
      unit: "kg",
      costPerUnit: 2.50,
      tags: ["organic", "baking"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inventory: {
        id: "inv-1",
        quantity: 25.5,
        costBasis: 2.45,
        updatedAt: new Date().toISOString()
      }
    },
    {
      id: "ing-2", 
      vendorId,
      name: "Fresh Eggs",
      unit: "unit",
      costPerUnit: 0.35,
      tags: ["organic", "fresh"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inventory: {
        id: "inv-2",
        quantity: 120,
        costBasis: 0.33,
        updatedAt: new Date().toISOString()
      }
    },
    {
      id: "ing-3",
      vendorId, 
      name: "Butter",
      unit: "kg",
      costPerUnit: 8.00,
      tags: ["dairy", "premium"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inventory: {
        id: "inv-3",
        quantity: 5.2,
        costBasis: 7.85,
        updatedAt: new Date().toISOString()
      }
    }
  ];
  
  res.json(ingredients);
});

app.post("/api/inventory/vendor/:vendorId/ingredients", (req, res) => {
  const { vendorId } = req.params;
  const { name, unit, costPerUnit, tags } = req.body;
  
  const ingredient = {
    id: `ing-${Date.now()}`,
    vendorId,
    name,
    unit,
    costPerUnit,
    tags: tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.status(201).json(ingredient);
});

app.post("/api/inventory/vendor/:vendorId/purchase", (req, res) => {
  const { vendorId } = req.params;
  const { ingredientId, quantity, unitCost } = req.body;
  
  // Mock purchase result
  const result = {
    quantity: Math.random() * 100 + 50,
    costBasis: unitCost + (Math.random() * 0.5)
  };
  
  res.json(result);
});

app.get("/api/inventory/vendor/:vendorId/transactions", (req, res) => {
  const { vendorId } = req.params;
  const { type } = req.query;
  
  // Generate mock transactions
  const transactions = [
    {
      id: "tx-1",
      vendorId,
      ingredientId: "ing-1",
      type: "purchase",
      quantity: 50,
      unitCost: 2.45,
      createdAt: new Date().toISOString(),
      ingredient: {
        id: "ing-1",
        name: "Organic Flour",
        unit: "kg"
      }
    },
    {
      id: "tx-2",
      vendorId,
      ingredientId: "ing-2", 
      type: "purchase",
      quantity: 200,
      unitCost: 0.33,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      ingredient: {
        id: "ing-2",
        name: "Fresh Eggs",
        unit: "unit"
      }
    },
    {
      id: "tx-3",
      vendorId,
      ingredientId: "ing-1",
      type: "sale",
      quantity: -5,
      unitCost: 2.45,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      ingredient: {
        id: "ing-1",
        name: "Organic Flour", 
        unit: "kg"
      }
    }
  ];
  
  // Filter by type if specified
  const filteredTransactions = type && type !== 'all' 
    ? transactions.filter(tx => tx.type === type)
    : transactions;
  
  res.json(filteredTransactions);
});

app.post("/api/inventory/vendor/:vendorId/link-recipe", (req, res) => {
  const { vendorId } = req.params;
  const { productId, recipeId } = req.body;
  
  // Mock product update
  const updatedProduct = {
    id: productId,
    vendor_id: vendorId,
    name: "Sample Product",
    recipeId,
    // ... other product fields
  };
  
  res.json(updatedProduct);
});

// Restock endpoints for the live restock feature
app.get("/api/restock/vendor/:vendorId/suggestions", (req, res) => {
  const { vendorId } = req.params;
  const lookbackDays = parseInt(req.query.lookbackDays as string) || 30;
  
  // Generate mock restock suggestions based on inventory data
  const suggestions = [
    {
      ingredientId: "ing-1",
      name: "Organic Flour",
      onHand: 5.5,
      dailyVelocity: 2.3,
      leadTimeDays: 5,
      reorderPoint: 17.25,
      suggestedQty: 20.0,
      preferredSupplierId: null
    },
    {
      ingredientId: "ing-2",
      name: "Fresh Eggs",
      onHand: 45,
      dailyVelocity: 8.5,
      leadTimeDays: 3,
      reorderPoint: 38.25,
      suggestedQty: 50.0,
      preferredSupplierId: null
    },
    {
      ingredientId: "ing-3",
      name: "Butter",
      onHand: 1.2,
      dailyVelocity: 0.8,
      leadTimeDays: 7,
      reorderPoint: 10.8,
      suggestedQty: 15.0,
      preferredSupplierId: null
    }
  ];
  
  res.json(suggestions);
});

app.post("/api/restock/vendor/:vendorId/purchase-order", (req, res) => {
  const { vendorId } = req.params;
  const { supplierId, lines } = req.body;
  
  // Generate a mock PO number
  const poNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  
  // Calculate total amount
  const totalAmount = lines?.reduce((sum: number, line: any) => sum + (line.quantity * line.unitCost), 0) || 0;
  
  const purchaseOrder = {
    poNumber,
    vendorId,
    supplierId: supplierId || null,
    lines: lines || [],
    status: 'draft',
    createdAt: new Date().toISOString(),
    totalAmount
  };
  
  res.status(201).json(purchaseOrder);
});

// Messaging endpoints for the live messaging feature
app.get("/api/messages/conversations", (req, res) => {
  const { vendorId, status, q } = req.query;
  
  // Generate mock conversations
  const conversations = [
    {
      id: "conv-1",
      vendorId: vendorId || "dev-user-id",
      customerId: "customer-1",
      subject: "Order #12345 - Missing item",
      status: status || "awaiting_vendor",
      tags: ["urgent", "missing-item"],
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: "msg-1",
          conversationId: "conv-1",
          senderRole: "customer",
          senderId: "customer-1",
          body: "Hi, I received my order but the sourdough bread was missing. Can you help?",
          attachments: [],
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          readBy: [],
          sentiment: "neutral"
        }
      ]
    },
    {
      id: "conv-2",
      vendorId: vendorId || "dev-user-id",
      customerId: "customer-2",
      subject: "Question about ingredients",
      status: "open",
      tags: ["question"],
      lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      messages: [
        {
          id: "msg-2",
          conversationId: "conv-2",
          senderRole: "customer",
          senderId: "customer-2",
          body: "Do you use organic flour in your bread?",
          attachments: [],
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          readBy: [],
          sentiment: "positive"
        }
      ]
    }
  ];
  
  res.json(conversations);
});

app.post("/api/messages/conversations", (req, res) => {
  const { vendorId, customerId, subject } = req.body;
  
  const conversation = {
    id: `conv-${Date.now()}`,
    vendorId,
    customerId,
    subject: subject || `Conversation with ${customerId}`,
    status: "open",
    tags: [],
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.status(201).json(conversation);
});

app.get("/api/messages/conversations/:id", (req, res) => {
  const { id } = req.params;
  
  const conversation = {
    id,
    vendorId: "dev-user-id",
    customerId: "customer-1",
    subject: "Order #12345 - Missing item",
    status: "awaiting_vendor",
    tags: ["urgent", "missing-item"],
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: "msg-1",
        conversationId: id,
        senderRole: "customer",
        senderId: "customer-1",
        body: "Hi, I received my order but the sourdough bread was missing. Can you help?",
        attachments: [],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        readBy: [],
        sentiment: "neutral"
      },
      {
        id: "msg-2",
        conversationId: id,
        senderRole: "vendor",
        senderId: "dev-user-id",
        body: "I'm so sorry about that! Let me check your order and get back to you right away.",
        attachments: [],
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        readBy: ["customer-1"],
        sentiment: "positive"
      }
    ],
    issues: []
  };
  
  res.json(conversation);
});

app.post("/api/messages/conversations/:id/message", (req, res) => {
  const { id } = req.params;
  const { body, attachments } = req.body;
  
  const message = {
    id: `msg-${Date.now()}`,
    conversationId: id,
    senderRole: "vendor",
    senderId: "dev-user-id",
    body,
    attachments: attachments || [],
    createdAt: new Date().toISOString(),
    readBy: [],
    sentiment: "neutral"
  };
  
  res.status(201).json(message);
});

app.patch("/api/messages/conversations/:id/read", (req, res) => {
  res.json({ success: true });
});

// Issues endpoints
app.post("/api/issues", (req, res) => {
  const { conversationId, orderId, type, notes } = req.body;
  
  const issue = {
    id: `issue-${Date.now()}`,
    conversationId,
    orderId,
    type,
    status: "open",
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.status(201).json(issue);
});

app.patch("/api/issues/:id", (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  const issue = {
    id,
    conversationId: "conv-1",
    orderId: "order-123",
    type: "missing",
    status,
    notes,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.json(issue);
});

// Discounts endpoints
app.post("/api/discounts/quick", (req, res) => {
  const { vendorId, type, amount, ttlHours = 168, maxUses } = req.body;
  
  const code = `APOL-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + ttlHours);
  
  res.status(201).json({
    code,
    display: `${type === 'percent' ? amount + '%' : '$' + amount} off`,
    expiresAt,
    maxUses
  });
});

// Stripe Connect endpoints
app.post("/api/stripe/connect/onboard", (req, res) => {
  res.json({
    url: "https://connect.stripe.com/setup/s/test-account-link"
  });
});

app.get("/api/stripe/connect/status/:vendorId", (req, res) => {
  res.json({
    connected: true,
    charges_enabled: true,
    payouts_enabled: true,
    details_submitted: true
  });
});

// Checkout endpoints
app.post("/api/checkout/create-intent", (req, res) => {
  res.json({
    clientSecret: "pi_test_client_secret_" + Math.random().toString(36).substr(2, 8),
    orderId: "order_" + Math.random().toString(36).substr(2, 8)
  });
});

app.post("/api/checkout/webhook", (req, res) => {
  res.json({ received: true });
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
logger.info(`👥 Customer endpoints: http://localhost:${PORT}/api/customers`);
  logger.info(`👨‍🍳 Recipe endpoints: http://localhost:${PORT}/api/recipes`);
  logger.info(`🛒 Order endpoints: http://localhost:${PORT}/api/orders`);
  logger.info(`📦 Vendor Order endpoints: http://localhost:${PORT}/api/vendor/orders`);
  logger.info(`📦 Fulfillment endpoints: http://localhost:${PORT}/api/fulfillment`);
  logger.info(`📦 Inventory endpoints: http://localhost:${PORT}/api/inventory`);
  logger.info(`🏪 Supplier endpoints: http://localhost:${PORT}/api/supplier`);
});