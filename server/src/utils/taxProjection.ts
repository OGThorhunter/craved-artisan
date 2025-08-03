import prisma from '../lib/prisma';

export interface TaxProjection {
  quarter: string;
  year: number;
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  totalCogs: number;
  totalExpenses: number;
  netIncome: number;
  estimatedTax: number;
  selfEmploymentTax: number;
  incomeTax: number;
  dueDate: Date;
  status: 'upcoming' | 'overdue' | 'paid' | 'estimated';
  daysUntilDue: number;
  alertLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface TaxAlert {
  id: string;
  vendorId: string;
  quarter: string;
  year: number;
  estimatedAmount: number;
  dueDate: Date;
  alertType: 'reminder' | 'overdue' | 'payment_confirmed';
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  createdAt: Date;
}

export interface TaxSettings {
  selfEmploymentTaxRate: number; // Default 15.3%
  incomeTaxRate: number; // Default varies by income
  quarterlyDueDates: {
    Q1: string; // "April 15"
    Q2: string; // "June 15"
    Q3: string; // "September 15"
    Q4: string; // "January 15"
  };
  reminderDays: number[]; // Days before due date to send reminders
}

/**
 * Calculate quarterly tax projection for a vendor
 */
export async function calculateQuarterlyTaxProjection(
  vendorId: string,
  quarter: string,
  year: number
): Promise<TaxProjection> {
  try {
    // Get quarter date range
    const { startDate, endDate } = getQuarterDateRange(quarter, year);
    
    // Get financial data for the quarter
    const financialData = await prisma.financialSnapshot.findMany({
      where: {
        vendorId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });

    // Calculate totals
    const totalRevenue = financialData.reduce((sum, record) => sum + record.revenue, 0);
    const totalCogs = financialData.reduce((sum, record) => sum + record.cogs, 0);
    const totalExpenses = financialData.reduce((sum, record) => sum + record.opex, 0);
    const netIncome = totalRevenue - totalCogs - totalExpenses;

    // Get tax settings
    const taxSettings = await getTaxSettings();
    
    // Calculate taxes
    const selfEmploymentTax = netIncome * (taxSettings.selfEmploymentTaxRate / 100);
    const incomeTax = calculateIncomeTax(netIncome);
    const estimatedTax = selfEmploymentTax + incomeTax;

    // Get due date
    const dueDate = getQuarterlyDueDate(quarter, year);
    const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    // Determine status and alert level
    const status = determineTaxStatus(dueDate, daysUntilDue);
    const alertLevel = determineAlertLevel(daysUntilDue, estimatedTax);

    return {
      quarter,
      year,
      startDate,
      endDate,
      totalRevenue,
      totalCogs,
      totalExpenses,
      netIncome,
      estimatedTax,
      selfEmploymentTax,
      incomeTax,
      dueDate,
      status,
      daysUntilDue,
      alertLevel
    };
  } catch (error) {
    console.error('Error calculating quarterly tax projection:', error);
    throw new Error('Failed to calculate tax projection');
  }
}

/**
 * Get all quarterly projections for a vendor
 */
export async function getAllQuarterlyProjections(vendorId: string): Promise<TaxProjection[]> {
  const currentYear = new Date().getFullYear();
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const projections: TaxProjection[] = [];

  // Get current and previous year projections
  for (const year of [currentYear - 1, currentYear]) {
    for (const quarter of quarters) {
      try {
        const projection = await calculateQuarterlyTaxProjection(vendorId, quarter, year);
        projections.push(projection);
      } catch (error) {
        console.error(`Error calculating projection for ${quarter} ${year}:`, error);
      }
    }
  }

  return projections.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return quarters.indexOf(b.quarter) - quarters.indexOf(a.quarter);
  });
}

/**
 * Get upcoming tax obligations
 */
export async function getUpcomingTaxObligations(vendorId: string): Promise<TaxProjection[]> {
  const projections = await getAllQuarterlyProjections(vendorId);
  const now = new Date();
  
  return projections.filter(projection => {
    // Include upcoming and overdue obligations
    return projection.dueDate >= now || projection.status === 'overdue';
  }).slice(0, 4); // Return next 4 obligations
}

/**
 * Create tax alert
 */
export async function createTaxAlert(
  vendorId: string,
  quarter: string,
  year: number,
  estimatedAmount: number,
  dueDate: Date,
  alertType: 'reminder' | 'overdue' | 'payment_confirmed'
): Promise<TaxAlert> {
  try {
    const alert = await prisma.taxAlert.create({
      data: {
        vendorId,
        quarter,
        year,
        estimatedAmount,
        dueDate,
        alertType,
        status: 'pending'
      }
    });

    return alert;
  } catch (error) {
    console.error('Error creating tax alert:', error);
    throw new Error('Failed to create tax alert');
  }
}

