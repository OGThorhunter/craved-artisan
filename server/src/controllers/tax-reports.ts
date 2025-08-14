import prisma from '/prisma';
import PDFDocument from 'pdfkit';
import { format, startOfYear, endOfYear } from 'date-fns';

// 1099-K threshold for 2024 (may change annually)
const NINE_K_THRESHOLD = 5000; // $5,000 threshold for 2024

export interface TaxReportData {
  vendorId: string;
  year: number;
  totalGrossAmount: number;
  totalPlatformFees: number;
  totalNetAmount: number;
  transactionCount: number;
  requires1099K: boolean;
  payouts: any[];
  monthlyBreakdown: {
    month: number;
    grossAmount: number;
    platformFees: number;
    netAmount: number;
    transactionCount: number;
  }[];
}

export interface Form1099KData {
  vendorId: string;
  year: number;
  vendorInfo: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    taxId?: string; // EIN or SSN
  };
  platformInfo: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    taxId: string;
  };
  grossAmount: number;
  transactionCount: number;
  platformFees: number;
  netAmount: number;
}

export const generateTaxReport = async (req: any, res: any) => {
  try {
    const { vendorId, year = new Date().getFullYear() } = req.params;
    const format = req.query.format || 'json'; // 'json', 'pdf', 'csv'

    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'The specified vendor does not exist'
      });
    }

    // Check authorization (vendor can only access their own reports)
    if (req.session.userId !== vendor.userId && req.session.userRole !== 'ADMIN') {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only access your own tax reports'
      });
    }

    // Calculate date range for the year
    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 11, 31));

    // Fetch all payouts for the vendor in the specified year
    const payouts = await prisma.payout.findMany({
      where: {
        vendorId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Calculate totals
    const totalGrossAmount = payouts.reduce((sum, payout) => sum + payout.amount, 0);
    const totalPlatformFees = payouts.reduce((sum, payout) => sum + payout.platformFee, 0);
    const totalNetAmount = totalGrossAmount - totalPlatformFees;
    const transactionCount = payouts.length;
    const requires1099K = totalGrossAmount >= NINE_K_THRESHOLD;

    // Calculate monthly breakdown
    const monthlyBreakdown = Array.from({ length: 12 }, (_, monthIndex) => {
      const monthPayouts = payouts.filter(payout => 
        new Date(payout.date).getMonth() === monthIndex
      );
      
      const grossAmount = monthPayouts.reduce((sum, payout) => sum + payout.amount, 0);
      const platformFees = monthPayouts.reduce((sum, payout) => sum + payout.platformFee, 0);
      const netAmount = grossAmount - platformFees;
      
      return {
        month: monthIndex + 1,
        grossAmount,
        platformFees,
        netAmount,
        transactionCount: monthPayouts.length
      };
    });

    const taxReportData: TaxReportData = {
      vendorId,
      year,
      totalGrossAmount,
      totalPlatformFees,
      totalNetAmount,
      transactionCount,
      requires1099K,
      payouts,
      monthlyBreakdown
    };

    // Return based on requested format
    switch (format) {
      case 'pdf':
        return generateTaxReportPDF(res, taxReportData, vendor);
      case 'csv':
        return generateTaxReportCSV(res, taxReportData, vendor);
      default:
        return res.json({
          success: true,
          data: taxReportData,
          message: 'Tax report generated successfully'
        });
    }

  } catch (error) {
    console.error('Error generating tax report:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate tax report'
    });
  }
};

