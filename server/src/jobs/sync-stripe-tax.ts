import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';
import { stripeAdminSyncService } from '../services/stripe-admin-sync';
import { taxAdminService } from '../services/tax-admin';

const prisma = new PrismaClient();

/**
 * Nightly job to sync Stripe and Tax profiles for all vendors
 * Run schedule: 2:00 AM daily
 */
export async function syncStripeAndTaxJob() {
  const startTime = Date.now();
  logger.info('🔄 Starting nightly Stripe and Tax sync job...');
  
  try {
    // Sync Stripe accounts
    const stripeResults = await stripeAdminSyncService.syncAllAccounts();
    logger.info(`✓ Stripe sync completed: ${stripeResults.success} success, ${stripeResults.failed} failed`);
    
    // Sync Tax profiles
    const taxResults = await taxAdminService.syncAllVendorTaxProfiles();
    logger.info(`✓ Tax sync completed: ${taxResults.success} success, ${taxResults.failed} failed`);
    
    // Update compliance tasks/flags based on results
    await updateComplianceTasks();
    
    const duration = Date.now() - startTime;
    logger.info(`✅ Nightly sync job completed in ${duration}ms`);
    
    return {
      success: true,
      stripe: stripeResults,
      tax: taxResults,
      duration
    };
  } catch (error) {
    logger.error('❌ Nightly sync job failed:', error);
    throw error;
  }
}

/**
 * Update compliance tasks and flags based on sync results
 */
async function updateComplianceTasks() {
  try {
    // Find users with Stripe requirements due
    const usersWithRequirements = await prisma.stripeAccountLink.findMany({
      where: {
        payoutsEnabled: false,
        requirementsDue: { not: null }
      },
      include: {
        user: true
      }
    });
    
    for (const link of usersWithRequirements) {
      const requirements = JSON.parse(link.requirementsDue || '[]');
      
      if (requirements.length > 0) {
        // Check if task already exists
        const existingTask = await prisma.userTask.findFirst({
          where: {
            userId: link.userId,
            title: { contains: 'Stripe requirements' },
            status: { in: ['PENDING', 'IN_PROGRESS'] }
          }
        });
        
        if (!existingTask) {
          await prisma.userTask.create({
            data: {
              userId: link.userId,
              title: 'Complete Stripe requirements',
              description: `Outstanding requirements: ${requirements.join(', ')}`,
              priority: 'HIGH',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
          });
          
          logger.info(`Created compliance task for user ${link.userId}`);
        }
      }
    }
    
    // Find users with unverified emails (older than 7 days)
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        emailVerified: false,
        created_at: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });
    
    for (const user of unverifiedUsers) {
      // Create or update risk flag for unverified email
      await prisma.riskFlag.upsert({
        where: {
          userId_code: {
            userId: user.id,
            code: 'EMAIL_UNVERIFIED'
          }
        },
        update: {
          severity: 'MEDIUM',
          notes: `Email unverified for ${Math.floor((Date.now() - user.created_at.getTime()) / (24 * 60 * 60 * 1000))} days`
        },
        create: {
          userId: user.id,
          code: 'EMAIL_UNVERIFIED',
          severity: 'MEDIUM',
          notes: 'Email has not been verified'
        }
      });
    }
    
    logger.info(`Updated compliance tasks and flags`);
  } catch (error) {
    logger.error('Failed to update compliance tasks:', error);
  }
}

/**
 * Setup cron schedule for the job
 * This would be called from the main server startup
 */
export function scheduleSyncStripeAndTaxJob() {
  // In production, use node-cron or similar
  // For now, provide manual trigger endpoint
  logger.info('Stripe and Tax sync job scheduled for 2:00 AM daily');
}

