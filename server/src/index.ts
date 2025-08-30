import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
// import pgSession from 'connect-pg-simple';
import { createLogger, format, transports } from 'winston';
import rateLimit from 'express-rate-limit';
import { LRUCache } from 'lru-cache';
import helmet from 'helmet';
import compression from 'compression';
import pino from 'pino-http';
import { v4 as uuid } from 'uuid';
import * as Sentry from '@sentry/node';
import { errorHandler } from './middleware/errorHandler';
import { env } from './utils/validateEnv';
import { logCors, corsWithLogging, getCorsConfigForSession } from './middleware/logCors';
import { helmetConfig, devHelmetConfig } from './middleware/helmetConfig';
import { healthz, readyz } from './infra/health';
import authRoutes from '../routes/auth';
import protectedRoutes from './routes/protected-demo';
import vendorRoutes from './routes/vendor';
import vendorProductsRoutes from './routes/vendor-products';
import vendorRecipesRoutes from './routes/vendor-recipes';
import vendorOrdersRoutes from './routes/vendor-orders';
import vendorProductsRouter from '../routes/vendorProducts';
import ingredientRoutes from './routes/ingredients';
import recipeRoutes from './routes/recipes';
import orderRoutes from './routes/orders';
import fulfillmentRoutes from './routes/fulfillment';
import routeOptimizationRoutes from './routes/route-optimization';
import financialRoutes from './routes/financial';
import stripeRoutes from './routes/stripe';
import stripeControllerRoutes from './routes/stripe-controller';
import checkoutRoutes from './routes/checkout';
import webhookRoutes from './routes/webhooks';
import vendorPayoutRoutes from './routes/vendor-payouts';
import aiValidationRoutes from './routes/ai-validation';
import payoutReportsRoutes from './routes/payout-reports';
import taxReportsRoutes from './routes/tax-reports';
import marginManagementRoutes from './routes/margin-management';
import taxProjectionRoutes from './routes/tax-projection';
import analyticsRoutes from './routes/analyticsRoutes';
import analyticsRouter from './routes/analytics.routes';
import financialsRouter from './routes/financials.routes';
import productAnalyticsRouter from './routes/product-analytics.routes';
import inventoryRouter from './routes/inventory.routes';
import restockRouter from './routes/restock.routes';
import messagesRouter from './routes/messages.routes';
import issuesRouter from './routes/issues.routes';
import discountsRouter from './routes/discounts.routes';
import stripeRouter from './routes/stripe.routes';
import checkoutRouter from './routes/checkout.routes';
import taxRouter from './routes/tax.routes';
import dashboardRouter from './routes/dashboard.routes';
import debugRoutes from './routes/debug';
import vendorRouter from './routes/vendor.routes';
import productRouter from './routes/product.routes';
import { initializeTaxReminderCron } from './services/taxReminderCron';
import prisma from './lib/prisma';

// Load environment variables
dotenv.config();

// Initialize Sentry
// Temporarily disabled to fix server startup
// if (env.SENTRY_DSN) {
//   Sentry.init({ 
//     dsn: env.SENTRY_DSN, 
//     environment: env.NODE_ENV, 
//     release: env.SENTRY_RELEASE 
//   });
// }

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

// Trust proxy in production for secure cookies
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Observability middleware
app.use(pino({ 
  genReqId: () => uuid(), 
  customSuccessMessage: () => "ok" 
}));
app.use((req, res, next) => { 
  res.setHeader("x-request-id", (req as any).id); 
  next(); 
});

// Security middleware
app.use(helmet({ 
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" } 
}));
app.use(compression());

// CORS configuration
const ALLOW_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({ 
  origin: ALLOW_ORIGIN, 
  credentials: true 
}));

