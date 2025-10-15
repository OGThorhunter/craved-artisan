import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const prisma = new PrismaClient();

interface RiskFactors {
  disputeCount: number;
  refundRate: number;
  ipVelocity: number;
  accountAge: number;
  verificationStatus: {
    emailVerified: boolean;
    phoneVerified: boolean;
    kycVerified: boolean;
  };
  orderVolume: number;
  failedLoginAttempts: number;
}

interface RiskScoreResult {
  score: number; // 0-100
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: {
    disputes: number;
    refunds: number;
    ipVelocity: number;
    accountAge: number;
    verification: number;
    orderVolume: number;
    failedLogins: number;
  };
  flags: string[];
}

/**
 * Calculate risk score for a user based on multiple factors
 * Score ranges:
 * 0-25: LOW
 * 26-50: MEDIUM
 * 51-75: HIGH
 * 76-100: CRITICAL
 */
export class RiskScoringService {
  
  /**
   * Calculate comprehensive risk score for a user
   */
  async calculateUserRiskScore(userId: string): Promise<RiskScoreResult> {
    try {
      const factors = await this.collectRiskFactors(userId);
      const score = this.computeRiskScore(factors);
      const level = this.getRiskLevel(score);
      const flags = this.identifyRiskFlags(factors, score);
      
      // Calculate individual factor contributions
      const factorScores = {
        disputes: this.calculateDisputeScore(factors.disputeCount),
        refunds: this.calculateRefundScore(factors.refundRate),
        ipVelocity: this.calculateIpVelocityScore(factors.ipVelocity),
        accountAge: this.calculateAccountAgeScore(factors.accountAge),
        verification: this.calculateVerificationScore(factors.verificationStatus),
        orderVolume: this.calculateOrderVolumeScore(factors.orderVolume),
        failedLogins: this.calculateFailedLoginScore(factors.failedLoginAttempts)
      };
      
      return {
        score,
        level,
        factors: factorScores,
        flags
      };
    } catch (error) {
      logger.error('Risk score calculation error:', error);
      throw error;
    }
  }
  
