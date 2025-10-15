import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';
import { requireAuth } from '../middleware/session-simple';
import { passwordSchema, emailSchema, nameSchema, generateSlug } from '../utils/validation';
import { generateVerificationToken, verifyEmailToken, sendVerificationEmail, sendWelcomeEmail } from '../services/email';
import type { LoginRequest, RegisterRequest, AuthResponse, AuthenticatedRequest } from '../types/session';

const prisma = new PrismaClient();

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
      req.session.vendorProfileId = 'mock-user-id';
      
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
          vendorProfileId: req.session.vendorProfileId,
          isAuthenticated: true,
          lastActivity: new Date()
        }
      });
    }
    
    // Vendor login
    if (email === 'vendor@cravedartisan.com' && password === 'vendor123') {
      console.log('🔍 [DEBUG] Vendor login successful, setting session data...');
      console.log('🔍 [DEBUG] Session ID before:', req.sessionID);
      console.log('🔍 [DEBUG] Session data before:', JSON.stringify(req.session, null, 2));
      
      req.session.userId = 'vendor-user-id';
      req.session.email = email;
      req.session.role = 'VENDOR';
      req.session.vendorProfileId = 'vendor-user-id';
      
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
          vendorProfileId: req.session.vendorProfileId,
          isAuthenticated: true,
          lastActivity: new Date()
        }
      });
    }
    
    // Coordinator login
    if (email === 'coordinator@cravedartisan.com' && password === 'coordinator123') {
      console.log('🔍 [DEBUG] Coordinator login successful, setting session data...');
      console.log('🔍 [DEBUG] Session ID before:', req.sessionID);
      console.log('🔍 [DEBUG] Session data before:', JSON.stringify(req.session, null, 2));
      
      req.session.userId = 'coordinator-user-id';
      req.session.email = email;
      req.session.role = 'EVENT_COORDINATOR';
      req.session.vendorProfileId = 'coordinator-user-id';
      
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
          vendorProfileId: req.session.vendorProfileId,
          isAuthenticated: true,
          lastActivity: new Date()
        }
      });
    }

    // Admin login
    if (email === 'admin@cravedartisan.com' && password === 'admin123') {
      console.log('🔍 [DEBUG] Admin login successful, setting session data...');
      console.log('🔍 [DEBUG] Session ID before:', req.sessionID);
      console.log('🔍 [DEBUG] Session data before:', JSON.stringify(req.session, null, 2));
      
      req.session.userId = 'admin-user-id';
      req.session.email = email;
      req.session.role = 'ADMIN';
      req.session.vendorProfileId = 'admin-user-id';
      
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
          vendorProfileId: req.session.vendorProfileId,
          isAuthenticated: true,
          lastActivity: new Date()
        }
      });
    }
    
    // Customer login
    if (email === 'customer@cravedartisan.com' && password === 'customer123') {
      console.log('🔍 [DEBUG] Customer login successful, setting session data...');
      console.log('🔍 [DEBUG] Session ID before:', req.sessionID);
      console.log('🔍 [DEBUG] Session data before:', JSON.stringify(req.session, null, 2));
      
      req.session.userId = 'mock-customer-id';
      req.session.email = email;
      req.session.role = 'CUSTOMER';
      req.session.vendorProfileId = 'mock-customer-id';
      
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
          vendorProfileId: req.session.vendorProfileId,
          isAuthenticated: true,
          lastActivity: new Date()
        }
      });
    }

    // Event Coordinator login
    if (email === 'coordinator@cravedartisan.com' && password === 'password123') {
      console.log('🔍 [DEBUG] Coordinator login successful, setting session data...');
      console.log('🔍 [DEBUG] Session ID before:', req.sessionID);
      console.log('🔍 [DEBUG] Session data before:', JSON.stringify(req.session, null, 2));
      
      req.session.userId = 'coordinator-user-id';
      req.session.email = email;
      req.session.role = 'EVENT_COORDINATOR';
      req.session.vendorProfileId = 'coordinator-user-id';
      
      console.log('🔍 [DEBUG] Session data after setting:', JSON.stringify(req.session, null, 2));
      
      // Force session save
      req.session.save((err) => {
        if (err) {
          console.error('🔍 [DEBUG] Session save error:', err);
        } else {
          console.log('🔍 [DEBUG] Session saved successfully');
        }
      });
      
      logger.info({ email, userId: req.session.userId }, 'Coordinator logged in');
      
      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          userId: req.session.userId,
          email: req.session.email,
          role: req.session.role,
          vendorProfileId: req.session.vendorProfileId,
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
        vendorProfileId: req.session.vendorProfileId,
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

// =============================================
// ENHANCED SIGNUP ROUTES
// =============================================

/**
 * POST /api/auth/signup/step1
 * Initial signup - create user account
 */
const signupStep1Schema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  role: z.enum(['VENDOR', 'CUSTOMER', 'EVENT_COORDINATOR'])
});

