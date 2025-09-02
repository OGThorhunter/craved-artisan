import { Request } from 'express';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    email?: string;
    role?: 'VENDOR' | 'ADMIN' | 'CUSTOMER';
  }
}

export interface UserSession {
  userId: string;
  email: string;
  role: 'VENDOR' | 'ADMIN' | 'CUSTOMER';
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
