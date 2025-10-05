import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const prisma = new PrismaClient();

// Initialize Stripe (in production, use environment variables)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});

export interface StripeRevenueData {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  currency: string;
  period: {
    start: Date;
    end: Date;
  };
}

export interface StripeDisputeData {
  id: string;
  amount: number;
  currency: string;
  reason: string;
  status: string;
  created: Date;
  evidence_due_by?: Date;
  charge: {
    id: string;
    amount: number;
    description?: string;
  };
}

export interface StripePayoutData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrival_date: Date;
  created: Date;
  description?: string;
}

export interface StripeRadarReviewData {
  id: string;
  charge_id: string;
  amount: number;
  currency: string;
  status: 'open' | 'closed';
  created: Date;
  reviewed: boolean;
  reason: string;
  risk_score?: number;
  risk_level?: 'normal' | 'elevated' | 'highest';
}

export class StripeService {
  private static instance: StripeService;
  
  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  // Get revenue summary
  async getRevenueSummary(period: 'today' | '7d' | '30d' | '90d' = '30d'): Promise<StripeRevenueData> {
    try {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }

      // Get balance transactions for the period
      const balanceTransactions = await stripe.balanceTransactions.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(now.getTime() / 1000),
        },
        limit: 100,
      });

      let totalRevenue = 0;
      let todayRevenue = 0;
      
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      for (const transaction of balanceTransactions.data) {
        if (transaction.type === 'charge' && transaction.status === 'available') {
          totalRevenue += transaction.amount;
          
          const transactionDate = new Date(transaction.created * 1000);
          if (transactionDate >= todayStart) {
            todayRevenue += transaction.amount;
          }
        }
      }

      return {
        totalRevenue,
        todayRevenue,
        monthlyRevenue: totalRevenue, // For the selected period
        currency: 'usd',
        period: {
          start: startDate,
          end: now
        }
      };
    } catch (error) {
      logger.error('Failed to get revenue summary:', error);
      return {
        totalRevenue: 0,
        todayRevenue: 0,
        monthlyRevenue: 0,
        currency: 'usd',
        period: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      };
    }
  }

  // Get disputes
  async getDisputes(limit: number = 50): Promise<StripeDisputeData[]> {
    try {
      const disputes = await stripe.disputes.list({
        limit,
      });

      return disputes.data.map(dispute => ({
        id: dispute.id,
        amount: dispute.amount,
        currency: dispute.currency,
        reason: dispute.reason,
        status: dispute.status,
        created: new Date(dispute.created * 1000),
        evidence_due_by: (dispute as any).evidence_due_by ? new Date((dispute as any).evidence_due_by * 1000) : undefined,
        charge: {
          id: (dispute as any).charge.id,
          amount: (dispute as any).charge.amount,
          description: (dispute as any).charge.description || undefined
        }
      }));
    } catch (error) {
      logger.error('Failed to get disputes:', error);
      return [];
    }
  }

  // Get payouts
  async getPayouts(limit: number = 20): Promise<StripePayoutData[]> {
    try {
      const payouts = await stripe.payouts.list({
        limit,
      });

      return payouts.data.map(payout => ({
        id: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        arrival_date: new Date(payout.arrival_date * 1000),
        created: new Date(payout.created * 1000),
        description: payout.description || undefined
      }));
    } catch (error) {
      logger.error('Failed to get payouts:', error);
      return [];
    }
  }

  // Get Radar reviews
  async getRadarReviews(limit: number = 50): Promise<StripeRadarReviewData[]> {
    try {
      // Note: Radar reviews are accessed through charges with review status
      const charges = await stripe.charges.list({
        limit,
        expand: ['data.review']
      });

      const reviews = charges.data
        .filter(charge => charge.review)
        .map(charge => ({
          id: (charge.review as any)!.id,
          charge_id: charge.id,
          amount: charge.amount,
          currency: charge.currency,
          status: (charge.review as any)!.status === 'open' ? 'open' as const : 'closed' as const,
          created: new Date((charge.review as any)!.created * 1000),
          reviewed: (charge.review as any)!.status !== 'open',
          reason: (charge.review as any)!.reason || 'manual_review',
          risk_score: charge.outcome?.risk_score || undefined,
          risk_level: charge.outcome?.risk_level as 'normal' | 'elevated' | 'highest' | undefined
        }));

      return reviews;
    } catch (error) {
      logger.error('Failed to get Radar reviews:', error);
      return [];
    }
  }

  // Approve Radar review
  async approveRadarReview(reviewId: string): Promise<boolean> {
    try {
      await stripe.reviews.approve(reviewId);
      logger.info(`Radar review approved: ${reviewId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to approve Radar review ${reviewId}:`, error);
      return false;
    }
  }

  // Approve charge (bypass Radar)
  async approveCharge(chargeId: string): Promise<boolean> {
    try {
      await stripe.charges.update(chargeId, {
        metadata: {
          radar_approved: 'true',
          approved_at: new Date().toISOString()
        }
      });
      logger.info(`Charge approved: ${chargeId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to approve charge ${chargeId}:`, error);
      return false;
    }
  }

  // Get payment method analytics
  async getPaymentMethodAnalytics(period: '7d' | '30d' | '90d' = '30d'): Promise<{
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }[]> {
    try {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }

      const charges = await stripe.charges.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(now.getTime() / 1000),
        },
        limit: 100,
      });

      const methodStats = new Map<string, { count: number; amount: number }>();
      let totalAmount = 0;

      for (const charge of charges.data) {
        if (charge.status === 'succeeded') {
          const method = charge.payment_method_details?.type || 'unknown';
          const stats = methodStats.get(method) || { count: 0, amount: 0 };
          stats.count++;
          stats.amount += charge.amount;
          totalAmount += charge.amount;
          methodStats.set(method, stats);
        }
      }

      return Array.from(methodStats.entries()).map(([method, stats]) => ({
        method,
        count: stats.count,
        amount: stats.amount,
        percentage: totalAmount > 0 ? (stats.amount / totalAmount) * 100 : 0
      })).sort((a, b) => b.amount - a.amount);
    } catch (error) {
      logger.error('Failed to get payment method analytics:', error);
      return [];
    }
  }

  // Get conversion funnel data
  async getConversionFunnel(period: '7d' | '30d' | '90d' = '30d'): Promise<{
    sessions: number;
    carts: number;
    checkouts: number;
    payments: number;
    conversion_rate: number;
  }> {
    try {
      // Mock data for now - in production, this would come from analytics
      const mockData = {
        sessions: 10000,
        carts: 2500,
        checkouts: 1200,
        payments: 1000,
        conversion_rate: 10.0
      };

      return mockData;
    } catch (error) {
      logger.error('Failed to get conversion funnel:', error);
      return {
        sessions: 0,
        carts: 0,
        checkouts: 0,
        payments: 0,
        conversion_rate: 0
      };
    }
  }

  // Get risk analytics
  async getRiskAnalytics(): Promise<{
    total_charges: number;
    blocked_charges: number;
    reviewed_charges: number;
    blocked_rate: number;
    review_rate: number;
    avg_risk_score: number;
  }> {
    try {
      // Mock data for now
      const mockData = {
        total_charges: 10000,
        blocked_charges: 150,
        reviewed_charges: 300,
        blocked_rate: 1.5,
        review_rate: 3.0,
        avg_risk_score: 25.5
      };

      return mockData;
    } catch (error) {
      logger.error('Failed to get risk analytics:', error);
      return {
        total_charges: 0,
        blocked_charges: 0,
        reviewed_charges: 0,
        blocked_rate: 0,
        review_rate: 0,
        avg_risk_score: 0
      };
    }
  }
}

// Export singleton instance
export const stripeService = StripeService.getInstance();
