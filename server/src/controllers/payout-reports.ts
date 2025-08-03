import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import PDFDocument from 'pdfkit';
import { format } from 'date-fns';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

export const generatePayoutReport = async (req: any, res: any) => {
  try {
    const { vendorId } = req.params;
    const { startDate, endDate, format: reportFormat = 'csv' } = req.query;

    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { id: true, storeName: true, stripeAccountId: true }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    if (!vendor.stripeAccountId) {
      return res.status(400).json({
        error: 'Stripe account not connected',
        message: 'Vendor has not completed Stripe Connect onboarding'
      });
    }

    // Parse date range
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Fetch payouts from Stripe
    const payouts = await stripe.payouts.list({
      stripeAccount: vendor.stripeAccountId,
      limit: 100,
      created: {
        gte: Math.floor(start.getTime() / 1000),
        lte: Math.floor(end.getTime() / 1000)
      }
    });

    // Calculate summary statistics
    const summary = calculatePayoutSummary(payouts.data, start, end);

    // Generate report based on format
    if (reportFormat === 'pdf') {
      await generatePDFReport(res, vendor, payouts.data, summary, start, end);
    } else {
      generateCSVReport(res, vendor, payouts.data, summary, start, end);
    }

  } catch (error) {
    console.error('Error generating payout report:', error);
    res.status(500).json({
      error: 'Failed to generate payout report',
      message: 'Unable to generate report'
    });
  }
};

export const generateMonthlyPayoutReport = async (req: any, res: any) => {
  try {
    const { vendorId } = req.params;
    const { year, month, format: reportFormat = 'csv' } = req.query;

    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { id: true, storeName: true, stripeAccountId: true }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    if (!vendor.stripeAccountId) {
      return res.status(400).json({
        error: 'Stripe account not connected',
        message: 'Vendor has not completed Stripe Connect onboarding'
      });
    }

    // Calculate date range for the specified month
    const targetYear = parseInt(year as string) || new Date().getFullYear();
    const targetMonth = parseInt(month as string) || new Date().getMonth() + 1;
    
    const start = new Date(targetYear, targetMonth - 1, 1);
    const end = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // Fetch payouts for the month
    const payouts = await stripe.payouts.list({
      stripeAccount: vendor.stripeAccountId,
      limit: 100,
      created: {
        gte: Math.floor(start.getTime() / 1000),
        lte: Math.floor(end.getTime() / 1000)
      }
    });

    // Calculate monthly summary
    const summary = calculateMonthlyPayoutSummary(payouts.data, start, end);

    // Generate report based on format
    if (reportFormat === 'pdf') {
      await generateMonthlyPDFReport(res, vendor, payouts.data, summary, start, end);
    } else {
      generateMonthlyCSVReport(res, vendor, payouts.data, summary, start, end);
    }

  } catch (error) {
    console.error('Error generating monthly payout report:', error);
    res.status(500).json({
      error: 'Failed to generate monthly payout report',
      message: 'Unable to generate report'
    });
  }
};

// Helper functions
function calculatePayoutSummary(payouts: Stripe.Payout[], startDate: Date, endDate: Date) {
  const totalPayouts = payouts.length;
  const totalAmount = payouts.reduce((sum, payout) => sum + payout.amount, 0);
  const successfulPayouts = payouts.filter(p => p.status === 'paid').length;
  const pendingPayouts = payouts.filter(p => p.status === 'pending').length;
  const failedPayouts = payouts.filter(p => p.status === 'failed').length;

  const averagePayout = totalPayouts > 0 ? totalAmount / totalPayouts : 0;
  const successRate = totalPayouts > 0 ? (successfulPayouts / totalPayouts) * 100 : 0;

  return {
    period: {
      start: startDate,
      end: endDate
    },
    totalPayouts,
    totalAmount,
    successfulPayouts,
    pendingPayouts,
    failedPayouts,
    averagePayout,
    successRate
  };
}

function calculateMonthlyPayoutSummary(payouts: Stripe.Payout[], startDate: Date, endDate: Date) {
  const summary = calculatePayoutSummary(payouts, startDate, endDate);
  
  // Add monthly-specific metrics
  const dailyPayouts = payouts.reduce((acc, payout) => {
    const date = new Date(payout.created * 1000).toDateString();
    acc[date] = (acc[date] || 0) + payout.amount;
    return acc;
  }, {} as Record<string, number>);

  const highestDay = Object.entries(dailyPayouts).reduce((max, [date, amount]) => 
    amount > max.amount ? { date, amount } : max, { date: '', amount: 0 }
  );

  return {
    ...summary,
    dailyPayouts,
    highestDay,
    monthName: startDate.toLocaleString('default', { month: 'long' }),
    year: startDate.getFullYear()
  };
}

