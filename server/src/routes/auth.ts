import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AuditScope, ActorType, Severity } from '@prisma/client';
import { logger } from '../logger';
import { requireAuth } from '../middleware/session-simple';
import { passwordSchema, emailSchema, nameSchema, generateSlug } from '../utils/validation';
import { generateVerificationToken, verifyEmailToken, sendVerificationEmail, sendWelcomeEmail } from '../services/email';
import type { LoginRequest, RegisterRequest, AuthResponse, AuthenticatedRequest } from '../types/session';
import { logEvent } from '../utils/audit';
import { AUTH_LOGIN_SUCCESS, AUTH_LOGIN_FAIL, AUTH_LOGOUT, USER_CREATED } from '../constants/audit-events';
import { prisma } from '../lib/prisma';

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
  role: z.enum(['VENDOR', 'CUSTOMER', 'EVENT_COORDINATOR']),
  agreements: z.array(z.object({
    documentId: z.string(),
    documentType: z.string(),
    documentVersion: z.string()
  })).optional()
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

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        vendorProfile: true,
        coordinatorProfile: true,
        roles: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      // Audit log: failed login
      logEvent({
        scope: AuditScope.AUTH,
        action: AUTH_LOGIN_FAIL,
        actorType: ActorType.USER,
        actorIp: req.context?.actor.ip,
        actorUa: req.context?.actor.ua,
        requestId: req.context?.requestId,
        traceId: req.context?.traceId,
        severity: Severity.WARNING,
        metadata: { email, reason: 'User not found' }
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      // Audit log: failed login
      logEvent({
        scope: AuditScope.AUTH,
        action: AUTH_LOGIN_FAIL,
        actorId: user.id,
        actorType: ActorType.USER,
        actorIp: req.context?.actor.ip,
        actorUa: req.context?.actor.ua,
        requestId: req.context?.requestId,
        traceId: req.context?.traceId,
        severity: Severity.WARNING,
        metadata: { email, userId: user.id, reason: 'Invalid password' }
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Determine user role (from UserRole table or profile)
    let userRole = 'CUSTOMER'; // Default role
    let vendorProfileId = null;

    if (user.roles && user.roles.length > 0) {
      userRole = user.roles[0].role; // Use the most recent role from UserRole table
    } else if (user.vendorProfile) {
      userRole = 'VENDOR';
      vendorProfileId = user.vendorProfile.id;
    } else if (user.coordinatorProfile) {
      userRole = 'EVENT_COORDINATOR';
    }

    // Set session data
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.role = userRole;
    if (vendorProfileId) {
      req.session.vendorProfileId = vendorProfileId;
    }

    // Update last activity
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() }
    }).catch(err => logger.warn({ error: err }, 'Failed to update lastActiveAt'));

    // Force session save
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          logger.error({ error: err }, 'Session save error');
          reject(err);
        } else {
          logger.info({ userId: user.id, email, role: userRole }, 'User logged in successfully');
          resolve(true);
        }
      });
    });

    // Audit log: successful login
    logEvent({
      scope: AuditScope.AUTH,
      action: AUTH_LOGIN_SUCCESS,
      actorId: user.id,
      actorType: ActorType.USER,
      actorIp: req.context?.actor.ip,
      actorUa: req.context?.actor.ua,
      requestId: req.context?.requestId,
      traceId: req.context?.traceId,
      targetType: 'User',
      targetId: user.id,
      severity: Severity.INFO,
      metadata: { email, role: userRole }
    });

    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        userId: user.id,
        email: user.email,
        role: userRole,
        vendorProfileId,
        isAuthenticated: true,
        lastActivity: new Date(),
        betaTester: user.betaTester || false,
        emailVerified: user.emailVerified
      }
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
    const { email, password, name, role, agreements } = req.body;
    
    // Validate input
    const validation = registerSchema.safeParse({ email, password, name, role, agreements });
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: validation.error.errors
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Verify required agreements are accepted for all roles
    const requiredTypes = ['TOS', 'PRIVACY', 'AI_DISCLAIMER', 'DATA_LIABILITY'];
    
    if (role === 'VENDOR') {
      requiredTypes.push('VENDOR_AGREEMENT');
    } else if (role === 'EVENT_COORDINATOR') {
      requiredTypes.push('COORDINATOR_AGREEMENT');
    }

    const providedTypes = (agreements || []).map((a: any) => a.documentType);
    const missingTypes = requiredTypes.filter(type => !providedTypes.includes(type));

    if (missingTypes.length > 0) {
      logger.warn(
        { 
          email,
          role,
          requiredTypes,
          providedTypes,
          missingTypes 
        }, 
        'Registration failed: Missing required legal agreements'
      );
      return res.status(400).json({
        success: false,
        message: 'Missing required legal agreements',
        missingTypes,
        requiredTypes
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and vendor profile (if applicable) in transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          emailVerified: false
        }
      });

      // Create role-specific profile
      if (role === 'VENDOR') {
        const slug = generateSlug(name);
        await tx.vendorProfile.create({
          data: {
            userId: newUser.id,
            storeName: name,
            slug,
            bio: '',
            stripeAccountStatus: 'NOT_STARTED'
          }
        });
      } else if (role === 'EVENT_COORDINATOR') {
        const slug = generateSlug(name);
        await tx.eventCoordinatorProfile.create({
          data: {
            userId: newUser.id,
            organizationName: name,
            slug,
            bio: '',
            stripeAccountStatus: 'NOT_STARTED'
          }
        });
      }

      // Store legal agreement acceptances
      if (agreements && agreements.length > 0) {
        const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        await tx.userAgreement.createMany({
          data: agreements.map((agreement: any) => ({
            userId: newUser.id,
            documentId: agreement.documentId,
            documentType: agreement.documentType,
            documentVersion: agreement.documentVersion,
            ipAddress,
            userAgent
          }))
        });

        logger.info(
          { 
            userId: newUser.id, 
            email: newUser.email,
            role,
            agreementCount: agreements.length 
          }, 
          'User registered and accepted legal agreements'
        );
      } else {
        logger.info({ userId: newUser.id, email: newUser.email, role }, 'User registered');
      }

      return newUser;
    });

    // Send verification email if email service is configured
    try {
      const verificationToken = generateVerificationToken();
      await sendVerificationEmail(email, verificationToken);
      logger.info({ userId: user.id, email }, 'Verification email sent');
    } catch (emailError) {
      logger.warn({ userId: user.id, error: emailError }, 'Failed to send verification email');
      // Don't fail registration if email fails
    }
    
    return res.json({
      success: true,
      message: 'Registration successful',
      user: {
        userId: user.id,
        email: user.email,
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
  const userId = req.user?.userId;
  
  // Audit log: logout
  logEvent({
    scope: AuditScope.AUTH,
    action: AUTH_LOGOUT,
    actorId: userId,
    actorType: ActorType.USER,
    actorIp: req.context?.actor.ip,
    actorUa: req.context?.actor.ua,
    requestId: req.context?.requestId,
    traceId: req.context?.traceId,
    targetType: 'User',
    targetId: userId,
    severity: Severity.INFO
  });
  
  req.session.destroy((err) => {
    if (err) {
      logger.error({ error: err }, 'Logout error');
      return res.status(500).json({
        success: false,
        message: 'Error during logout'
      });
    }
    
    logger.info({ userId }, 'User logged out');
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
        id: req.session.userId, // Add id field for compatibility
        userId: req.session.userId,
        email: req.session.email,
        role: req.session.role,
        vendorProfileId: req.session.vendorProfileId,
        isAuthenticated: true,
        lastActivity: new Date(),
        betaTester: false // Default value, can be updated based on user data
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
    logger.info({ body: req.body }, 'Signup step 1 request received');
    
    const validation = signupStep1Schema.safeParse(req.body);
    if (!validation.success) {
      logger.warn({ errors: validation.error.errors }, 'Signup validation failed');
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: validation.error.errors
      });
    }

    const { email, password, name, role } = validation.data;

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email }
      });
    } catch (dbError) {
      logger.error({ error: dbError, email }, 'Database error checking existing user');
      return res.status(500).json({
        success: false,
        message: 'Database error occurred. Please try again.'
      });
    }

    if (existingUser) {
      logger.info({ email }, 'Signup attempted with existing email');
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError) {
      logger.error({ error: hashError }, 'Password hashing failed');
      return res.status(500).json({
        success: false,
        message: 'Failed to process password. Please try again.'
      });
    }

    // Create user
    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          profileCompleted: false,
          emailVerified: false
        }
      });
      logger.info({ userId: user.id, email }, 'User created successfully');
    } catch (createError) {
      logger.error({ error: createError, email }, 'Failed to create user in database');
      return res.status(500).json({
        success: false,
        message: 'Failed to create account. Please try again.'
      });
    }

    // Generate email verification token (don't fail signup if this fails)
    try {
      const verificationToken = generateVerificationToken(user.id, email);
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      await sendVerificationEmail(email, verificationToken, baseUrl);
      logger.info({ userId: user.id }, 'Verification email sent');
    } catch (emailError) {
      logger.error({ error: emailError, userId: user.id }, 'Failed to send verification email (non-critical)');
      // Continue anyway - user is created, they can resend verification later
    }

    // Create session (move to background to avoid blocking response)
    (req.session as any).userId = user.id;
    (req.session as any).email = user.email;
    (req.session as any).role = role;
    (req.session as any).signupRole = role; // Store intended role
    
    // Save session in background (don't await)
    setImmediate(() => {
      req.session.save((err) => {
        if (err) {
          logger.error({ error: err, userId: user.id }, 'Session save failed (background)');
        } else {
          logger.info({ userId: user.id, sessionId: req.sessionID }, 'Session saved successfully (background)');
        }
      });
    });

    logger.info({ userId: user.id, email, role }, 'User signup step 1 completed successfully');

    // Add response debugging
    logger.info({ 
      userId: user.id, 
      hasResponse: !res.headersSent,
      responseHeaders: res.getHeaders()
    }, 'About to send signup response');

    return res.status(200).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        userId: user.id,
        email: user.email,
        name: user.name,
        role,
        profileCompleted: false,
        emailVerified: false,
        betaTester: false
      },
      nextStep: 'profile'
    });
  } catch (error) {
    logger.error({ error, body: req.body }, 'Unexpected error in signup step 1');
    
    // Make sure we always return a JSON response
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      });
    }
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
 * POST /api/auth/resend-verification
 * Resend verification email
 */
router.post('/resend-verification', requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    const email = (req.session as any)?.email;

    if (!userId || !email) {
      return res.status(400).json({
        success: false,
        message: 'No active session or email found'
      });
    }

    // Check if user already verified
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true, email: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.emailVerified) {
      return res.json({
        success: true,
        message: 'Email is already verified'
      });
    }

    // Generate and send new verification token
    const verificationToken = generateVerificationToken(userId, email);
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    await sendVerificationEmail(email, verificationToken, baseUrl);

    logger.info({ userId, email }, 'Verification email resent');

    res.json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    logger.error({ error }, 'Resend verification error');
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email'
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