export const generateForm1099K = async (req: any, res: any) => {
  try {
    const { vendorId, year = new Date().getFullYear() } = req.params;
    const format = req.query.format || 'pdf'; // 'pdf', 'json'

    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'The specified vendor does not exist'
      });
    }

    // Check authorization
    if (req.session.userId !== vendor.userId && req.session.userRole !== 'ADMIN') {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only access your own 1099-K forms'
      });
    }

    // Calculate date range for the year
    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 11, 31));

    // Fetch payouts for the year
    const payouts = await prisma.payout.findMany({
      where: {
        vendorId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const grossAmount = payouts.reduce((sum, payout) => sum + payout.amount, 0);
    const platformFees = payouts.reduce((sum, payout) => sum + payout.platformFee, 0);
    const netAmount = grossAmount - platformFees;
    const transactionCount = payouts.length;

    // Check if 1099-K is required
    if (grossAmount < NINE_K_THRESHOLD) {
      return res.status(400).json({
        error: '1099-K not required',
        message: `Gross amount ($${grossAmount.toFixed(2)}) is below the $${NINE_K_THRESHOLD} threshold for 1099-K reporting`
      });
    }

    // Prepare vendor address (this would need to be stored in the database)
    const vendorAddress = vendor.user.profile ? {
      name: `${vendor.user.profile.firstName} ${vendor.user.profile.lastName}`,
      address: '123 Business St', // This should come from vendor profile
      city: 'Business City',
      state: 'ST',
      zipCode: '12345',
      taxId: '12-3456789' // EIN or SSN - should be stored securely
    } : {
      name: vendor.storeName,
      address: '123 Business St',
      city: 'Business City',
      state: 'ST',
      zipCode: '12345',
      taxId: '12-3456789'
    };

    const form1099KData: Form1099KData = {
      vendorId,
      year,
      vendorInfo: vendorAddress,
      platformInfo: {
        name: 'Craved Artisan LLC',
        address: '456 Platform Ave',
        city: 'Platform City',
        state: 'PC',
        zipCode: '67890',
        taxId: '98-7654321'
      },
      grossAmount,
      transactionCount,
      platformFees,
      netAmount
    };

    // Return based on requested format
    if (format === 'json') {
      return res.json({
        success: true,
        data: form1099KData,
        message: '1099-K form data generated successfully'
      });
    } else {
      return generateForm1099KPDF(res, form1099KData);
    }

  } catch (error) {
    console.error('Error generating 1099-K form:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate 1099-K form'
    });
  }
};

export const getTaxReportSummary = async (req: any, res: any) => {
  try {
    const { vendorId } = req.params;
    const currentYear = new Date().getFullYear();

    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'The specified vendor does not exist'
      });
    }

    // Check authorization
    if (req.session.userId !== vendor.userId && req.session.userRole !== 'ADMIN') {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only access your own tax summary'
      });
    }

    // Get current year totals
    const startDate = startOfYear(new Date());
    const endDate = endOfYear(new Date());

    const currentYearPayouts = await prisma.payout.findMany({
      where: {
        vendorId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const currentYearGross = currentYearPayouts.reduce((sum, payout) => sum + payout.amount, 0);
    const currentYearFees = currentYearPayouts.reduce((sum, payout) => sum + payout.platformFee, 0);
    const currentYearNet = currentYearGross - currentYearFees;

    // Get previous year totals for comparison
    const prevYearStart = startOfYear(new Date(currentYear - 1, 0, 1));
    const prevYearEnd = endOfYear(new Date(currentYear - 1, 11, 31));

    const prevYearPayouts = await prisma.payout.findMany({
      where: {
        vendorId,
        date: {
          gte: prevYearStart,
          lte: prevYearEnd
        }
      }
    });

    const prevYearGross = prevYearPayouts.reduce((sum, payout) => sum + payout.amount, 0);
    const prevYearFees = prevYearPayouts.reduce((sum, payout) => sum + payout.platformFee, 0);
    const prevYearNet = prevYearGross - prevYearFees;

    const summary = {
      currentYear: {
        year: currentYear,
        grossAmount: currentYearGross,
        platformFees: currentYearFees,
        netAmount: currentYearNet,
        transactionCount: currentYearPayouts.length,
        requires1099K: currentYearGross >= NINE_K_THRESHOLD,
        thresholdRemaining: Math.max(0, NINE_K_THRESHOLD - currentYearGross)
      },
      previousYear: {
        year: currentYear - 1,
        grossAmount: prevYearGross,
        platformFees: prevYearFees,
        netAmount: prevYearNet,
        transactionCount: prevYearPayouts.length,
        requires1099K: prevYearGross >= NINE_K_THRESHOLD
      },
      threshold: NINE_K_THRESHOLD
    };

    res.json({
      success: true,
      data: summary,
      message: 'Tax report summary generated successfully'
    });

  } catch (error) {
    console.error('Error generating tax report summary:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate tax report summary'
    });
  }
};

