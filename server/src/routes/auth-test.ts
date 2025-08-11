import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

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

// Test register route (without database)
router.post('/register', validateRequest(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, role, firstName, lastName, phone, bio, website } = req.body;

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Set session
    req.session.userId = 'test-user-id';

    // Return mock user data
    res.status(201).json({
      message: 'Account created successfully (TEST MODE)',
      user: {
        id: 'test-user-id',
        email,
        role,
        profile: {
          firstName,
          lastName,
          phone,
          bio,
          website,
        }
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create account'
    });
  }
});

// Test login route (without database)
router.post('/login', validateRequest(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Mock user credentials for testing
    const mockUsers = [
      {
        email: 'test@example.com',
        password: 'testpassword123',
        userId: 'test-user-id',
        role: 'CUSTOMER',
        firstName: 'Test',
        lastName: 'User'
      },
      {
        email: 'vendor@cravedartisan.com',
        password: 'vendor123',
        userId: 'mock-user-id',
        role: 'VENDOR',
        firstName: 'Vendor',
        lastName: 'User'
      },
      {
        email: 'vendor1@example.com',
        password: 'password123',
        userId: 'user-1',
        role: 'VENDOR',
        firstName: 'Vendor',
        lastName: 'One'
      },
      {
        email: 'vendor2@example.com',
        password: 'password123',
        userId: 'user-2',
        role: 'VENDOR',
        firstName: 'Vendor',
        lastName: 'Two'
      },
      {
        email: 'admin@example.com',
        password: 'admin123',
        userId: 'user-admin',
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'User'
      }
    ];

    // Find user by email
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check password
    const mockHashedPassword = await bcrypt.hash(user.password, 12);
    const isPasswordValid = await bcrypt.compare(password, mockHashedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Set session with user data
    req.session.userId = user.userId;
    req.session.user = {
      id: user.userId,
      email: user.email,
      role: user.role
    };
    
    console.log('Session before save - userId:', req.session.userId, 'user:', req.session.user);
    
    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({
          error: 'Session error',
          message: 'Failed to save session'
        });
      }
      
      console.log('Session saved successfully, userId:', req.session.userId, 'role:', req.session.user?.role);
      
      // Return mock user data
      res.json({
        message: 'Login successful (TEST MODE)',
        user: {
          id: user.userId,
          email,
          role: user.role,
          profile: {
            firstName: user.firstName,
            lastName: user.lastName,
            phone: null,
            bio: null,
            website: null,
          }
        }
      });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
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
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to logout'
      });
    }

    res.clearCookie('connect.sid');
    res.json({
      message: 'Logout successful'
    });
  });
});

// Test session route
router.get('/session', async (req: Request, res: Response) => {
  try {
    console.log('Session check - session data:', req.session);
    console.log('Session userId:', req.session.userId);
    console.log('Session user:', req.session.user);
    
    // In mock mode, always return a valid session for development
    if (!req.session.userId) {
      // Set a mock session for development
      req.session.userId = 'dev-user-id';
      req.session.user = {
        id: 'dev-user-id',
        email: 'dev@local.test',
        role: 'VENDOR'
      };
    }

    // Get user data from session
    const userData = req.session.user;
    
    res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        email: userData?.email || 'dev@local.test',
        role: userData?.role || 'VENDOR',
        vendorId: 'seed-vendor-id',
        name: 'Dev Vendor',
        profile: {
          firstName: 'Dev',
          lastName: 'Vendor',
          phone: null,
          bio: null,
          website: null,
        }
      }
    });

  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to check session'
    });
  }
});

export default router; 