import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { logger } from './logger';
import { sessionMiddleware, attachUser } from './middleware/session-simple';
import authRoutes from './routes/auth';
import { pulseRouter } from './routes/pulse.router';
import { vendorRouter } from './routes/vendor.router';
import { ingredientsRouter } from './routes/ingredients.router';
import { inventoryRouter } from './routes/inventory.router';
import { aiInsightsRouter } from './routes/ai-insights.router';
import { b2bNetworkRouter } from './routes/b2b-network.router';
import { aiReceiptParserRouter } from './routes/ai-receipt-parser.router';
import { unitConverterRouter } from './routes/unit-converter.router';
import { advancedInventoryRouter } from './routes/advanced-inventory.router';
import { crmRouter } from './routes/crm.router';
import { labelProfilesRouter } from './routes/label-profiles.router';

const app = express();
const PORT = Number(process.env.PORT || 3001);

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS middleware - must come before session middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://[::1]:5173'], // Frontend URL (IPv4 and IPv6)
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Session middleware
app.use(sessionMiddleware);
app.use(attachUser);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now(), message: 'Session-based auth server running' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Pulse routes
app.use('/api', pulseRouter);

// Vendor routes
app.use('/api', vendorRouter);

// Ingredients routes
app.use('/api', ingredientsRouter);

// Inventory routes
app.use('/api', inventoryRouter);

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

// Start server
app.listen(PORT, () => {
  logger.info({ port: PORT, pid: process.pid }, '🚀 Session-based auth server listening');
  logger.info(`📍 Health check: http://localhost:${PORT}/api/health`);
  logger.info(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  logger.info(`📊 Pulse endpoints: http://localhost:${PORT}/api/vendor/:vendorId/pulse`);
});

export default app; 