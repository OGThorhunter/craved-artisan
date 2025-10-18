import { Request } from 'express';
import 'express-session';

// Unified Express type augmentations
// This file consolidates all Express Request and Session extensions to avoid conflicts

declare global {
  namespace Express {
    interface Request {
      // Main user object (used by most middleware)
      user?: {
        id: string;
        userId: string;
        email: string;
        role: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        avatarUrl?: string;
        vendorProfileId?: string;
        isAuthenticated: boolean;
        lastActivity: Date;
        betaTester?: boolean;
      };
      
      // Admin-specific context
      admin?: {
        id: string;
        email: string;
        role: string;
        isAuthenticated: boolean;
        lastActivity: Date;
      };
      
      // Account context for multi-tenancy
      account?: {
        id: string;
        name: string;
        slug: string;
        ownerId: string;
      };
      
      accountUser?: {
        id: string;
        role: 'OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER';
        status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
        title?: string;
        workEmail?: string;
        workPhone?: string;
      };
    }
  }
}

// Extend express-session module
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    email?: string;
    role?: 'VENDOR' | 'ADMIN' | 'CUSTOMER' | 'EVENT_COORDINATOR';
    vendorProfileId?: string;
    accountSlug?: string;
    user?: {
      userId: string;
      email: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatarUrl?: string;
      isAuthenticated: boolean;
      lastActivity: Date;
    };
  }
}

export interface UserSession {
  userId: string;
  email: string;
  role: 'VENDOR' | 'ADMIN' | 'CUSTOMER' | 'EVENT_COORDINATOR';
  isAuthenticated: boolean;
  lastActivity: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: UserSession;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'VENDOR' | 'CUSTOMER';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<UserSession, 'password'>;
}

