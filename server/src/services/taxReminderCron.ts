import cron from 'node-cron';
import prisma from '../lib/prisma';
import {
  calculateQuarterlyTaxProjection,
  sendTaxReminder,
  getTaxSettings,
  TaxProjection
} from '../utils/taxProjection';
import { createLogger, format, transports } from 'winston';

// Create Winston logger for CRON jobs
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'tax-reminder-cron' },
  transports: [
    new transports.File({ filename: 'logs/tax-reminder-cron.log' }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

/**
 * Check for upcoming tax obligations and send reminders
 */
async function checkAndSendTaxReminders(): Promise<void> {
  try {
    logger.info('Starting tax reminder check...');

    // Get all active vendors
    const vendors = await prisma.vendorProfile.findMany({
      where: {
        stripeAccountStatus: 'active'
      },
      select: {
        id: true,
        storeName: true,
        user: {
          select: {
            email: true
          }
        }
      }
    });

    logger.info(`Found ${vendors.length} active vendors to check`);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Determine current quarter
    const currentQuarter = Math.floor(currentMonth / 3) + 1;
    const quarterMap = ['Q1', 'Q2', 'Q3', 'Q4'];
    const currentQuarterStr = quarterMap[currentQuarter - 1];

    let remindersSent = 0;
    let errors = 0;

    for (const vendor of vendors) {
      try {
        // Check current quarter projection
        const projection = await calculateQuarterlyTaxProjection(
          vendor.id,
          currentQuarterStr,
          currentYear
        );

        // Check if reminder should be sent based on days until due
        const taxSettings = await getTaxSettings();
        const shouldSendReminder = taxSettings.reminderDays.some(days => 
          projection.daysUntilDue === days
        );

        if (shouldSendReminder && projection.estimatedTax > 0) {
          logger.info(`Sending tax reminder to vendor ${vendor.storeName} for ${currentQuarterStr} ${currentYear}`);
          
          const reminderSent = await sendTaxReminder(vendor.id, projection);
          
          if (reminderSent) {
            remindersSent++;
            logger.info(`Tax reminder sent successfully to ${vendor.storeName}`);
          } else {
            errors++;
            logger.error(`Failed to send tax reminder to ${vendor.storeName}`);
          }
        }

        // Check for overdue obligations
        if (projection.status === 'overdue' && projection.estimatedTax > 0) {
          logger.warn(`Vendor ${vendor.storeName} has overdue tax obligation: ${projection.quarter} ${projection.year}`);
          
          // Send overdue reminder
          const overdueReminderSent = await sendTaxReminder(vendor.id, projection);
          
          if (overdueReminderSent) {
            remindersSent++;
            logger.info(`Overdue tax reminder sent to ${vendor.storeName}`);
          } else {
            errors++;
            logger.error(`Failed to send overdue tax reminder to ${vendor.storeName}`);
          }
        }

      } catch (error) {
        errors++;
        logger.error(`Error processing vendor ${vendor.storeName}:`, error);
      }
    }

    logger.info(`Tax reminder check completed. Reminders sent: ${remindersSent}, Errors: ${errors}`);

  } catch (error) {
    logger.error('Error in tax reminder check:', error);
  }
}

/**
 * Check for upcoming tax obligations in the next 30 days
 */
async function checkUpcomingObligations(): Promise<void> {
  try {
    logger.info('Checking for upcoming tax obligations...');

    const vendors = await prisma.vendorProfile.findMany({
      where: {
        stripeAccountStatus: 'active'
      },
      select: {
        id: true,
        storeName: true
      }
    });

    let upcomingCount = 0;

    for (const vendor of vendors) {
      try {
        // Check next 4 quarters for upcoming obligations
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3) + 1;
        const quarterMap = ['Q1', 'Q2', 'Q3', 'Q4'];

        for (let i = 0; i < 4; i++) {
          const quarterIndex = (currentQuarter + i - 1) % 4;
          const year = currentYear + Math.floor((currentQuarter + i - 1) / 4);
          const quarter = quarterMap[quarterIndex];

          const projection = await calculateQuarterlyTaxProjection(
            vendor.id,
            quarter,
            year
          );

          if (projection.status === 'upcoming' && projection.daysUntilDue <= 30 && projection.estimatedTax > 0) {
            upcomingCount++;
            logger.info(`Upcoming tax obligation for ${vendor.storeName}: ${quarter} ${year} - ${projection.daysUntilDue} days until due`);
          }
        }
      } catch (error) {
        logger.error(`Error checking upcoming obligations for vendor ${vendor.storeName}:`, error);
      }
    }

    logger.info(`Found ${upcomingCount} upcoming tax obligations in the next 30 days`);

  } catch (error) {
    logger.error('Error checking upcoming obligations:', error);
  }
}

/**
 * Initialize CRON jobs for tax reminders
 */
export function initializeTaxReminderCron(): void {
  logger.info('Initializing tax reminder CRON jobs...');

  // Run tax reminder check daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    logger.info('Running daily tax reminder check...');
    await checkAndSendTaxReminders();
  }, {
    scheduled: true,
    timezone: 'America/New_York'
  });

  // Run upcoming obligations check every Monday at 10:00 AM
  cron.schedule('0 10 * * 1', async () => {
    logger.info('Running weekly upcoming obligations check...');
    await checkUpcomingObligations();
  }, {
    scheduled: true,
    timezone: 'America/New_York'
  });

  // Run a quick check every hour during business hours (9 AM - 5 PM)
  cron.schedule('0 9-17 * * 1-5', async () => {
    logger.info('Running hourly tax obligation check...');
    await checkAndSendTaxReminders();
  }, {
    scheduled: true,
    timezone: 'America/New_York'
  });

  logger.info('Tax reminder CRON jobs initialized successfully');
}

/**
 * Manual trigger for tax reminder check (for testing)
 */
export async function manualTaxReminderCheck(): Promise<{ success: boolean; message: string }> {
  try {
    logger.info('Manual tax reminder check triggered');
    await checkAndSendTaxReminders();
    return {
      success: true,
      message: 'Tax reminder check completed successfully'
    };
  } catch (error) {
    logger.error('Manual tax reminder check failed:', error);
    return {
      success: false,
      message: 'Tax reminder check failed'
    };
  }
}

/**
 * Get CRON job status
 */
export function getCronStatus(): { initialized: boolean; schedules: string[] } {
  return {
    initialized: true,
    schedules: [
      'Daily tax reminder check: 0 9 * * * (9:00 AM)',
      'Weekly upcoming obligations check: 0 10 * * 1 (Monday 10:00 AM)',
      'Hourly business hours check: 0 9-17 * * 1-5 (9 AM - 5 PM, Mon-Fri)'
    ]
  };
} 