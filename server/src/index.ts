import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { logger } from './logger';
import { sessionMiddleware, attachUser } from './middleware/session-redis';
import { requestContext } from './middleware/request-context';
import { cronJobs } from './services/cron-jobs';
import authRoutes from './routes/auth';
import { pulseRouter } from './routes/pulse.router';
import { vendorRouter } from './routes/vendor.router';
import { ingredientsRouter } from './routes/ingredients.router';
// import { inventoryRouter } from './routes/inventory.router'; // Temporarily disabled
import aiInsightsRouter from './routes/ai-insights.router';
import { b2bNetworkRouter } from './routes/b2b-network.router';
import { aiReceiptParserRouter } from './routes/ai-receipt-parser.router';
import { unitConverterRouter } from './routes/unit-converter.router';
import { advancedInventoryRouter } from './routes/advanced-inventory.router';
import { crmRouter } from './routes/crm.router';
import { labelProfilesRouter } from './routes/label-profiles.router';
import { analyticsRouter } from './routes/analytics.router';
import labelsRouter from './routes/labels';
import productsRouter from './routes/products.router';
import aiProductsRouter from './routes/ai-products.router';
import productsImportRouter from './routes/products-import.router';
import salesWindowsRouter from './routes/sales-windows.router';
import inventoryManagementRouter from './routes/inventory-management.router';
import inventoryInsightsRouter from './routes/inventory-insights.router';
import inventoryReceiptParserRouter from './routes/inventory-receipt-parser.router';
import inventoryShortfallRouter from './routes/inventory-shortfall.router';
import inventoryExportRouter from './routes/inventory-export.router';
import inventoryItemsRouter from './routes/inventory-items.router';
import systemMessagesRouter from './routes/system-messages.router';
// AI Routes
import aiReceiptRouter from './routes/ai-receipt.router';
import aiSystemMessagesRouter from './routes/ai-system-messages.router';

// Promotions System Routes
import { promotionsRouter } from './routes/promotions.router';
import { socialMediaRouter } from './routes/social-media.router';
import { loyaltyRouter } from './routes/loyalty.router';
import { promotionsAnalyticsRouter } from './routes/promotions-analytics.router';

// Settings & Account Hub Routes
import settingsRouter from './routes/settings';
import stripeWebhooksRouter from './routes/webhooks/stripe';
import vendorSubscriptionRouter from './routes/vendor-subscription.router';

// Orders Management Routes
import ordersManagementRouter from './routes/orders-management.router';
import ordersViewsRouter from './routes/orders-views.router';
import ordersPrintingRouter from './routes/orders-printing.router';
import ordersCustomFieldsRouter from './routes/orders-custom-fields.router';
import aiOrdersInsightsRouter from './routes/ai-orders-insights.router';
import customerOrdersRouter from './routes/customer-orders.router';

// Label Management Routes
import labelsManagementRouter from './routes/labels-management.router';
import labelsSmartQueueRouter from './routes/labels-smart-queue.router';

// Marketplace Routes
import marketplaceSearchRouter from './routes/marketplace-search.router';
import marketplaceFavoritesRouter from './routes/marketplace-favorites.router';
import marketplaceSavedSearchesRouter from './routes/marketplace-saved-searches.router';
import marketplaceTrackingRouter from './routes/marketplace-tracking.router';
import marketplaceEmbeddingsRouter from './routes/marketplace-embeddings.router';

// Contact Routes
import contactRouter from './routes/contact.router';

// Newsletter Routes
import { newsletterRouter } from './routes/newsletter.router';

// Events Routes
import eventsSearchRouter from './routes/events-search.router';
import eventsDetailRouter from './routes/events-detail.router';
import eventsManagementRouter from './routes/events-management.router';
import eventsCoordinatorRouter from './routes/events-coordinator.router';

// Legal & Coordinator Routes
import legalRouter from './routes/legal';
import coordinatorRouter from './routes/coordinator';

// Maintenance Routes
import maintenanceRouter from './routes/maintenance.router';

// Status/Health Check Routes
import statusRouter from './routes/status.router';

// Check-in & Refunds/Payouts Routes
import checkinRouter from './routes/checkin.router';
import refundsPayoutsRouter from './routes/refunds-payouts.router';