/**
 * Send tax reminder email
 */
export async function sendTaxReminder(vendorId: string, projection: TaxProjection): Promise<boolean> {
  try {
    // Get vendor information
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      include: { user: true }
    });

    if (!vendor || !vendor.user) {
      throw new Error('Vendor not found');
    }

    // Create alert record
    await createTaxAlert(
      vendorId,
      projection.quarter,
      projection.year,
      projection.estimatedTax,
      projection.dueDate,
      'reminder'
    );

    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    const emailContent = generateTaxReminderEmail(projection);
    
    // For now, log the email content
    console.log('Tax Reminder Email:', {
      to: vendor.user.email,
      subject: emailContent.subject,
      body: emailContent.body
    });

    // Update alert status
    await prisma.taxAlert.updateMany({
      where: {
        vendorId,
        quarter: projection.quarter,
        year: projection.year,
        alertType: 'reminder',
        status: 'pending'
      },
      data: {
        status: 'sent',
        sentAt: new Date()
      }
    });

    return true;
  } catch (error) {
    console.error('Error sending tax reminder:', error);
    
    // Update alert status to failed
    await prisma.taxAlert.updateMany({
      where: {
        vendorId,
        quarter: projection.quarter,
        year: projection.year,
        alertType: 'reminder',
        status: 'pending'
      },
      data: {
        status: 'failed'
      }
    });

    return false;
  }
}

/**
 * Get tax settings (with defaults)
 */
export async function getTaxSettings(): Promise<TaxSettings> {
  try {
    const settings = await prisma.systemSettings.findMany({
      where: {
        key: {
          in: [
            'SELF_EMPLOYMENT_TAX_RATE',
            'INCOME_TAX_RATE',
            'Q1_DUE_DATE',
            'Q2_DUE_DATE',
            'Q3_DUE_DATE',
            'Q4_DUE_DATE',
            'TAX_REMINDER_DAYS'
          ]
        },
        isActive: true
      }
    });

    const getSetting = (key: string, defaultValue: any) => {
      const setting = settings.find(s => s.key === key);
      return setting ? JSON.parse(setting.value) : defaultValue;
    };

    return {
      selfEmploymentTaxRate: getSetting('SELF_EMPLOYMENT_TAX_RATE', 15.3),
      incomeTaxRate: getSetting('INCOME_TAX_RATE', 22), // Default 22% bracket
      quarterlyDueDates: {
        Q1: getSetting('Q1_DUE_DATE', 'April 15'),
        Q2: getSetting('Q2_DUE_DATE', 'June 15'),
        Q3: getSetting('Q3_DUE_DATE', 'September 15'),
        Q4: getSetting('Q4_DUE_DATE', 'January 15')
      },
      reminderDays: getSetting('TAX_REMINDER_DAYS', [30, 14, 7, 1])
    };
  } catch (error) {
    console.error('Error getting tax settings:', error);
    // Return defaults
    return {
      selfEmploymentTaxRate: 15.3,
      incomeTaxRate: 22,
      quarterlyDueDates: {
        Q1: 'April 15',
        Q2: 'June 15',
        Q3: 'September 15',
        Q4: 'January 15'
      },
      reminderDays: [30, 14, 7, 1]
    };
  }
}

/**
 * Initialize tax settings
 */
export async function initializeTaxSettings(): Promise<void> {
  const defaultSettings = [
    {
      key: 'SELF_EMPLOYMENT_TAX_RATE',
      value: '15.3',
      description: 'Self-employment tax rate percentage'
    },
    {
      key: 'INCOME_TAX_RATE',
      value: '22',
      description: 'Default income tax rate percentage'
    },
    {
      key: 'Q1_DUE_DATE',
      value: '"April 15"',
      description: 'Q1 tax due date'
    },
    {
      key: 'Q2_DUE_DATE',
      value: '"June 15"',
      description: 'Q2 tax due date'
    },
    {
      key: 'Q3_DUE_DATE',
      value: '"September 15"',
      description: 'Q3 tax due date'
    },
    {
      key: 'Q4_DUE_DATE',
      value: '"January 15"',
      description: 'Q4 tax due date'
    },
    {
      key: 'TAX_REMINDER_DAYS',
      value: '[30, 14, 7, 1]',
      description: 'Days before due date to send reminders'
    }
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: {
        key: setting.key,
        value: setting.value,
        description: setting.description
      }
    });
  }
}

// Helper functions