function generateCSVReport(res: any, vendor: any, payouts: Stripe.Payout[], summary: any, startDate: Date, endDate: Date) {
  const csvHeaders = [
    'Payout ID',
    'Date',
    'Amount',
    'Currency',
    'Status',
    'Type',
    'Method',
    'Arrival Date',
    'Description'
  ];

  const csvRows = payouts.map(payout => [
    payout.id,
    new Date(payout.created * 1000).toISOString().split('T')[0],
    (payout.amount / 100).toFixed(2),
    payout.currency.toUpperCase(),
    payout.status,
    payout.type,
    payout.method,
    payout.arrival_date ? new Date(payout.arrival_date * 1000).toISOString().split('T')[0] : '',
    payout.description || ''
  ]);

  const csvContent = [
    `Payout Report for ${vendor.storeName}`,
    `Period: ${startDate.toDateString()} to ${endDate.toDateString()}`,
    '',
    'Summary:',
    `Total Payouts: ${summary.totalPayouts}`,
    `Total Amount: $${(summary.totalAmount / 100).toFixed(2)}`,
    `Success Rate: ${summary.successRate.toFixed(1)}%`,
    `Average Payout: $${(summary.averagePayout / 100).toFixed(2)}`,
    '',
    csvHeaders.join(','),
    ...csvRows.map(row => row.join(','))
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="payout-report-${vendor.storeName}-${startDate.toISOString().split('T')[0]}.csv"`);
  res.send(csvContent);
}

async function generatePDFReport(res: any, vendor: any, payouts: Stripe.Payout[], summary: any, startDate: Date, endDate: Date) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="payout-report-${vendor.storeName}-${startDate.toISOString().split('T')[0]}.pdf"`);
  doc.pipe(res);

  // Header
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .text('Craved Artisan', { align: 'center' });
  
  doc.fontSize(16)
     .font('Helvetica')
     .text('Payout Report', { align: 'center' });
  
  doc.moveDown(0.5);

  // Vendor Information
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Vendor Information');
  
  doc.fontSize(12)
     .font('Helvetica')
     .text(`Store Name: ${vendor.storeName}`)
     .text(`Report Period: ${startDate.toDateString()} to ${endDate.toDateString()}`)
     .text(`Generated: ${new Date().toLocaleString()}`);
  
  doc.moveDown(0.5);

  // Summary
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Summary');
  
  doc.fontSize(12)
     .font('Helvetica')
     .text(`Total Payouts: ${summary.totalPayouts}`)
     .text(`Total Amount: $${(summary.totalAmount / 100).toFixed(2)}`)
     .text(`Successful Payouts: ${summary.successfulPayouts}`)
     .text(`Pending Payouts: ${summary.pendingPayouts}`)
     .text(`Failed Payouts: ${summary.failedPayouts}`)
     .text(`Success Rate: ${summary.successRate.toFixed(1)}%`)
     .text(`Average Payout: $${(summary.averagePayout / 100).toFixed(2)}`);
  
  doc.moveDown(0.5);

  // Payout Details
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Payout Details');
  
  doc.moveDown(0.25);

  payouts.forEach((payout, index) => {
    if (index > 0) doc.moveDown(0.25);
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text(`Payout ${index + 1}: ${payout.id}`);
    
    doc.fontSize(9)
       .font('Helvetica')
       .text(`Date: ${new Date(payout.created * 1000).toLocaleDateString()}`)
       .text(`Amount: $${(payout.amount / 100).toFixed(2)} ${payout.currency.toUpperCase()}`)
       .text(`Status: ${payout.status}`)
       .text(`Type: ${payout.type}`)
       .text(`Method: ${payout.method}`);
    
    if (payout.arrival_date) {
      doc.text(`Arrival Date: ${new Date(payout.arrival_date * 1000).toLocaleDateString()}`);
    }
    
    if (payout.description) {
      doc.text(`Description: ${payout.description}`);
    }
  });

  // Footer
  doc.moveDown(1);
  doc.fontSize(8)
     .font('Helvetica')
     .text('Thank you for using Craved Artisan!', { align: 'center' })
     .text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, { align: 'center' });

  doc.end();
}

