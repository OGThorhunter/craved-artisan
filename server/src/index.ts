import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { createLogger, format, transports } from 'winston';
import { errorHandler } from './middleware/errorHandler';
import { env } from './utils/validateEnv';
import { logCors, corsWithLogging } from './middleware/logCors';
import { helmetConfig, devHelmetConfig } from './middleware/helmetConfig';
import authRoutes from './routes/auth-test';
import protectedRoutes from './routes/protected-demo';
import vendorRoutes from './routes/vendor';
import vendorProductsRoutes from './routes/vendor-products';
import vendorRecipesRoutes from './routes/vendor-recipes';
import vendorOrdersRoutes from './routes/vendor-orders';
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
import debugRoutes from './routes/debug';
import { initializeTaxReminderCron } from './services/taxReminderCron';

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
  logger.info(`Database URL: ${env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
  logger.info(`Node Environment: ${env.NODE_ENV}`);
  logger.info(`Session Secret: ${env.SESSION_SECRET ? '✅ Set' : '❌ Missing'}`);
} catch (error) {
  logger.error('Environment validation failed:', error);
  process.exit(1);
}

// Session store
const PostgresStore = pgSession(session);

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  store: new PostgresStore({
    conString: env.DATABASE_URL,
    tableName: 'sessions',
    createTableIfMissing: true,
  }),
  secret: env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
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

// Health check endpoint
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
app.use('/api/vendor', vendorRoutes);
app.use('/api/vendor/products', vendorProductsRoutes);
app.use('/api/vendor/recipes', vendorRecipesRoutes);
app.use('/api/vendor/orders', vendorOrdersRoutes);
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

// Debug routes (development only)
if (env.NODE_ENV === 'development') {
  app.use('/api/_debug', debugRoutes);
}

app.use('/api/products', (req, res) => {
  res.json({ message: 'Product routes - to be implemented' });
});

app.use('/api/users', (req, res) => {
  res.json({ message: 'User routes - to be implemented' });
});

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
app.listen(PORT, () => {
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
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app; 