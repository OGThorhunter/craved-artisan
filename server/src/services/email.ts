import crypto from 'crypto';
import { logger } from '../logger';

// Email verification token storage (in production, use Redis or database)
const verificationTokens = new Map<string, { userId: string; email: string; expiresAt: Date }>();

/**
 * Generate a secure verification token
 */
export function generateVerificationToken(userId: string, email: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  verificationTokens.set(token, { userId, email, expiresAt });
  
  logger.info({ userId, email }, 'Generated email verification token');
  
  return token;
}

/**
 * Verify a token and return user info if valid
 */
export function verifyEmailToken(token: string): { userId: string; email: string } | null {
  const data = verificationTokens.get(token);
  
  if (!data) {
    logger.warn({ token: token.substring(0, 8) }, 'Invalid verification token');
    return null;
  }
  
  if (data.expiresAt < new Date()) {
    logger.warn({ userId: data.userId }, 'Expired verification token');
    verificationTokens.delete(token);
    return null;
  }
  
  // Token is valid, remove it (one-time use)
  verificationTokens.delete(token);
  logger.info({ userId: data.userId, email: data.email }, 'Email verification token validated');
  
  return { userId: data.userId, email: data.email };
}

/**
 * Send verification email
 * In production, integrate with SendGrid, Mailgun, or similar service
 */
export async function sendVerificationEmail(email: string, token: string, baseUrl: string): Promise<boolean> {
  try {
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
    
    // Log the verification URL (in production, send actual email)
    logger.info(
      { 
        email, 
        verificationUrl,
        // In development, log the full URL
        ...(process.env.NODE_ENV === 'development' && { 
          devVerificationUrl: verificationUrl 
        })
      }, 
      'Verification email sent (logged for development)'
    );
    
    // TODO: In production, integrate with email service
    // Example with SendGrid:
    // await sgMail.send({
    //   to: email,
    //   from: 'noreply@cravedartisan.com',
    //   subject: 'Verify your Craved Artisan email',
    //   html: `
    //     <h1>Welcome to Craved Artisan!</h1>
    //     <p>Please verify your email address by clicking the link below:</p>
    //     <a href="${verificationUrl}">Verify Email</a>
    //     <p>This link will expire in 24 hours.</p>
    //   `
    // });
    
    // For now, just log it
    console.log('\n📧 EMAIL VERIFICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`To: ${email}`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return true;
  } catch (error) {
    logger.error({ error, email }, 'Failed to send verification email');
    return false;
  }
}

/**
 * Send welcome email after successful signup
 */
export async function sendWelcomeEmail(email: string, name: string, role: string): Promise<boolean> {
  try {
    logger.info({ email, name, role }, 'Welcome email sent');
    
    // TODO: Integrate with email service in production
    console.log('\n✉️  WELCOME EMAIL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Role: ${role}`);
    console.log(`Message: Welcome to Craved Artisan!`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return true;
  } catch (error) {
    logger.error({ error, email }, 'Failed to send welcome email');
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string, baseUrl: string): Promise<boolean> {
  try {
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    
    logger.info({ email }, 'Password reset email sent');
    
    // TODO: Integrate with email service in production
    console.log('\n🔐 PASSWORD RESET');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`To: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return true;
  } catch (error) {
    logger.error({ error, email }, 'Failed to send password reset email');
    return false;
  }
}

/**
 * Clean up expired verification tokens (should be run periodically)
 */
export function cleanupExpiredTokens(): void {
  const now = new Date();
  let cleaned = 0;
  
  for (const [token, data] of verificationTokens.entries()) {
    if (data.expiresAt < now) {
      verificationTokens.delete(token);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    logger.info({ cleaned }, 'Cleaned up expired verification tokens');
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