function generateMonthlyCSVReport(res: any, vendor: any, payouts: Stripe.Payout[], summary: any, startDate: Date, endDate: Date) {
  const csvHeaders = [
    'Payout ID',
    'Date',
    'Amount',
    'Currency',
    'Status',
    'Type',
    'Method',
    'Arrival Date',
    'Description'
  ];

  const csvRows = payouts.map(payout => [
    payout.id,
    new Date(payout.created * 1000).toISOString().split('T')[0],
    (payout.amount / 100).toFixed(2),
    payout.currency.toUpperCase(),
    payout.status,
    payout.type,
    payout.method,
    payout.arrival_date ? new Date(payout.arrival_date * 1000).toISOString().split('T')[0] : '',
    payout.description || ''
  ]);

  const csvContent = [
    `Monthly Payout Report for ${vendor.storeName}`,
    `Month: ${summary.monthName} ${summary.year}`,
    `Period: ${startDate.toDateString()} to ${endDate.toDateString()}`,
    '',
    'Summary:',
    `Total Payouts: ${summary.totalPayouts}`,
    `Total Amount: $${(summary.totalAmount / 100).toFixed(2)}`,
    `Success Rate: ${summary.successRate.toFixed(1)}%`,
    `Average Payout: $${(summary.averagePayout / 100).toFixed(2)}`,
    `Highest Day: ${summary.highestDay.date} - $${(summary.highestDay.amount / 100).toFixed(2)}`,
    '',
    csvHeaders.join(','),
    ...csvRows.map(row => row.join(','))
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="monthly-payout-report-${vendor.storeName}-${summary.monthName}-${summary.year}.csv"`);
  res.send(csvContent);
}

async function generateMonthlyPDFReport(res: any, vendor: any, payouts: Stripe.Payout[], summary: any, startDate: Date, endDate: Date) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="monthly-payout-report-${vendor.storeName}-${summary.monthName}-${summary.year}.pdf"`);
  doc.pipe(res);

  // Header
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .text('Craved Artisan', { align: 'center' });
  
  doc.fontSize(16)
     .font('Helvetica')
     .text('Monthly Payout Report', { align: 'center' });
  
  doc.moveDown(0.5);

  // Vendor Information
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Vendor Information');
  
  doc.fontSize(12)
     .font('Helvetica')
     .text(`Store Name: ${vendor.storeName}`)
     .text(`Month: ${summary.monthName} ${summary.year}`)
     .text(`Report Period: ${startDate.toDateString()} to ${endDate.toDateString()}`)
     .text(`Generated: ${new Date().toLocaleString()}`);
  
  doc.moveDown(0.5);

  // Monthly Summary
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Monthly Summary');
  
  doc.fontSize(12)
     .font('Helvetica')
     .text(`Total Payouts: ${summary.totalPayouts}`)
     .text(`Total Amount: $${(summary.totalAmount / 100).toFixed(2)}`)
     .text(`Successful Payouts: ${summary.successfulPayouts}`)
     .text(`Pending Payouts: ${summary.pendingPayouts}`)
     .text(`Failed Payouts: ${summary.failedPayouts}`)
     .text(`Success Rate: ${summary.successRate.toFixed(1)}%`)
     .text(`Average Payout: $${(summary.averagePayout / 100).toFixed(2)}`)
     .text(`Highest Day: ${summary.highestDay.date} - $${(summary.highestDay.amount / 100).toFixed(2)}`);
  
  doc.moveDown(0.5);

  // Daily Breakdown
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Daily Breakdown');
  
  doc.moveDown(0.25);

  Object.entries(summary.dailyPayouts).forEach(([date, amount]) => {
    doc.fontSize(10)
       .font('Helvetica')
       .text(`${date}: $${(amount / 100).toFixed(2)}`);
  });

  doc.moveDown(0.5);

  // Payout Details
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Payout Details');
  
  doc.moveDown(0.25);

  payouts.forEach((payout, index) => {
    if (index > 0) doc.moveDown(0.25);
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text(`Payout ${index + 1}: ${payout.id}`);
    
    doc.fontSize(9)
       .font('Helvetica')
       .text(`Date: ${new Date(payout.created * 1000).toLocaleDateString()}`)
       .text(`Amount: $${(payout.amount / 100).toFixed(2)} ${payout.currency.toUpperCase()}`)
       .text(`Status: ${payout.status}`)
       .text(`Type: ${payout.type}`)
       .text(`Method: ${payout.method}`);
    
    if (payout.arrival_date) {
      doc.text(`Arrival Date: ${new Date(payout.arrival_date * 1000).toLocaleDateString()}`);
    }
    
    if (payout.description) {
      doc.text(`Description: ${payout.description}`);
    }
  });

  // Footer
  doc.moveDown(1);
  doc.fontSize(8)
     .font('Helvetica')
     .text('Thank you for using Craved Artisan!', { align: 'center' })
     .text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, { align: 'center' });

  doc.end();
} 