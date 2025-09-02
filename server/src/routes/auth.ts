import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { logger } from '../logger';
import { requireAuth } from '../middleware/session-simple';
import type { LoginRequest, RegisterRequest, AuthResponse, AuthenticatedRequest } from '../types/session';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['VENDOR', 'CUSTOMER'])
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password }: LoginRequest = req.body;
    
    // Validate input
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: validation.error.errors
      });
    }

    // TODO: Replace with actual database query
    // For now, use mock data
    if (email === 'test@example.com' && password === 'password123') {
      console.log('🔍 [DEBUG] Login successful, setting session data...');
      console.log('🔍 [DEBUG] Session ID before:', req.sessionID);
      console.log('🔍 [DEBUG] Session data before:', JSON.stringify(req.session, null, 2));
      
      req.session.userId = 'mock-user-id';
      req.session.email = email;
      req.session.role = 'VENDOR';
      
      console.log('🔍 [DEBUG] Session data after setting:', JSON.stringify(req.session, null, 2));
      
      // Force session save
      req.session.save((err) => {
        if (err) {
          console.error('🔍 [DEBUG] Session save error:', err);
        } else {
          console.log('🔍 [DEBUG] Session saved successfully');
        }
      });
      
      logger.info({ email, userId: req.session.userId }, 'User logged in');
      
      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          userId: req.session.userId,
          email: req.session.email,
          role: req.session.role,
          isAuthenticated: true,
          lastActivity: new Date()
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });

  } catch (error) {
    logger.error({ error }, 'Login error');
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role }: RegisterRequest = req.body;
    
    // Validate input
    const validation = registerSchema.safeParse({ email, password, name, role });
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: validation.error.errors
      });
    }

    // TODO: Replace with actual database insertion
    // For now, just return success
    logger.info({ email, name, role }, 'User registration attempted');
    
    return res.json({
      success: true,
      message: 'Registration successful (mock)',
      user: {
        userId: 'mock-new-user-id',
        email,
        role,
        isAuthenticated: false,
        lastActivity: new Date()
      }
    });

  } catch (error) {
    logger.error({ error }, 'Registration error');
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout route
router.post('/logout', requireAuth, (req: AuthenticatedRequest, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error({ error: err }, 'Logout error');
      return res.status(500).json({
        success: false,
        message: 'Error during logout'
      });
    }
    
    logger.info({ userId: req.user?.userId }, 'User logged out');
    return res.json({
      success: true,
      message: 'Logout successful'
    });
  });
});

// Check session route
router.get('/session', (req, res) => {
  if (req.session.userId) {
    return res.json({
      success: true,
      user: {
        userId: req.session.userId,
        email: req.session.email,
        role: req.session.role,
        isAuthenticated: true,
        lastActivity: new Date()
      }
    });
  }
  
  return res.status(401).json({
    success: false,
    message: 'No active session'
  });
});

export default router;
