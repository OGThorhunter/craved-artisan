import { z } from 'zod';

/**
 * Password validation requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar?: boolean;
  };
}

/**
 * Validate password and return detailed strength information
 */
export function validatePassword(password: string): PasswordStrength {
  const feedback: string[] = [];
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  };

  // Check requirements and provide feedback
  if (!requirements.minLength) {
    feedback.push('Password must be at least 8 characters long');
  }
  if (!requirements.hasUppercase) {
    feedback.push('Password must contain at least one uppercase letter');
  }
  if (!requirements.hasLowercase) {
    feedback.push('Password must contain at least one lowercase letter');
  }
  if (!requirements.hasNumber) {
    feedback.push('Password must contain at least one number');
  }

  // Calculate strength score
  let score = 0;
  if (requirements.minLength) score++;
  if (requirements.hasUppercase) score++;
  if (requirements.hasLowercase) score++;
  if (requirements.hasNumber) score++;
  if (requirements.hasSpecialChar) score++;
  if (password.length >= 12) score++; // Bonus for longer passwords
  if (password.length >= 16) score++; // Additional bonus

  // Normalize score to 0-4 range
  score = Math.min(Math.floor(score * 4 / 7), 4);

  // Determine if password is valid (meets minimum requirements)
  const isValid = requirements.minLength && 
                  requirements.hasUppercase && 
                  requirements.hasLowercase && 
                  requirements.hasNumber;

  // Add positive feedback for strong passwords
  if (isValid) {
    if (requirements.hasSpecialChar) {
      feedback.push('Great! Password includes special characters');
    }
    if (password.length >= 12) {
      feedback.push('Excellent! Password is nice and long');
    }
  }

  return {
    isValid,
    score,
    feedback,
    requirements
  };
}

/**
 * Email validation schema
 */
export const emailSchema = z.string()
  .email('Invalid email address')
  .toLowerCase()
  .trim();

/**
 * Name validation schema
 */
export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .trim();

/**
 * Phone number validation schema
 * Accepts various formats: (123) 456-7890, 123-456-7890, 1234567890, +1 123 456 7890
 */
export const phoneSchema = z.string()
  .regex(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    'Invalid phone number format'
  )
  .optional()
  .or(z.literal(''));

/**
 * ZIP code validation schema (US ZIP codes)
 */
export const zipCodeSchema = z.string()
  .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format')
  .optional()
  .or(z.literal(''));

/**
 * Slug validation schema
 * Allows lowercase letters, numbers, and hyphens
 */
export const slugSchema = z.string()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug must not exceed 50 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  .regex(/^[a-z]/, 'Slug must start with a letter')
  .regex(/[a-z0-9]$/, 'Slug must end with a letter or number');

/**
 * URL validation schema
 */
export const urlSchema = z.string()
  .url('Invalid URL format')
  .optional()
  .or(z.literal(''));

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Remove leading hyphens
    .replace(/-+$/, ''); // Remove trailing hyphens
}

/**
 * Sanitize HTML input to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, ''); // Remove angle brackets
}

