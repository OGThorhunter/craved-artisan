import { Router } from 'express';
import * as bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma';

// Extend Express session interface
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      name?: string;
      vendorId?: string;
      role: string;
    };
  }
}

const router = Router();

// GET /api/auth/session - Get current session
router.get('/session', (req, res) => {
  try {
    if (req.session && req.session.user) {
      res.json({
        user: req.session.user,
        authenticated: true
      });
    } else {
      res.status(401).json({
        code: 'NO_SESSION',
        message: 'No active session'
      });
    }
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({
      code: 'SESSION_ERROR',
      message: 'Error checking session'
    });
  }
});

// POST /api/auth/login - Dev mock login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        code: 'MISSING_CREDENTIALS',
        message: 'Email and password are required'
      });
    }

    // Dev mock login - only allow dev@local / dev
    if (email === 'dev@local' && password === 'dev') {
      req.session.user = {
        id: 'dev',
        email: 'dev@local',
        name: 'Development User',
        vendorId: 'dev-user-id',
        role: 'vendor'
      };

      res.json({
        message: 'Login successful',
        user: req.session.user
      });
    } else {
      res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      code: 'LOGIN_ERROR',
      message: 'Error during login'
    });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({
          code: 'LOGOUT_ERROR',
          message: 'Error during logout'
        });
      }
      res.json({ message: 'Logout successful' });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      code: 'LOGOUT_ERROR',
      message: 'Error during logout'
    });
  }
});

// GET /api/auth/dev-login - Dev only endpoint for quick login
router.get('/dev-login', (req, res) => {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    // Set dev user session
    req.session.user = {
      id: 'dev',
      vendorId: 'dev-user-id',
      role: 'vendor',
      email: 'dev@local'
    };

    // Save session
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({
          code: 'SESSION_ERROR',
          message: 'Failed to save session'
        });
      }

      console.log('Dev login successful, session saved');
      
      // Redirect to home page
      res.redirect('/');
    });
  } catch (error) {
    console.error('Dev login error:', error);
    res.status(500).json({
      code: 'DEV_LOGIN_ERROR',
      message: 'Error during dev login'
    });
  }
});

// GET /api/_health/auth - Health check for authentication
router.get('/_health/auth', (req, res) => {
  try {
    const hasSession = !!req.session;
    const user = req.session?.user || null;
    const sid = req.sessionID || null;

    res.json({
      hasSession,
      user,
      sid,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Auth health check error:', error);
    res.status(500).json({
      error: 'Health check failed',
      message: 'Error checking authentication status'
    });
  }
});

export default router;