// Admin Routes
import adminOverviewRouter from './routes/admin-overview.router';
import adminSLORouter from './routes/admin-slo.router';
import adminMessagesRouter from './routes/admin-messages.router';
import adminStripeRouter from './routes/admin-stripe.router';
import adminOpsRouter from './routes/admin-ops.router';
import adminMarketplaceRouter from './routes/admin-marketplace.router';
import adminTrustSafetyRouter from './routes/admin-trust-safety.router';
import adminGrowthSocialRouter from './routes/admin-growth-social.router';
import adminSecurityComplianceRouter from './routes/admin-security-compliance.router';
import adminUsersRouter from './routes/admin-users.router';
import adminAuditRouter from './routes/admin-audit.router';
import adminRevenueRouter from './routes/admin-revenue.router';
import adminSupportRouter from './routes/admin-support.router';
import adminPLRouter from './routes/admin-pl.router';
import adminSettingsRouter from './routes/admin-settings.router';

const app = express();
const PORT = Number(process.env.PORT || 3001);

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS origin logging middleware (for debugging production issues)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const method = req.method;
  
  if (origin && (method === 'OPTIONS' || process.env.NODE_ENV === 'production')) {
    logger.info({
      method,
      origin,
      path: req.path,
      userAgent: req.headers['user-agent']
    }, 'CORS request received');
  }
  
  next();
});

// Define CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'http://[::1]:5173',
    // Render production URLs (will be set via env vars)
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
    ...(process.env.NODE_ENV === 'production' ? [
      'https://cravedartisan-web.onrender.com',
      'https://www.cravedartisan.com',
      'https://cravedartisan.com'
    ] : [])
  ],
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// CORS middleware - must come before session middleware
app.use(cors(corsOptions));

// Explicit OPTIONS preflight handler for all routes
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(sessionMiddleware);
app.use(attachUser);

// Request context middleware (for audit logging)
app.use(requestContext);

// Health check endpoints
app.get('/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now(), message: 'Session-based auth server running' });
});