router.post('/signup/step1', async (req, res) => {
  try {
    const validation = signupStep1Schema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: validation.error.errors
      });
    }

    const { email, password, name, role } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        profileCompleted: false,
        emailVerified: false
      }
    });

    // Generate email verification token
    const verificationToken = generateVerificationToken(user.id, email);
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    await sendVerificationEmail(email, verificationToken, baseUrl);

    // Create session
    (req.session as any).userId = user.id;
    (req.session as any).email = user.email;
    (req.session as any).role = role;
    (req.session as any).signupRole = role; // Store intended role

    logger.info({ userId: user.id, email, role }, 'User signup step 1 completed');

    res.json({
      success: true,
      message: 'Account created successfully',
      user: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role,
        profileCompleted: false,
        emailVerified: false
      },
      nextStep: 'profile'
    });
  } catch (error) {
    logger.error({ error }, 'Signup step 1 error');
    res.status(500).json({
      success: false,
      message: 'Failed to create account'
    });
  }
});

/**
 * POST /api/auth/signup/profile
 * Complete profile setup based on role
 */
const vendorProfileSchema = z.object({
  storeName: z.string().min(2),
  bio: z.string().optional(),
  phone: z.string().optional(),
  zip_code: z.string().optional(),
  slug: z.string().optional()
});

const coordinatorProfileSchema = z.object({
  organizationName: z.string().min(2),
  bio: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  zip_code: z.string().optional()
});

const customerProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  zip_code: z.string().optional()
});

router.post('/signup/profile', requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    const role = (req.session as any)?.signupRole || (req.session as any)?.role;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role not specified in signup flow'
      });
    }

    let profileData: any = {};
    
    // Validate based on role
    if (role === 'VENDOR') {
      const validation = vendorProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid vendor profile data',
          errors: validation.error.errors
        });
      }
      profileData = validation.data;

      // Generate slug
      let slug = profileData.slug || generateSlug(profileData.storeName);
      let slugExists = await prisma.vendorProfile.findUnique({ where: { slug } });
      let counter = 1;
      while (slugExists) {
        slug = `${generateSlug(profileData.storeName)}-${counter}`;
        slugExists = await prisma.vendorProfile.findUnique({ where: { slug } });
        counter++;
      }

      // Create vendor profile
      await prisma.vendorProfile.create({
        data: {
          userId,
          storeName: profileData.storeName,
          bio: profileData.bio,
          slug
        }
      });

    } else if (role === 'EVENT_COORDINATOR') {
      const validation = coordinatorProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinator profile data',
          errors: validation.error.errors
        });
      }
      profileData = validation.data;

      // Generate slug
      let slug = generateSlug(profileData.organizationName);
      let slugExists = await prisma.eventCoordinatorProfile.findUnique({ where: { slug } });
      let counter = 1;
      while (slugExists) {
        slug = `${generateSlug(profileData.organizationName)}-${counter}`;
        slugExists = await prisma.eventCoordinatorProfile.findUnique({ where: { slug } });
        counter++;
      }

      // Create coordinator profile
      await prisma.eventCoordinatorProfile.create({
        data: {
          userId,
          organizationName: profileData.organizationName,
          bio: profileData.bio,
          slug,
          phone: profileData.phone,
          website: profileData.website
        }
      });

    } else if (role === 'CUSTOMER') {
      const validation = customerProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid customer profile data',
          errors: validation.error.errors
        });
      }
      profileData = validation.data;
    }

    // Update user with profile data
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        zip_code: profileData.zip_code || req.body.zip_code,
        profileCompleted: true
      }
    });

    logger.info({ userId, role }, 'User profile setup completed');

    res.json({
      success: true,
      message: 'Profile setup completed',
      nextStep: role === 'VENDOR' || role === 'EVENT_COORDINATOR' ? 'stripe' : 'complete'
    });
  } catch (error) {
    logger.error({ error }, 'Profile setup error');
    res.status(500).json({
      success: false,
      message: 'Failed to complete profile setup'
    });
  }
});

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token required'
      });
    }

    const verification = verifyEmailToken(token);
    
    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update user
    await prisma.user.update({
      where: { id: verification.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    logger.info({ userId: verification.userId, email: verification.email }, 'Email verified');

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error({ error }, 'Email verification error');
    res.status(500).json({
      success: false,
      message: 'Failed to verify email'
    });
  }
});

/**
 * GET /api/auth/signup-status
 * Check signup completion status
 */
router.get('/signup-status', requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        profileCompleted: true,
        emailVerified: true,
        vendorProfile: {
          select: {
            id: true,
            stripeAccountStatus: true
          }
        },
        coordinatorProfile: {
          select: {
            id: true,
            stripeAccountStatus: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const role = (req.session as any)?.signupRole || (req.session as any)?.role;
    const needsStripe = role === 'VENDOR' || role === 'EVENT_COORDINATOR';
    const stripeComplete = needsStripe ? 
      (user.vendorProfile?.stripeAccountStatus === 'active' || 
       user.coordinatorProfile?.stripeAccountStatus === 'active') : true;

    const signupComplete = user.profileCompleted && user.emailVerified && stripeComplete;

    res.json({
      success: true,
      status: {
        accountCreated: true,
        emailVerified: user.emailVerified,
        profileCompleted: user.profileCompleted,
        stripeComplete,
        signupComplete,
        role
      }
    });
  } catch (error) {
    logger.error({ error }, 'Signup status check error');
    res.status(500).json({
      success: false,
      message: 'Failed to check signup status'
    });
  }
});

export default router;