  /**
   * Collect risk factors for a user from database
   */
  private async collectRiskFactors(userId: string): Promise<RiskFactors> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          select: {
            status: true,
            totalAmount: true,
            createdAt: true
          }
        },
        securityEvents: {
          where: {
            type: 'FAILED_LOGIN'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 100
        }
      }
    });
    
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    // Count disputes (simulated - would come from Stripe)
    const disputeCount = 0; // TODO: Integrate with Stripe disputes API
    
    // Calculate refund rate
    const completedOrders = user.orders.filter(o => o.status === 'COMPLETED');
    const refundedOrders = user.orders.filter(o => o.status === 'REFUNDED');
    const refundRate = completedOrders.length > 0 
      ? (refundedOrders.length / completedOrders.length) * 100 
      : 0;
    
    // Calculate IP velocity (unique IPs in last 30 days)
    const recentSecurityEvents = user.securityEvents.filter(e => 
      e.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const uniqueIPs = new Set(recentSecurityEvents.map(e => e.ip).filter(Boolean));
    const ipVelocity = uniqueIPs.size;
    
    // Calculate account age in days
    const accountAge = Math.floor(
      (Date.now() - user.created_at.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Verification status
    const verificationStatus = {
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified || false,
      kycVerified: false // TODO: Add KYC verification status
    };
    
    // Order volume (total orders)
    const orderVolume = user.orders.length;
    
    // Failed login attempts in last 24 hours
    const failedLoginAttempts = user.securityEvents.filter(e => 
      e.type === 'FAILED_LOGIN' &&
      e.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;
    
    return {
      disputeCount,
      refundRate,
      ipVelocity,
      accountAge,
      verificationStatus,
      orderVolume,
      failedLoginAttempts
    };
  }
  
  /**
   * Compute overall risk score based on weighted factors
   */
  private computeRiskScore(factors: RiskFactors): number {
    const disputeScore = this.calculateDisputeScore(factors.disputeCount);
    const refundScore = this.calculateRefundScore(factors.refundRate);
    const ipScore = this.calculateIpVelocityScore(factors.ipVelocity);
    const ageScore = this.calculateAccountAgeScore(factors.accountAge);
    const verifyScore = this.calculateVerificationScore(factors.verificationStatus);
    const volumeScore = this.calculateOrderVolumeScore(factors.orderVolume);
    const loginScore = this.calculateFailedLoginScore(factors.failedLoginAttempts);
    
    // Weighted average (total = 100%)
    const weights = {
      disputes: 0.25,    // 25% - Most important
      refunds: 0.20,     // 20%
      ipVelocity: 0.15,  // 15%
      accountAge: 0.10,  // 10%
      verification: 0.15, // 15%
      orderVolume: 0.05, // 5%
      failedLogins: 0.10 // 10%
    };
    
    const totalScore = 
      disputeScore * weights.disputes +
      refundScore * weights.refunds +
      ipScore * weights.ipVelocity +
      ageScore * weights.accountAge +
      verifyScore * weights.verification +
      volumeScore * weights.orderVolume +
      loginScore * weights.failedLogins;
    
    return Math.min(100, Math.max(0, Math.round(totalScore)));
  }
  
  /**
   * Calculate dispute risk score (0-100)
   */
  private calculateDisputeScore(disputeCount: number): number {
    if (disputeCount === 0) return 0;
    if (disputeCount === 1) return 40;
    if (disputeCount === 2) return 70;
    return 100; // 3+ disputes = max risk
  }
  
  /**
   * Calculate refund rate risk score (0-100)
   */
  private calculateRefundScore(refundRate: number): number {
    if (refundRate === 0) return 0;
    if (refundRate < 5) return 20;
    if (refundRate < 10) return 40;
    if (refundRate < 20) return 60;
    if (refundRate < 30) return 80;
    return 100; // 30%+ refund rate = max risk
  }
  
  /**
   * Calculate IP velocity risk score (0-100)
   */
  private calculateIpVelocityScore(uniqueIPCount: number): number {
    if (uniqueIPCount <= 2) return 0;  // Normal
    if (uniqueIPCount <= 5) return 20; // Slightly suspicious
    if (uniqueIPCount <= 10) return 50; // Suspicious
    if (uniqueIPCount <= 20) return 75; // Very suspicious
    return 100; // 20+ IPs in 30 days = max risk
  }
  
  /**
   * Calculate account age risk score (0-100)
   * Newer accounts are riskier
   */
  private calculateAccountAgeScore(ageDays: number): number {
    if (ageDays > 365) return 0;  // 1+ year old = no risk
    if (ageDays > 180) return 10; // 6+ months = low risk
    if (ageDays > 90) return 30;  // 3+ months = medium risk
    if (ageDays > 30) return 50;  // 1+ month = higher risk
    if (ageDays > 7) return 70;   // 1+ week = high risk
    return 90; // Less than 1 week = very high risk
  }
  
  /**
   * Calculate verification status risk score (0-100)
   * Unverified accounts are riskier
   */
  private calculateVerificationScore(status: RiskFactors['verificationStatus']): number {
    const verified = [
      status.emailVerified,
      status.phoneVerified,
      status.kycVerified
    ].filter(Boolean).length;
    
    if (verified === 3) return 0;   // All verified = no risk
    if (verified === 2) return 20;  // 2 verified = low risk
    if (verified === 1) return 50;  // 1 verified = medium risk
    return 80; // None verified = high risk
  }
  
  /**
   * Calculate order volume risk score (0-100)
   * Very low or very high volume can be risky
   */
  private calculateOrderVolumeScore(orderCount: number): number {
    if (orderCount === 0) return 30; // No orders = some risk
    if (orderCount >= 1 && orderCount <= 50) return 0; // Normal volume = no risk
    if (orderCount <= 100) return 10; // Higher volume = slight risk
    if (orderCount <= 200) return 20; // Very high volume = medium risk
    return 40; // Extremely high volume = higher risk (possible abuse)
  }
  
  /**
   * Calculate failed login attempts risk score (0-100)
   */
  private calculateFailedLoginScore(failedAttempts: number): number {
    if (failedAttempts === 0) return 0;
    if (failedAttempts <= 2) return 20;
    if (failedAttempts <= 5) return 50;
    if (failedAttempts <= 10) return 80;
    return 100; // 10+ failed logins in 24h = max risk
  }
  
  /**
   * Determine risk level from score
   */
  private getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score <= 25) return 'LOW';
    if (score <= 50) return 'MEDIUM';
    if (score <= 75) return 'HIGH';
    return 'CRITICAL';
  }
  
  /**
   * Identify specific risk flags based on factors and score
   */
  private identifyRiskFlags(factors: RiskFactors, score: number): string[] {
    const flags: string[] = [];
    
    if (factors.disputeCount > 0) flags.push('CHARGEBACK');
    if (factors.refundRate > 20) flags.push('HIGH_REFUND_RATE');
    if (factors.ipVelocity > 10) flags.push('IP_VELOCITY_HIGH');
    if (factors.accountAge < 7) flags.push('NEW_ACCOUNT');
    if (!factors.verificationStatus.emailVerified) flags.push('EMAIL_UNVERIFIED');
    if (!factors.verificationStatus.phoneVerified) flags.push('PHONE_UNVERIFIED');
    if (factors.failedLoginAttempts > 5) flags.push('FAILED_LOGIN_ATTEMPTS');
    if (score > 80) flags.push('FRAUD_SUSPECTED');
    
    return flags;
  }
  
  /**
   * Update user's risk score in database and create flags if needed
   */
  async updateUserRiskScore(userId: string): Promise<void> {
    try {
      const riskResult = await this.calculateUserRiskScore(userId);
      
      // Update user risk score
      await prisma.user.update({
        where: { id: userId },
        data: { riskScore: riskResult.score }
      });
      
      // Create risk flags if score is high
      if (riskResult.score > 60) {
        for (const flag of riskResult.flags) {
          // Check if flag already exists and is unresolved
          const existingFlag = await prisma.riskFlag.findFirst({
            where: {
              userId,
              code: flag,
              resolvedAt: null
            }
          });
          
          if (!existingFlag) {
            await prisma.riskFlag.create({
              data: {
                userId,
                code: flag,
                severity: riskResult.level,
                notes: `Auto-generated from risk score ${riskResult.score}`
              }
            });
          }
        }
      }
      
      logger.info(`Updated risk score for user ${userId}: ${riskResult.score} (${riskResult.level})`, {
        userId,
        score: riskResult.score,
        level: riskResult.level,
        flags: riskResult.flags
      });
    } catch (error) {
      logger.error(`Failed to update risk score for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Bulk recalculate risk scores for all users (or filtered subset)
   */
  async recalculateAllRiskScores(filters?: { minScore?: number }): Promise<number> {
    try {
      const users = await prisma.user.findMany({
        where: filters?.minScore ? { riskScore: { gte: filters.minScore } } : undefined,
        select: { id: true }
      });
      
      let updated = 0;
      for (const user of users) {
        try {
          await this.updateUserRiskScore(user.id);
          updated++;
        } catch (error) {
          logger.error(`Failed to update risk score for user ${user.id}:`, error);
        }
      }
      
      logger.info(`Recalculated risk scores for ${updated} users`);
      return updated;
    } catch (error) {
      logger.error('Bulk risk score recalculation error:', error);
      throw error;
    }
  }
}

export const riskScoringService = new RiskScoringService();

