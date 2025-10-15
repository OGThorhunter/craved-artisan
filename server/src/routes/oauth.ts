import { Router } from 'express';
import { logger } from '../logger';
import type { Request, Response } from 'express';

const router = Router();

/**
 * OAuth Routes for Social Login
 * 
 * These routes handle OAuth authentication with Google, Facebook, and Apple.
 * 
 * To activate OAuth:
 * 1. Set up OAuth applications with Google, Facebook, and Apple
 * 2. Add credentials to .env file
 * 3. Uncomment and configure the Passport strategies below
 * 4. Register this router in server/src/index.ts
 */

// OAuth providers configuration
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Google OAuth Strategy - Only initialize if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id-here') {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.BACKEND_URL}/api/oauth/google/callback`
  },
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists with this OAuth provider
    let user = await prisma.user.findFirst({
      where: {
        oauthProvider: 'google',
        oauthProviderId: profile.id
      }
    });

    if (!user) {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: profile.emails![0].value }
      });

      if (existingUser) {
        // Link OAuth to existing account
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            oauthProvider: 'google',
            oauthProviderId: profile.id,
            emailVerified: true,
            emailVerifiedAt: new Date()
          }
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: profile.emails![0].value,
            name: profile.displayName,
            oauthProvider: 'google',
            oauthProviderId: profile.id,
            password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10), // Random password
            emailVerified: true,
            emailVerifiedAt: new Date()
          }
        });
      }
    }

    done(null, user);
  } catch (error) {
    done(error as Error);
  }
}));
}

// Facebook OAuth Strategy - Only initialize if credentials are provided
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET &&
    process.env.FACEBOOK_APP_ID !== 'your-facebook-app-id-here') {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID!,
    clientSecret: process.env.FACEBOOK_APP_SECRET!,
    callbackURL: `${process.env.BACKEND_URL}/api/oauth/facebook/callback`,
    profileFields: ['id', 'emails', 'name', 'photos']
  },
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.user.findFirst({
      where: {
        oauthProvider: 'facebook',
        oauthProviderId: profile.id
      }
    });

    if (!user) {
      const existingUser = await prisma.user.findUnique({
        where: { email: profile.emails![0].value }
      });

      if (existingUser) {
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            oauthProvider: 'facebook',
            oauthProviderId: profile.id,
            emailVerified: true,
            emailVerifiedAt: new Date()
          }
        });
      } else {
        user = await prisma.user.create({
          data: {
            email: profile.emails![0].value,
            name: `${profile.name?.givenName} ${profile.name?.familyName}`,
            oauthProvider: 'facebook',
            oauthProviderId: profile.id,
            password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
            emailVerified: true,
            emailVerifiedAt: new Date()
          }
        });
      }
    }

    done(null, user);
  } catch (error) {
    done(error as Error);
  }
}));
}

// Serialize/Deserialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

/**
 * Google OAuth Routes
 */
router.get('/google', (req: Request, res: Response, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(501).json({
      success: false,
      message: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
    });
  }
  
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req: Request, res: Response, next) => {
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`
  }, async (err: any, user: any) => {
    if (err) {
      logger.error({ error: err }, 'Google OAuth error');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_error`);
    }
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_denied`);
    }
    
    // Create session for OAuth user
    (req.session as any).userId = user.id;
    (req.session as any).email = user.email;
    (req.session as any).oauthProvider = user.oauthProvider;
    (req.session as any).role = 'CUSTOMER'; // Default role, user will select proper role in signup flow
    
    logger.info({ userId: user.id, email: user.email, provider: 'google' }, 'OAuth login successful');
    
    // Redirect to signup flow to complete profile (since they need to select role and complete profile)
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/signup?oauth=google&step=profile`);
  })(req, res, next);
});

/**
 * Facebook OAuth Routes
 */
router.get('/facebook', (req: Request, res: Response, next) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return res.status(501).json({
      success: false,
      message: 'Facebook OAuth not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET environment variables.'
    });
  }
  
  passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
});

router.get('/facebook/callback', (req: Request, res: Response, next) => {
  passport.authenticate('facebook', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`
  }, async (err: any, user: any) => {
    if (err) {
      logger.error({ error: err }, 'Facebook OAuth error');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_error`);
    }
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_denied`);
    }
    
    // Create session for OAuth user
    (req.session as any).userId = user.id;
    (req.session as any).email = user.email;
    (req.session as any).oauthProvider = user.oauthProvider;
    (req.session as any).role = 'CUSTOMER'; // Default role, user will select proper role in signup flow
    
    logger.info({ userId: user.id, email: user.email, provider: 'facebook' }, 'OAuth login successful');
    
    // Redirect to signup flow to complete profile (since they need to select role and complete profile)
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/signup?oauth=facebook&step=profile`);
  })(req, res, next);
});

/**
 * Apple OAuth Routes
 */
router.get('/apple', (req: Request, res: Response) => {
  // TODO: Implement Apple Sign In
  res.status(501).json({
    success: false,
    message: 'Apple Sign In not yet configured. Requires Apple Developer account setup.'
  });
});

router.get('/apple/callback', (req: Request, res: Response) => {
  // TODO: Implement Apple callback
  res.status(501).json({
    success: false,
    message: 'Apple Sign In callback not yet configured'
  });
});

/**
 * OAuth Status Check
 * Returns which OAuth providers are configured
 */
router.get('/status', (req: Request, res: Response) => {
  const providers = {
    google: {
      configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      available: !!process.env.GOOGLE_CLIENT_ID
    },
    facebook: {
      configured: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
      available: !!process.env.FACEBOOK_APP_ID
    },
    apple: {
      configured: !!(process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID),
      available: !!process.env.APPLE_CLIENT_ID
    }
  };

  logger.info({ providers }, 'OAuth provider status checked');

  res.json({
    success: true,
    providers,
    message: 'OAuth configuration status'
  });
});

export default router;

