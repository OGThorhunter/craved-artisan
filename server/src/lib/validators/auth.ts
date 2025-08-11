import { z } from 'zod';

// Login request validation
export const loginRequestSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

// Register request validation
export const registerRequestSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  role: z.enum(['CUSTOMER', 'VENDOR', 'ADMIN', 'SUPPLIER', 'EVENT_COORDINATOR', 'DROPOFF']).default('CUSTOMER'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: z.string().url('Please provide a valid URL').optional().or(z.literal('')),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

// Session response validation
export const sessionResponseSchema = z.object({
  authenticated: z.boolean(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    role: z.enum(['CUSTOMER', 'VENDOR', 'ADMIN', 'SUPPLIER', 'EVENT_COORDINATOR', 'DROPOFF']),
    profile: z.object({
      firstName: z.string(),
      lastName: z.string(),
      phone: z.string().optional(),
      bio: z.string().optional(),
      website: z.string().optional(),
    }).optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }).optional(),
});

export type SessionResponse = z.infer<typeof sessionResponseSchema>;
