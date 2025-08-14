import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';
import prisma from '../lib/prisma';

const router = Router();

// Zod schemas for validation
const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  role: z.enum(['CUSTOMER', 'VENDOR', 'ADMIN', 'SUPPLIER', 'EVENT_COORDINATOR', 'DROPOFF']).default('CUSTOMER'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Custom Zod validation middleware
const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

// Register route
router.post('/register', validateRequest(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, role, firstName, lastName, phone, bio, website } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role as Role,
        }
      });

      // Create profile
      const profile = await tx.profile.create({
        data: {
          firstName,
          lastName,
          phone,
          bio,
          website,
          userId: user.id,
        }
      });

      return { user, profile };
    });

    // Set session
    req.session.userId = result.user.id;

    // Return user data (without password)
    return res.status(400).json({
      message: 'Account created successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        profile: {
          firstName: result.profile.firstName,
          lastName: result.profile.lastName,
          phone: result.profile.phone,
          bio: result.profile.bio,
          website: result.profile.website,
        }
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to create account'
    });
  }
});

// Login route
router.post('/login', validateRequest(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user with profile
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true
      }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Set session
    req.session.userId = user.id;

    // Return user data (without password)
    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          phone: user.profile.phone,
          bio: user.profile.bio,
          website: user.profile.website,
        } : null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to authenticate'
    });
  }
});

// Logout route
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(400).json({
        error: 'Internal server error',
        message: 'Failed to logout'
      });
    }

    res.clearCookie('connect.sid');
    return res.json({
      message: 'Logout successful'
    });
  });
});

// Get current user route
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId! },
      include: {
        profile: true
      }
    });

    if (!user) {
      return res.status(400).json({
        error: 'User not found',
        message: 'User account not found'
      });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          phone: user.profile.phone,
          bio: user.profile.bio,
          website: user.profile.website,
        } : null
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to get user data'
    });
  }
});

// Check session route (for frontend to check if user is logged in)
router.get('/session', async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(400).json({
        authenticated: false,
        message: 'No active session'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      include: {
        profile: true
      }
    });

    if (!user) {
      // Clear invalid session
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
      });
      return res.status(400).json({
        authenticated: false,
        message: 'Invalid session'
      });
    }

    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          phone: user.profile.phone,
          bio: user.profile.bio,
          website: user.profile.website,
        } : null
      }
    });

  } catch (error) {
    console.error('Session check error:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to check session'
    });
  }
});

export default router; 