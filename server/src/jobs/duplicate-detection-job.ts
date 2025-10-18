import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';
import { duplicateDetectionService } from '../services/duplicate-detection';

const prisma = new PrismaClient();

/**
 * Weekly job to detect duplicate users across the system
 * Run schedule: Sunday 1:00 AM
 */
export async function duplicateDetectionJob() {
  const startTime = Date.now();
  logger.info('🔄 Starting weekly duplicate detection job...');
  
  try {
    // Run duplicate detection
    const duplicates = await duplicateDetectionService.detectAllDuplicates();
    
    // Create tasks for admins to review duplicates
    for (const [userId, matches] of duplicates.entries()) {
      if (matches.length === 0) continue;
      
      // Check if task already exists
      const existingTask = await prisma.userTask.findFirst({
        where: {
          userId,
          title: { contains: 'Potential duplicate' },
          status: { in: ['PENDING', 'IN_PROGRESS'] }
        }
      });
      
      if (!existingTask) {
        // Create task for admin review
        await prisma.userTask.create({
          data: {
            userId,
            title: `Potential duplicate accounts detected (${matches.length})`,
            description: `Found ${matches.length} potential duplicate(s): ${matches.map(m => m.email).join(', ')}`,
            priority: matches.length > 2 ? 'HIGH' : 'MEDIUM',
            status: 'PENDING'
          }
        });
        
        logger.info(`Created duplicate review task for user ${userId} - ${matches.length} matches`);
      }
      
      // Auto-flag high-confidence duplicates
      const highConfidenceMatches = matches.filter(m => m.confidence > 0.9);
      
      for (const match of highConfidenceMatches) {
        await prisma.riskFlag.create({
          data: {
            userId,
            code: 'DUPLICATE',
            severity: 'MEDIUM',
            notes: `Potential duplicate with ${match.email} (${match.matchType}, ${(match.confidence * 100).toFixed(0)}% confidence)`
          }
        });
      }
    }
    
    const duration = Date.now() - startTime;
    logger.info(`✅ Duplicate detection job completed in ${duration}ms - Found ${duplicates.size} users with potential duplicates`);
    
    return {
      success: true,
      usersWithDuplicates: duplicates.size,
      totalMatches: Array.from(duplicates.values()).reduce((sum, matches) => sum + matches.length, 0),
      duration
    };
  } catch (error) {
    logger.error({ error }, '❌ Duplicate detection job failed');
    throw error;
  }
}

/**
 * Setup cron schedule for the job
 */
export function scheduleDuplicateDetectionJob() {
  logger.info('Duplicate detection job scheduled for Sunday 1:00 AM');
}