// Helper functions for PDF and CSV generation
function generateTaxReportPDF(res: any, data: TaxReportData, vendor: any) {
  const doc = new PDFDocument();
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="tax-report-${data.year}-${vendor.storeName}.pdf"`);
  
  doc.pipe(res);

  // Header
  doc.fontSize(20).text('Craved Artisan - Tax Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text(`${data.year} Tax Report for ${vendor.storeName}`, { align: 'center' });
  doc.moveDown(2);

  // Summary
  doc.fontSize(14).text('Annual Summary', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`Total Gross Amount: $${data.totalGrossAmount.toFixed(2)}`);
  doc.text(`Total Platform Fees: $${data.totalPlatformFees.toFixed(2)}`);
  doc.text(`Total Net Amount: $${data.totalNetAmount.toFixed(2)}`);
  doc.text(`Transaction Count: ${data.transactionCount}`);
  doc.text(`1099-K Required: ${data.requires1099K ? 'Yes' : 'No'}`);
  doc.moveDown(2);

  // Monthly breakdown
  doc.fontSize(14).text('Monthly Breakdown', { underline: true });
  doc.moveDown();
  
  data.monthlyBreakdown.forEach(month => {
    if (month.grossAmount > 0) {
      doc.fontSize(10).text(`${format(new Date(2024, month.month - 1, 1), 'MMMM')}: $${month.grossAmount.toFixed(2)} (${month.transactionCount} transactions)`);
    }
  });

  doc.end();
}

function generateTaxReportCSV(res: any, data: TaxReportData, vendor: any) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="tax-report-${data.year}-${vendor.storeName}.csv"`);

  let csv = 'Month,Gross Amount,Platform Fees,Net Amount,Transaction Count\n';
  
  data.monthlyBreakdown.forEach(month => {
    const monthName = format(new Date(2024, month.month - 1, 1), 'MMMM');
    csv += `${monthName},${month.grossAmount.toFixed(2)},${month.platformFees.toFixed(2)},${month.netAmount.toFixed(2)},${month.transactionCount}\n`;
  });

  csv += `\nAnnual Totals,${data.totalGrossAmount.toFixed(2)},${data.totalPlatformFees.toFixed(2)},${data.totalNetAmount.toFixed(2)},${data.transactionCount}\n`;
  csv += `1099-K Required,${data.requires1099K ? 'Yes' : 'No'},,,`;

  res.send(csv);
}

function generateForm1099KPDF(res: any, data: Form1099KData) {
  const doc = new PDFDocument({ size: 'LETTER' });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="form-1099k-${data.year}-${data.vendorInfo.name}.pdf"`);
  
  doc.pipe(res);

  // Form 1099-K header
  doc.fontSize(16).text('Form 1099-K', { align: 'center' });
  doc.fontSize(12).text(`Payment Card and Third Party Network Transactions - ${data.year}`, { align: 'center' });
  doc.moveDown(2);

  // Payer information
  doc.fontSize(12).text('Payer Information:', { underline: true });
  doc.fontSize(10).text(`Name: ${data.platformInfo.name}`);
  doc.text(`Address: ${data.platformInfo.address}`);
  doc.text(`City, State, ZIP: ${data.platformInfo.city}, ${data.platformInfo.state} ${data.platformInfo.zipCode}`);
  doc.text(`Tax ID: ${data.platformInfo.taxId}`);
  doc.moveDown();

  // Payee information
  doc.fontSize(12).text('Payee Information:', { underline: true });
  doc.fontSize(10).text(`Name: ${data.vendorInfo.name}`);
  doc.text(`Address: ${data.vendorInfo.address}`);
  doc.text(`City, State, ZIP: ${data.vendorInfo.city}, ${data.vendorInfo.state} ${data.vendorInfo.zipCode}`);
  if (data.vendorInfo.taxId) {
    doc.text(`Tax ID: ${data.vendorInfo.taxId}`);
  }
  doc.moveDown();

  // Transaction summary
  doc.fontSize(12).text('Transaction Summary:', { underline: true });
  doc.fontSize(10).text(`Gross Amount: $${data.grossAmount.toFixed(2)}`);
  doc.text(`Transaction Count: ${data.transactionCount}`);
  doc.text(`Platform Fees: $${data.platformFees.toFixed(2)}`);
  doc.text(`Net Amount: $${data.netAmount.toFixed(2)}`);

  doc.end();
} 