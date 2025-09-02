import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { logger } from './logger';
import { sessionMiddleware, attachUser } from './middleware/session-simple';
import authRoutes from './routes/auth';
import { pulseRouter } from './routes/pulse.router';

const app = express();
const PORT = Number(process.env.PORT || 3001);

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS middleware - must come before session middleware
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
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

// Start server
app.listen(PORT, () => {
  logger.info({ port: PORT, pid: process.pid }, '🚀 Session-based auth server listening');
  logger.info(`📍 Health check: http://localhost:${PORT}/api/health`);
  logger.info(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  logger.info(`📊 Pulse endpoints: http://localhost:${PORT}/api/vendor/:vendorId/pulse`);
});

export default app; 