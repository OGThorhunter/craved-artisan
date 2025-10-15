import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';
import { riskScoringService } from '../services/risk-scoring';

const prisma = new PrismaClient();

/**
 * Daily job to recalculate risk scores for users
 * Run schedule: 3:00 AM daily
 * Priority: High-risk users, recent activity, new users
 */
export async function riskScoreUpdateJob() {
  const startTime = Date.now();
  logger.info('🔄 Starting daily risk score update job...');
  
  try {
    // Priority 1: Users with existing high risk scores
    const highRiskUsers = await prisma.user.findMany({
      where: {
        riskScore: { gte: 60 },
        status: 'ACTIVE'
      },
      select: { id: true }
    });
    
    logger.info(`Updating ${highRiskUsers.length} high-risk users...`);
    
    for (const user of highRiskUsers) {
      try {
        await riskScoringService.updateUserRiskScore(user.id);
      } catch (error) {
        logger.error(`Failed to update risk score for user ${user.id}:`, error);
      }
    }
    
    // Priority 2: Users with recent security events
    const recentSecurityEventUsers = await prisma.securityEvent.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        },
        type: { in: ['FAILED_LOGIN', 'SUSPICIOUS_ACTIVITY'] }
      },
      distinct: ['userId'],
      select: { userId: true }
    });
    
    logger.info(`Updating ${recentSecurityEventUsers.length} users with recent security events...`);
    
    for (const event of recentSecurityEventUsers) {
      try {
        await riskScoringService.updateUserRiskScore(event.userId);
      } catch (error) {
        logger.error(`Failed to update risk score for user ${event.userId}:`, error);
      }
    }
    
    // Priority 3: New users (created in last 30 days)
    const newUsers = await prisma.user.findMany({
      where: {
        created_at: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        status: 'ACTIVE'
      },
      select: { id: true }
    });
    
    logger.info(`Updating ${newUsers.length} new users...`);
    
    for (const user of newUsers) {
      try {
        await riskScoringService.updateUserRiskScore(user.id);
      } catch (error) {
        logger.error(`Failed to update risk score for user ${user.id}:`, error);
      }
    }
    
    const duration = Date.now() - startTime;
    const totalUpdated = highRiskUsers.length + recentSecurityEventUsers.length + newUsers.length;
    
    logger.info(`✅ Risk score update job completed in ${duration}ms - Updated ${totalUpdated} users`);
    
    return {
      success: true,
      updated: totalUpdated,
      duration
    };
  } catch (error) {
    logger.error('❌ Risk score update job failed:', error);
    throw error;
  }
}

/**
 * On-demand recalculation for all users (admin-triggered)
 */
export async function recalculateAllRiskScores() {
  logger.info('🔄 Starting full risk score recalculation...');
  
  try {
    const count = await riskScoringService.recalculateAllRiskScores();
    logger.info(`✅ Recalculated risk scores for ${count} users`);
    return { success: true, count };
  } catch (error) {
    logger.error('❌ Full risk score recalculation failed:', error);
    throw error;
  }
}

/**
 * Setup cron schedule for the job
 */
export function scheduleRiskScoreUpdateJob() {
  logger.info('Risk score update job scheduled for 3:00 AM daily');
}

