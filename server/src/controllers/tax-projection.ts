import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import {
  calculateQuarterlyTaxProjection,
  getAllQuarterlyProjections,
  getUpcomingTaxObligations,
  sendTaxReminder,
  getTaxSettings,
  initializeTaxSettings,
  getTaxAlerts,
  confirmTaxPayment,
  TaxProjection
} from '../utils/taxProjection';

/**
 * Get quarterly tax projection for a specific quarter
 */
export const getQuarterlyProjection = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const { quarter, year } = req.query;

    if (!quarter || !year) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'quarter and year are required'
      });
    }

    const projection = await calculateQuarterlyTaxProjection(
      vendorId,
      quarter as string,
      parseInt(year as string)
    );

    res.json({
      success: true,
      projection
    });
  } catch (error) {
    console.error('Error getting quarterly projection:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get quarterly projection'
    });
  }
};

/**
 * Get all quarterly projections for a vendor
 */
export const getAllProjections = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;

    const projections = await getAllQuarterlyProjections(vendorId);

    res.json({
      success: true,
      projections
    });
  } catch (error) {
    console.error('Error getting all projections:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get projections'
    });
  }
};

/**
 * Get upcoming tax obligations
 */
export const getUpcomingObligations = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;

    const obligations = await getUpcomingTaxObligations(vendorId);

    res.json({
      success: true,
      obligations
    });
  } catch (error) {
    console.error('Error getting upcoming obligations:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get upcoming obligations'
    });
  }
};

/**
 * Send tax reminder for a specific quarter
 */
export const sendTaxReminderController = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const { quarter, year } = req.body;

    if (!quarter || !year) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'quarter and year are required'
      });
    }

    // Calculate projection first
    const projection = await calculateQuarterlyTaxProjection(
      vendorId,
      quarter,
      year
    );

    // Send reminder
    const success = await sendTaxReminder(vendorId, projection);

    if (success) {
      res.json({
        success: true,
        message: 'Tax reminder sent successfully',
        projection
      });
    } else {
      res.status(500).json({
        error: 'Failed to send reminder',
        message: 'Could not send tax reminder'
      });
    }
  } catch (error) {
    console.error('Error sending tax reminder:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to send tax reminder'
    });
  }
};

/**
 * Get tax settings
 */
export const getTaxSettingsController = async (req: Request, res: Response) => {
  try {
    const settings = await getTaxSettings();

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error getting tax settings:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get tax settings'
    });
  }
};

/**
 * Update tax settings
 */
export const updateTaxSettings = async (req: Request, res: Response) => {
  try {
    const {
      selfEmploymentTaxRate,
      incomeTaxRate,
      quarterlyDueDates,
      reminderDays
    } = req.body;

    const updates = [];

    if (selfEmploymentTaxRate !== undefined) {
      updates.push(
        prisma.systemSettings.upsert({
          where: { key: 'SELF_EMPLOYMENT_TAX_RATE' },
          update: { value: selfEmploymentTaxRate.toString() },
          create: {
            key: 'SELF_EMPLOYMENT_TAX_RATE',
            value: selfEmploymentTaxRate.toString(),
            description: 'Self-employment tax rate percentage'
          }
        })
      );
    }

    if (incomeTaxRate !== undefined) {
      updates.push(
        prisma.systemSettings.upsert({
          where: { key: 'INCOME_TAX_RATE' },
          update: { value: incomeTaxRate.toString() },
          create: {
            key: 'INCOME_TAX_RATE',
            value: incomeTaxRate.toString(),
            description: 'Default income tax rate percentage'
          }
        })
      );
    }

    if (quarterlyDueDates) {
      const dueDates = ['Q1_DUE_DATE', 'Q2_DUE_DATE', 'Q3_DUE_DATE', 'Q4_DUE_DATE'];
      const dueDateValues = [quarterlyDueDates.Q1, quarterlyDueDates.Q2, quarterlyDueDates.Q3, quarterlyDueDates.Q4];
      
      dueDates.forEach((key, index) => {
        updates.push(
          prisma.systemSettings.upsert({
            where: { key },
            update: { value: JSON.stringify(dueDateValues[index]) },
            create: {
              key,
              value: JSON.stringify(dueDateValues[index]),
              description: `${key.replace('_', ' ').toLowerCase()} tax due date`
            }
          })
        );
      });
    }

    if (reminderDays !== undefined) {
      updates.push(
        prisma.systemSettings.upsert({
          where: { key: 'TAX_REMINDER_DAYS' },
          update: { value: JSON.stringify(reminderDays) },
          create: {
            key: 'TAX_REMINDER_DAYS',
            value: JSON.stringify(reminderDays),
            description: 'Days before due date to send reminders'
          }
        })
      );
    }

    await Promise.all(updates);

    const updatedSettings = await getTaxSettings();

    res.json({
      success: true,
      message: 'Tax settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating tax settings:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update tax settings'
    });
  }
};