app.get('/readyz', (_req, res) => {
  res.json({ ok: true, ts: Date.now(), message: 'Session-based auth server running' });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now(), message: 'Session-based auth server running' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Legal & Coordinator routes
app.use('/api/legal', legalRouter);
app.use('/api/coordinator', coordinatorRouter);

// Newsletter routes
app.use('/api/newsletter', newsletterRouter);

// Maintenance routes
app.use('/api/maintenance', maintenanceRouter);

// Status/Health Check routes (comprehensive infrastructure checks)
app.use('/api/status', statusRouter);

// Pulse routes
app.use('/api', pulseRouter);

// Vendor routes
app.use('/api', vendorRouter);

// Ingredients routes
app.use('/api', ingredientsRouter);

// Inventory routes (temporarily disabled - import commented out at top)
// app.use('/api', inventoryRouter); // Temporarily disabled to debug

// AI Insights routes
app.use('/api', aiInsightsRouter);

// B2B Network routes
app.use('/api', b2bNetworkRouter);

// AI Receipt Parser routes
app.use('/api', aiReceiptParserRouter);

// Unit Converter routes
app.use('/api', unitConverterRouter);

// Advanced Inventory routes
app.use('/api', advancedInventoryRouter);

// CRM routes
app.use('/api', crmRouter);

// Label system routes
app.use('/api', labelProfilesRouter);
// app.use('/api/labels', labelsRouter); // Temporarily disabled due to middleware issue

// Analytics routes
app.use('/api', analyticsRouter);

// Products routes
app.use('/api/vendor', productsRouter);
app.use('/api/vendor/ai', aiProductsRouter);
app.use('/api/vendor', productsImportRouter);

// Sales Windows routes
app.use('/api/vendor/sales-windows', salesWindowsRouter);

// Inventory Management routes
app.use('/api/vendor/inventory', inventoryManagementRouter);
app.use('/api/vendor/inventory', inventoryInsightsRouter);
app.use('/api/vendor/inventory', inventoryReceiptParserRouter);
app.use('/api/vendor/inventory', inventoryShortfallRouter);
app.use('/api/vendor/inventory', inventoryExportRouter);
app.use('/api/inventory', inventoryItemsRouter);

// System Messages routes
app.use('/api/vendor/system-messages', systemMessagesRouter);

// AI Routes
app.use('/api/ai/receipt', aiReceiptRouter);
app.use('/api/ai/insights', aiInsightsRouter);
app.use('/api/ai/system-messages', aiSystemMessagesRouter);

// Promotions System Routes
app.use('/api/vendor/promotions', promotionsRouter);
app.use('/api/vendor/social-media', socialMediaRouter);
app.use('/api/vendor/loyalty', loyaltyRouter);
app.use('/api/vendor/promotions-analytics', promotionsAnalyticsRouter);

// Vendor Subscription Routes
app.use('/api/vendor-subscription', vendorSubscriptionRouter);

// Orders Management Routes
app.use('/api/vendor/orders', ordersManagementRouter);
app.use('/api/vendor/orders', ordersViewsRouter);
app.use('/api/vendor/orders', ordersPrintingRouter);
app.use('/api/vendor/order-field-defs', ordersCustomFieldsRouter);
app.use('/api/ai/insights', aiOrdersInsightsRouter);

// Customer Routes
import customerRouter from './routes/customer.router';
app.use('/api/customer', customerRouter);
app.use('/api/orders', customerOrdersRouter);

// Label Management Routes
app.use('/api/vendor/labels', labelsManagementRouter);
app.use('/api/vendor/labels', labelsSmartQueueRouter);

// Marketplace Routes
app.use('/api/market', marketplaceSearchRouter);
app.use('/api/user/favorites', marketplaceFavoritesRouter);
app.use('/api/market/saved-search', marketplaceSavedSearchesRouter);
app.use('/api/market/track', marketplaceTrackingRouter);
app.use('/api/market/embeddings', marketplaceEmbeddingsRouter);

// Contact Routes
app.use('/', contactRouter);

// Events Routes
app.use('/api/events', eventsSearchRouter);
app.use('/api/events', eventsDetailRouter);
app.use('/api/events', eventsManagementRouter);
app.use('/api/events', eventsCoordinatorRouter);

// Check-in & Refunds/Payouts Routes
app.use('/api/checkin', checkinRouter);
app.use('/api/refunds-payouts', refundsPayoutsRouter);

// Admin Routes
app.use('/api/admin', adminOverviewRouter);
app.use('/api/admin', adminSLORouter);
app.use('/api/admin', adminMessagesRouter);
app.use('/api/admin', adminStripeRouter);
app.use('/api/admin', adminOpsRouter);
app.use('/api/admin', adminMarketplaceRouter);
app.use('/api/admin', adminTrustSafetyRouter);
app.use('/api/admin', adminGrowthSocialRouter);
app.use('/api/admin', adminSecurityComplianceRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/admin/audit', adminAuditRouter);
app.use('/api/admin/revenue', adminRevenueRouter);
app.use('/api/admin/support', adminSupportRouter);
app.use('/api/admin/pl', adminPLRouter);
app.use('/api/admin', adminSettingsRouter);

// Settings & Account Hub routes
app.use('/api/settings', settingsRouter);
app.use('/webhooks/stripe', stripeWebhooksRouter);

// Start server
app.listen(PORT, () => {
  logger.info({ port: PORT, pid: process.pid }, '🚀 Session-based auth server listening');
  logger.info(`📍 Health check: http://localhost:${PORT}/api/health`);
  logger.info(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  logger.info(`📊 Pulse endpoints: http://localhost:${PORT}/api/vendor/:vendorId/pulse`);
  logger.info(`👑 Admin dashboard: http://localhost:${PORT}/admin`);
  logger.info(`🎫 Support system: http://localhost:${PORT}/api/admin/support`);
  
  // Start cron jobs
  cronJobs.startAllJobs().catch((error) => {
    logger.error({ error }, 'Failed to start cron jobs');
  });
  
  // Initialize support system workers
  if (process.env.USE_BULLMQ === 'true') {
    import('./jobs/support-sla-check').then(({ initSlaCheckWorker, scheduleSlaChecks }) => {
      initSlaCheckWorker();
      scheduleSlaChecks();
    });
    
    import('./jobs/support-auto-close').then(({ initAutoCloseWorker, scheduleAutoClose }) => {
      initAutoCloseWorker();
      scheduleAutoClose();
    });
    
    import('./jobs/support-email-queue').then(({ initEmailWorker }) => {
      initEmailWorker();
    });
    
    import('./jobs/support-ai-triage').then(({ initAITriageWorker }) => {
      initAITriageWorker();
    });
    
    logger.info('✅ Support system BullMQ workers initialized');
  } else {
    logger.info('⚙️  Support system using node-cron fallback (BullMQ disabled)');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  cronJobs.stopAllJobs();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  cronJobs.stopAllJobs();
  process.exit(0);
});

export default app; 