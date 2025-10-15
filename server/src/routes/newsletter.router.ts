import { Router } from 'express';
import { db } from '../db';
import { logger } from '../logger';
import { z } from 'zod';

export const newsletterRouter = Router();

// Schema for newsletter subscription
const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Subscribe to newsletter
newsletterRouter.post('/subscribe', async (req, res) => {
  try {
    const { email } = subscribeSchema.parse(req.body);

    logger.info('Newsletter subscription request', { email });

    // Check if email already exists
    const existing = await db.newsletterSubscription.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.status === 'active') {
        return res.status(409).json({
          success: false,
          message: 'This email is already subscribed to our newsletter.',
        });
      } else if (existing.status === 'unsubscribed') {
        // Reactivate subscription
        await db.newsletterSubscription.update({
          where: { email },
          data: {
            status: 'active',
            subscribedAt: new Date(),
            unsubscribedAt: null,
          },
        });
        
        logger.info('Newsletter subscription reactivated', { email });
        
        return res.json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.',
        });
      }
    }

    // Create new subscription
    await db.newsletterSubscription.create({
      data: {
        email,
        status: 'active',
      },
    });

    logger.info('New newsletter subscription created', { email });

    res.json({
      success: true,
      message: 'Successfully subscribed! Check your email to confirm.',
    });
  } catch (error: any) {
    logger.error('Newsletter subscription error', { error: error.message, stack: error.stack });

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to subscribe. Please try again later.',
    });
  }
});

// Unsubscribe from newsletter
newsletterRouter.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = subscribeSchema.parse(req.body);

    logger.info('Newsletter unsubscribe request', { email });

    const existing = await db.newsletterSubscription.findUnique({
      where: { email },
    });

    if (!existing || existing.status === 'unsubscribed') {
      return res.status(404).json({
        success: false,
        message: 'Email not found or already unsubscribed.',
      });
    }

    await db.newsletterSubscription.update({
      where: { email },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
      },
    });

    logger.info('Newsletter unsubscribed', { email });

    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter.',
    });
  } catch (error: any) {
    logger.error('Newsletter unsubscribe error', { error: error.message, stack: error.stack });

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe. Please try again later.',
    });
  }
});

