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

    // Mock password check (for testing purposes)
    const mockHashedPassword = await bcrypt.hash('testpassword123', 12);
    const isPasswordValid = await bcrypt.compare(password, mockHashedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Set session
    req.session.userId = 'test-user-id';
    
    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({
          error: 'Session error',
          message: 'Failed to save session'
        });
      }
      
      console.log('Session saved successfully, userId:', req.session.userId);
      
      // Return mock user data
      res.json({
        message: 'Login successful (TEST MODE)',
        user: {
          id: 'test-user-id',
          email,
          role: 'CUSTOMER',
          profile: {
            firstName: 'Test',
            lastName: 'User',
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
    if (!req.session.userId) {
      return res.status(401).json({
        authenticated: false,
        message: 'No active session'
      });
    }

    res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        email: 'test@example.com',
        role: 'CUSTOMER',
        profile: {
          firstName: 'Test',
          lastName: 'User',
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