// Validate environment variables
try {
  logger.info('Validating environment variables...');
  logger.info(`Database URL: ${env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
  logger.info(`Node Environment: ${env.NODE_ENV}`);
  logger.info(`Session Secret: ${env.SESSION_SECRET ? '✅ Set' : '❌ Missing'}`);
} catch (error) {
  logger.error('Environment validation failed:', error);
  process.exit(1);
}

// Session store - using default memory store for SQLite compatibility
// const PostgresStore = pgSession(session);

// Middleware
// Use environment-specific helmet configuration
if (env.NODE_ENV === 'development') {
  app.use(devHelmetConfig);
} else {
  app.use(helmetConfig);
}

// CORS logging middleware
app.use(logCors);

// CORS configuration with logging
app.use(cors(corsWithLogging));

// Middleware in correct order: express.json() -> cookieParser -> session
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware - using default memory store for SQLite compatibility
app.use(session({
  secret: env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    name: 'ca.sid',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: false,
    sameSite: 'lax',
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 400, // limit each IP to 400 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Simple LRU cache for GET endpoints
const cache = new LRUCache<string, any>({
  max: 500, // Maximum number of items
  ttl: 30 * 1000, // 30 seconds TTL
});

// Cache middleware for GET requests
app.use((req, res, next) => {
  if (req.method === 'GET' && (req.path.startsWith('/api/products') || req.path.startsWith('/api/vendors'))) {
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    if (cached) {
      return res.json(cached);
    }
    
    // Store original send method
    const originalSend = res.json;
    res.json = function(data) {
      cache.set(key, data);
      return originalSend.call(this, data);
    };
  }
  next();
});

// Health check endpoints
app.get('/healthz', healthz);
app.get('/readyz', readyz);

// Legacy health endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'craved-artisan-server'
  });
});

// Test error route to verify Winston logging
app.get('/test-error', (req, res) => {
  logger.info('Test error route accessed');
  throw new Error('This is a test error to verify Winston logging');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/vendor/products', vendorProductsRoutes);
app.use('/api/vendor/recipes', vendorRecipesRoutes);
app.use('/api/vendor/orders', vendorOrdersRoutes);
app.use('/api/vendor', vendorRoutes);
app.use(vendorProductsRouter); // Bulletproof route that works with or without session
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/fulfillment', fulfillmentRoutes);
app.use('/api/route', routeOptimizationRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/stripe-controller', stripeControllerRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/vendor-payouts', vendorPayoutRoutes);
app.use('/api/ai-validation', aiValidationRoutes);
app.use('/api/payout-reports', payoutReportsRoutes);
app.use('/api/tax-reports', taxReportsRoutes);
app.use('/api/margin-management', marginManagementRoutes);
app.use('/api/tax-projection', taxProjectionRoutes);
app.use('/api', analyticsRoutes);
app.use('/api/analytics', analyticsRouter);
app.use('/api/financials', financialsRouter);
app.use('/api/analytics', productAnalyticsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/restock', restockRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/discounts', discountsRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/tax', taxRouter);
app.use('/api/dashboard', dashboardRouter);

// Debug routes (development only)
if (env.NODE_ENV === 'development') {
  app.use('/api/_debug', debugRoutes);
  
  // Auth diagnostic route
  app.get('/api/_health/auth', (req, res) => {
    const hasSessionObject = !!req.session;
    const sessionId = req.sessionID;
    
    if (!req.session) {
      return res.status(500).json({ 
        code: "NO_SESSION_MIDDLEWARE",
        message: "Session middleware not working",
        hasSessionObject,
        sessionId
      });
    }
    
    res.json({
      code: "SESSION_OK",
      message: "Session middleware working",
      hasSessionObject,
      sessionId,
      sessionData: req.session
    });
  });
}

// Mount new vendor and product routes
app.use('/api/vendors', vendorRouter);
app.use('/api/products', productRouter);

// 404 handler
app.use('*', (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
  
  // Initialize tax reminder CRON jobs
  if (env.NODE_ENV === 'production') {
    initializeTaxReminderCron();
    logger.info('Tax reminder CRON jobs initialized');
  } else {
    logger.info('Tax reminder CRON jobs disabled in development mode');
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(async () => { 
    await prisma.$disconnect(); 
    process.exit(0); 
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(async () => { 
    await prisma.$disconnect(); 
    process.exit(0); 
  });
});

export default app; 