function getQuarterDateRange(quarter: string, year: number): { startDate: Date; endDate: Date } {
  const quarterMap = {
    Q1: { startMonth: 0, endMonth: 2 }, // Jan-Mar
    Q2: { startMonth: 3, endMonth: 5 }, // Apr-Jun
    Q3: { startMonth: 6, endMonth: 8 }, // Jul-Sep
    Q4: { startMonth: 9, endMonth: 11 } // Oct-Dec
  };

  const { startMonth, endMonth } = quarterMap[quarter as keyof typeof quarterMap];
  
  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, endMonth + 1, 0); // Last day of the month

  return { startDate, endDate };
}

function getQuarterlyDueDate(quarter: string, year: number): Date {
  const dueDateMap = {
    Q1: 'April 15',
    Q2: 'June 15',
    Q3: 'September 15',
    Q4: 'January 15'
  };

  const dueDateStr = dueDateMap[quarter as keyof typeof dueDateMap];
  const [month, day] = dueDateStr.split(' ');
  
  // Q4 is due in January of the next year
  const dueYear = quarter === 'Q4' ? year + 1 : year;
  const monthIndex = new Date(`${month} 1, 2000`).getMonth();
  
  return new Date(dueYear, monthIndex, parseInt(day));
}

function calculateIncomeTax(netIncome: number): number {
  // Simplified tax calculation - in production, use proper tax brackets
  if (netIncome <= 0) return 0;
  
  // Basic progressive tax calculation
  let tax = 0;
  if (netIncome <= 10275) {
    tax = netIncome * 0.10;
  } else if (netIncome <= 41775) {
    tax = 1027.50 + (netIncome - 10275) * 0.12;
  } else if (netIncome <= 89075) {
    tax = 4807.50 + (netIncome - 41775) * 0.22;
  } else if (netIncome <= 170050) {
    tax = 15213.50 + (netIncome - 89075) * 0.24;
  } else if (netIncome <= 215950) {
    tax = 34647.50 + (netIncome - 170050) * 0.32;
  } else if (netIncome <= 539900) {
    tax = 49335.50 + (netIncome - 215950) * 0.35;
  } else {
    tax = 162718 + (netIncome - 539900) * 0.37;
  }
  
  return tax;
}

function determineTaxStatus(dueDate: Date, daysUntilDue: number): 'upcoming' | 'overdue' | 'paid' | 'estimated' {
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 30) return 'upcoming';
  return 'estimated';
}

function determineAlertLevel(daysUntilDue: number, estimatedTax: number): 'none' | 'low' | 'medium' | 'high' | 'critical' {
  if (daysUntilDue < 0) return 'critical';
  if (daysUntilDue <= 7) return 'high';
  if (daysUntilDue <= 14) return 'medium';
  if (daysUntilDue <= 30) return 'low';
  return 'none';
}

function generateTaxReminderEmail(projection: TaxProjection): { subject: string; body: string } {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const subject = `Quarterly Tax Reminder: ${projection.quarter} ${projection.year}`;
  
  const body = `
Dear Vendor,

This is a friendly reminder about your upcoming quarterly tax payment.

Quarter: ${projection.quarter} ${projection.year}
Due Date: ${formatDate(projection.dueDate)}
Days Until Due: ${projection.daysUntilDue}

Estimated Tax Payment: ${formatCurrency(projection.estimatedTax)}

Breakdown:
- Self-Employment Tax: ${formatCurrency(projection.selfEmploymentTax)}
- Income Tax: ${formatCurrency(projection.incomeTax)}

Quarterly Summary:
- Total Revenue: ${formatCurrency(projection.totalRevenue)}
- Total Expenses: ${formatCurrency(projection.totalExpenses)}
- Net Income: ${formatCurrency(projection.netIncome)}

Please ensure your payment is submitted by the due date to avoid penalties and interest.

Best regards,
Craved Artisan Team
  `.trim();

  return { subject, body };
}

/**
 * Get tax alerts for a vendor
 */
export async function getTaxAlerts(vendorId: string): Promise<TaxAlert[]> {
  return await prisma.taxAlert.findMany({
    where: { vendorId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
}

/**
 * Mark tax payment as confirmed
 */
export async function confirmTaxPayment(
  vendorId: string,
  quarter: string,
  year: number,
  paidAmount: number
): Promise<void> {
  // Create payment confirmation alert
  await createTaxAlert(
    vendorId,
    quarter,
    year,
    paidAmount,
    new Date(),
    'payment_confirmed'
  );

  // Update any pending alerts to sent
  await prisma.taxAlert.updateMany({
    where: {
      vendorId,
      quarter,
      year,
      status: 'pending'
    },
    data: {
      status: 'sent',
      sentAt: new Date()
    }
  });
} 