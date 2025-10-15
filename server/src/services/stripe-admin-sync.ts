import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { logger } from '../logger';

const prisma = new PrismaClient();

// Initialize Stripe if API key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null;

interface StripeAccountStatus {
  accountId: string;
  payoutsEnabled: boolean;
  requirementsDue: string[];
  tosAcceptedAt: Date | null;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
}

/**
 * Service for syncing Stripe Connect account data with admin user management
 */
export class StripeAdminSyncService {
  
  /**
   * Pull current account status from Stripe for a user
   */
  async pullAccountStatus(userId: string): Promise<StripeAccountStatus | null> {
    if (!stripe) {
      logger.warn('Stripe not configured, skipping account status pull');
      return null;
    }
    
    try {
      // Get user's Stripe account ID from vendor or coordinator profile
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          vendorProfile: true,
          coordinatorProfile: true
        }
      });
      
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
      
      const stripeAccountId = user.vendorProfile?.stripeAccountId || 
                             user.coordinatorProfile?.stripeAccountId;
      
      if (!stripeAccountId) {
        logger.info(`No Stripe account found for user ${userId}`);
        return null;
      }
      
      // Fetch account from Stripe
      const account = await stripe.accounts.retrieve(stripeAccountId);
      
      // Parse requirements
      const requirementsDue = [
        ...(account.requirements?.currently_due || []),
        ...(account.requirements?.eventually_due || [])
      ].filter((value, index, self) => self.indexOf(value) === index); // Unique values
      
      const status: StripeAccountStatus = {
        accountId: stripeAccountId,
        payoutsEnabled: account.payouts_enabled || false,
        requirementsDue,
        tosAcceptedAt: account.tos_acceptance?.date 
          ? new Date(account.tos_acceptance.date * 1000) 
          : null,
        detailsSubmitted: account.details_submitted || false,
        chargesEnabled: account.charges_enabled || false
      };
      
      logger.info(`Pulled Stripe account status for user ${userId}`, {
        userId,
        accountId: stripeAccountId,
        payoutsEnabled: status.payoutsEnabled,
        requirementsDueCount: status.requirementsDue.length
      });
      
      return status;
    } catch (error) {
      logger.error(`Failed to pull Stripe account status for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Refresh requirements for a user's Stripe account
   */
  async refreshRequirements(userId: string): Promise<string[]> {
    const status = await this.pullAccountStatus(userId);
    
    if (!status) {
      return [];
    }
    
    // Update or create StripeAccountLink record
    await prisma.stripeAccountLink.upsert({
      where: { userId },
      update: {
        payoutsEnabled: status.payoutsEnabled,
        requirementsDue: JSON.stringify(status.requirementsDue),
        tosAcceptedAt: status.tosAcceptedAt,
        updatedAt: new Date()
      },
      create: {
        userId,
        accountId: status.accountId,
        payoutsEnabled: status.payoutsEnabled,
        requirementsDue: JSON.stringify(status.requirementsDue),
        tosAcceptedAt: status.tosAcceptedAt
      }
    });
    
    logger.info(`Refreshed Stripe requirements for user ${userId}`, {
      userId,
      requirementsDueCount: status.requirementsDue.length
    });
    
    return status.requirementsDue;
  }
  
  /**
   * Nightly batch sync for all users with Stripe accounts
   */
  async syncAllAccounts(): Promise<{ success: number; failed: number }> {
    if (!stripe) {
      logger.warn('Stripe not configured, skipping batch sync');
      return { success: 0, failed: 0 };
    }
    
    try {
      // Get all users with Stripe accounts
      const [vendors, coordinators] = await Promise.all([
        prisma.vendorProfile.findMany({
          where: {
            stripeAccountId: { not: null }
          },
          select: {
            userId: true,
            stripeAccountId: true
          }
        }),
        prisma.eventCoordinatorProfile.findMany({
          where: {
            stripeAccountId: { not: null }
          },
          select: {
            userId: true,
            stripeAccountId: true
          }
        })
      ]);
      
      const usersToSync = [
        ...vendors.map(v => v.userId),
        ...coordinators.map(c => c.userId)
      ];
      
      let success = 0;
      let failed = 0;
      
      for (const userId of usersToSync) {
        try {
          await this.refreshRequirements(userId);
          success++;
        } catch (error) {
          logger.error(`Failed to sync Stripe account for user ${userId}:`, error);
          failed++;
        }
      }
      
      logger.info(`Stripe batch sync completed`, {
        total: usersToSync.length,
        success,
        failed
      });
      
      return { success, failed };
    } catch (error) {
      logger.error('Stripe batch sync error:', error);
      throw error;
    }
  }
  
  /**
   * Get payout status for a user
   */
  async getPayoutStatus(userId: string): Promise<{
    enabled: boolean;
    nextPayoutDate: Date | null;
    balance: { available: number; pending: number };
  } | null> {
    if (!stripe) {
      logger.warn('Stripe not configured');
      return null;
    }
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          vendorProfile: true,
          coordinatorProfile: true
        }
      });
      
      const stripeAccountId = user?.vendorProfile?.stripeAccountId || 
                             user?.coordinatorProfile?.stripeAccountId;
      
      if (!stripeAccountId) {
        return null;
      }
      
      // Get balance
      const balance = await stripe.balance.retrieve({
        stripeAccount: stripeAccountId
      });
      
      const available = balance.available.reduce((sum, b) => sum + b.amount, 0) / 100;
      const pending = balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100;
      
      // Get next payout
      const payouts = await stripe.payouts.list({
        limit: 1,
        stripeAccount: stripeAccountId
      });
      
      const nextPayoutDate = payouts.data.length > 0
        ? new Date(payouts.data[0].arrival_date * 1000)
        : null;
      
      return {
        enabled: balance.livemode,
        nextPayoutDate,
        balance: { available, pending }
      };
    } catch (error) {
      logger.error(`Failed to get payout status for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Handle Stripe webhook for account updates
   */
  async handleAccountUpdateWebhook(event: Stripe.Event): Promise<void> {
    try {
      const account = event.data.object as Stripe.Account;
      
      // Find user by Stripe account ID
      const vendor = await prisma.vendorProfile.findFirst({
        where: { stripeAccountId: account.id }
      });
      
      const coordinator = await prisma.eventCoordinatorProfile.findFirst({
        where: { stripeAccountId: account.id }
      });
      
      const userId = vendor?.userId || coordinator?.userId;
      
      if (!userId) {
        logger.warn(`No user found for Stripe account ${account.id}`);
        return;
      }
      
      // Refresh account status
      await this.refreshRequirements(userId);
      
      logger.info(`Processed Stripe webhook for user ${userId}`, {
        userId,
        eventType: event.type,
        accountId: account.id
      });
    } catch (error) {
      logger.error('Stripe webhook processing error:', error);
      throw error;
    }
  }
  
  /**
   * Re-sync Stripe account for admin troubleshooting
   */
  async reSyncAccount(userId: string, adminId: string): Promise<StripeAccountStatus | null> {
    logger.info(`Admin ${adminId} triggered Stripe re-sync for user ${userId}`);
    
    const status = await this.pullAccountStatus(userId);
    
    if (status) {
      await this.refreshRequirements(userId);
      
      // Log admin action
      await prisma.adminAudit.create({
        data: {
          adminId,
          action: 'STRIPE_RESYNC',
          target: `User:${userId}`,
          payload: {
            accountId: status.accountId,
            payoutsEnabled: status.payoutsEnabled,
            requirementsDueCount: status.requirementsDue.length
          }
        }
      });
    }
    
    return status;
  }
  
  /**
   * Generate new onboarding link for user
   */
  async generateOnboardingLink(userId: string, adminId?: string): Promise<string | null> {
    if (!stripe) {
      logger.warn('Stripe not configured');
      return null;
    }
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          vendorProfile: true,
          coordinatorProfile: true
        }
      });
      
      const stripeAccountId = user?.vendorProfile?.stripeAccountId || 
                             user?.coordinatorProfile?.stripeAccountId;
      
      if (!stripeAccountId) {
        throw new Error('No Stripe account found for user');
      }
      
      // Create account link
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: `${process.env.CLIENT_URL}/dashboard/vendor/stripe/refresh`,
        return_url: `${process.env.CLIENT_URL}/dashboard/vendor/stripe/return`,
        type: 'account_onboarding'
      });
      
      // Update onboarding URL in profile
      if (user?.vendorProfile) {
        await prisma.vendorProfile.update({
          where: { id: user.vendorProfile.id },
          data: { stripeOnboardingUrl: accountLink.url }
        });
      } else if (user?.coordinatorProfile) {
        await prisma.eventCoordinatorProfile.update({
          where: { id: user.coordinatorProfile.id },
          data: { stripeOnboardingUrl: accountLink.url }
        });
      }
      
      if (adminId) {
        await prisma.adminAudit.create({
          data: {
            adminId,
            action: 'STRIPE_ONBOARDING_LINK_GENERATED',
            target: `User:${userId}`,
            payload: { accountId: stripeAccountId }
          }
        });
      }
      
      logger.info(`Generated Stripe onboarding link for user ${userId}`);
      
      return accountLink.url;
    } catch (error) {
      logger.error(`Failed to generate onboarding link for user ${userId}:`, error);
      throw error;
    }
  }
}

export const stripeAdminSyncService = new StripeAdminSyncService();

