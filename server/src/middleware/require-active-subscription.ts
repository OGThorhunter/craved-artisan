import { Response, NextFunction } from 'express';
import { VendorSubscriptionStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { logger } from '../logger';
import { AuthenticatedRequest } from '../types/session';

export async function requireActiveSubscription(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
      select: {
        id: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        subscriptionCurrentPeriodEnd: true,
      },
    });

    if (!vendor) {
      return res.status(404).json({ 
        error: 'Vendor profile not found',
        message: 'Vendor profile not found for this user',
      });
    }

    const now = new Date();
    const isInTrial = vendor.trialEndsAt && vendor.trialEndsAt > now;
    const isActive = vendor.subscriptionStatus === VendorSubscriptionStatus.ACTIVE;

    if (!isInTrial && !isActive) {
      logger.warn({ 
        vendorId: vendor.id, 
        subscriptionStatus: vendor.subscriptionStatus,
        trialEndsAt: vendor.trialEndsAt,
      }, 'Vendor access denied - no active subscription');

      return res.status(403).json({ 
        error: 'Subscription required',
        message: 'Please update your subscription to accept orders',
        subscriptionStatus: vendor.subscriptionStatus,
        requiresAction: true,
      });
    }

    // Subscription is valid, continue
    next();
  } catch (error) {
    logger.error({ error }, 'Error checking subscription status');
    res.status(500).json({ 
      error: 'Failed to verify subscription',
      message: 'An error occurred while verifying your subscription status',
    });
  }
}

