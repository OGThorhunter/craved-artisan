import express from 'express';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createLogger, format, transports } from 'winston';
import dotenv from 'dotenv';

// Import mock routes only
import authRoutes from './routes/auth-test';
import protectedRoutes from './routes/protected-demo';
import vendorRoutes from './routes/vendor-mock';
import vendorProductsRoutes from './routes/vendor-products-mock';
import ingredientRoutes from './routes/ingredients-mock';
import recipeRoutes from './routes/recipes-mock';
import inventoryDeductionRoutes from './routes/inventory-deduction';
import supplierMarketplaceRoutes from './routes/supplier-marketplace';

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
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session middleware (using memory store)
app.use(session({
  store: new MemoryStore(),
  secret: process.env.SESSION_SECRET || 'mock-secret-key',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to false for development
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
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

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'craved-artisan-server',
    mode: 'MOCK'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/vendor/products', vendorProductsRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/inventory', inventoryDeductionRoutes);
app.use('/api/supplier', supplierMarketplaceRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running in MOCK MODE on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  logger.info(`🛡️ Protected endpoints: http://localhost:${PORT}/api/protected`);
  logger.info(`🏪 Vendor endpoints: http://localhost:${PORT}/api/vendor`);
  logger.info(`📦 Product endpoints: http://localhost:${PORT}/api/vendor/products`);
  logger.info(`🥘 Ingredient endpoints: http://localhost:${PORT}/api/ingredients`);
  logger.info(`👨‍🍳 Recipe endpoints: http://localhost:${PORT}/api/recipes`);
  logger.info(`📦 Inventory endpoints: http://localhost:${PORT}/api/inventory`);
  logger.info(`🏪 Supplier endpoints: http://localhost:${PORT}/api/supplier`);
}); 