/**
 * Initialize tax settings
 */
export const initializeTaxSettingsController = async (req: Request, res: Response) => {
  try {
    await initializeTaxSettings();

    res.json({
      success: true,
      message: 'Tax settings initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing tax settings:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to initialize tax settings'
    });
  }
};

/**
 * Get tax alerts for a vendor
 */
export const getTaxAlertsController = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;

    const alerts = await getTaxAlerts(vendorId);

    res.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Error getting tax alerts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get tax alerts'
    });
  }
};

/**
 * Confirm tax payment
 */
export const confirmTaxPaymentController = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const { quarter, year, paidAmount } = req.body;

    if (!quarter || !year || paidAmount === undefined) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'quarter, year, and paidAmount are required'
      });
    }

    await confirmTaxPayment(vendorId, quarter, year, paidAmount);

    res.json({
      success: true,
      message: 'Tax payment confirmed successfully'
    });
  } catch (error) {
    console.error('Error confirming tax payment:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to confirm tax payment'
    });
  }
};

/**
 * Get tax summary for dashboard
 */
export const getTaxSummary = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;

    // Get upcoming obligations
    const obligations = await getUpcomingTaxObligations(vendorId);
    
    // Get recent alerts
    const alerts = await getTaxAlerts(vendorId);
    
    // Calculate summary
    const totalUpcoming = obligations.reduce((sum, ob) => sum + ob.estimatedTax, 0);
    const overdueObligations = obligations.filter(ob => ob.status === 'overdue');
    const totalOverdue = overdueObligations.reduce((sum, ob) => sum + ob.estimatedTax, 0);
    
    // Get next due date
    const nextDue = obligations.find(ob => ob.status === 'upcoming');
    
    // Get current quarter projection
    const currentDate = new Date();
    const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;
    const currentYear = currentDate.getFullYear();
    const quarterMap = { 1: 'Q1', 2: 'Q2', 3: 'Q3', 4: 'Q4' };
    
    let currentQuarterProjection: TaxProjection | null = null;
    try {
      currentQuarterProjection = await calculateQuarterlyTaxProjection(
        vendorId,
        quarterMap[currentQuarter as keyof typeof quarterMap],
        currentYear
      );
    } catch (error) {
      console.error('Error calculating current quarter projection:', error);
    }

    res.json({
      success: true,
      summary: {
        totalUpcoming,
        totalOverdue,
        overdueCount: overdueObligations.length,
        upcomingCount: obligations.filter(ob => ob.status === 'upcoming').length,
        nextDueDate: nextDue?.dueDate,
        nextDueAmount: nextDue?.estimatedTax,
        currentQuarterProjection
      },
      obligations: obligations.slice(0, 4), // Show next 4
      recentAlerts: alerts.slice(0, 5) // Show last 5 alerts
    });
  } catch (error) {
    console.error('Error getting tax summary:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get tax summary'
    });
  }
};

/**
 * Bulk send tax reminders (for admin/scheduled job)
 */
export const bulkSendTaxReminders = async (req: Request, res: Response) => {
  try {
    const { daysBeforeDue } = req.body;

    // Get all vendors with upcoming obligations
    const vendors = await prisma.vendorProfile.findMany({
      include: {
        user: true
      }
    });

    const results = [];

    for (const vendor of vendors) {
      try {
        const obligations = await getUpcomingTaxObligations(vendor.id);
        
        for (const obligation of obligations) {
          if (obligation.daysUntilDue === daysBeforeDue && obligation.status === 'upcoming') {
            const success = await sendTaxReminder(vendor.id, obligation);
            results.push({
              vendorId: vendor.id,
              vendorEmail: vendor.user?.email,
              quarter: obligation.quarter,
              year: obligation.year,
              success,
              estimatedAmount: obligation.estimatedTax
            });
          }
        }
      } catch (error) {
        console.error(`Error processing vendor ${vendor.id}:`, error);
        results.push({
          vendorId: vendor.id,
          vendorEmail: vendor.user?.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      success: true,
      message: `Bulk reminder process completed. ${successCount} successful, ${failureCount} failed.`,
      results
    });
  } catch (error) {
    console.error('Error in bulk send tax reminders:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to send bulk reminders'
    });
  }
}; 