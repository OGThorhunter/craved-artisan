import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin';
import prisma from '../lib/prisma';
import PDFDocument from 'pdfkit';
import { format } from 'date-fns';
const router = express.Router();

// GET /api/vendor/profile
router.get('/profile', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });
    
    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'No vendor profile exists for this user'
      });
    }
    
    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch vendor profile'
    });
  }
});

// PUT /api/vendor/profile
router.put('/profile', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { storeName, bio, imageUrl } = req.body;
    
    if (!storeName) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Store name is required'
      });
    }
    
    // Generate slug from store name
    const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    const vendor = await prisma.vendorProfile.upsert({
      where: { userId: req.session.userId },
      update: { 
        storeName, 
        bio, 
        imageUrl,
        slug: slug // Update slug in case store name changed
      },
      create: {
        userId: req.session.userId,
        storeName,
        slug,
        bio,
        imageUrl,
      },
    });
    
    res.json(vendor);
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A vendor profile with this store name already exists'
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update vendor profile'
    });
  }
});

// GET /api/vendors/:id/delivery-metrics - Get delivery analytics for vendor
router.get('/:id/delivery-metrics', requireAuth, requireRole(['VENDOR', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    // Verify vendor exists and user has access
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    // Get all orders for this vendor with delivery data
    const orders = await prisma.order.findMany({
      where: { vendorId: id },
      select: {
        id: true,
        shippingZip: true,
        deliveryStatus: true,
        deliveryTimestamp: true,
        createdAt: true,
        deliveryDay: true
      }
    });

    // Calculate delivery metrics
    const deliveredOrders = orders.filter(order => order.deliveryStatus === 'delivered');
    const totalDelivered = deliveredOrders.length;
    const totalOrders = orders.length;

    // Calculate on-time rate (mock logic - in real app would compare with promised delivery time)
    const onTimeDeliveries = deliveredOrders.filter(order => {
      // Mock logic: consider on-time if delivered within 2 days of order
      const orderDate = new Date(order.createdAt);
      const deliveryDate = order.deliveryTimestamp ? new Date(order.deliveryTimestamp) : null;
      if (!deliveryDate) return false;
      
      const daysDiff = (deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 2;
    }).length;

    const onTimeRate = totalDelivered > 0 ? onTimeDeliveries / totalDelivered : 0;

    // Calculate average delivery time
    const deliveryTimes = deliveredOrders
      .filter(order => order.deliveryTimestamp)
      .map(order => {
        const orderDate = new Date(order.createdAt);
        const deliveryDate = new Date(order.deliveryTimestamp!);
        return (deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60); // hours
      });

    const avgTimeToDeliver = deliveryTimes.length > 0 
      ? (deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length).toFixed(1)
      : "0.0";

    // Calculate ZIP code statistics
    const zipStats = orders.reduce((acc, order) => {
      const zip = order.shippingZip;
      if (!acc[zip]) {
        acc[zip] = { zip, delivered: 0, delayed: 0 };
      }
      
      if (order.deliveryStatus === 'delivered') {
        // Check if delivery was on time (same mock logic as above)
        const orderDate = new Date(order.createdAt);
        const deliveryDate = order.deliveryTimestamp ? new Date(order.deliveryTimestamp) : null;
        if (deliveryDate) {
          const daysDiff = (deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysDiff <= 2) {
            acc[zip].delivered++;
          } else {
            acc[zip].delayed++;
          }
        }
      }
      
      return acc;
    }, {} as Record<string, { zip: string; delivered: number; delayed: number }>);

    const zipStatsArray = Object.values(zipStats);

    res.json({
      zipStats: zipStatsArray,
      onTimeRate: Math.round(onTimeRate * 100) / 100, // Round to 2 decimal places
      avgTimeToDeliver: `${avgTimeToDeliver}h`,
      totalOrders,
      totalDelivered,
      onTimeDeliveries,
      delayedDeliveries: totalDelivered - onTimeDeliveries
    });
  } catch (error) {
    console.error('Error fetching delivery metrics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch delivery metrics'
    });
  }
});

// GET /api/vendors/:vendorId/financials/tax-report
router.get('/:vendorId/financials/tax-report', requireAuth, isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { vendorId } = req.params;

    const payouts = await prisma.payout.findMany({
      where: { vendorId },
      orderBy: { date: 'asc' }
    });

    const totalPaid = payouts.reduce((sum, p) => sum + p.amount, 0);
    const totalFees = payouts.reduce((sum, p) => sum + p.platformFee, 0);

    res.json({
      vendorId,
      totalPaid,
      totalFees,
      totalNet: totalPaid - totalFees,
      payouts
    });
  } catch (error) {
    console.error('Error fetching tax report:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch tax report'
    });
  }
});

// GET /api/vendors/:vendorId/financials/1099-pdf
router.get('/:vendorId/financials/1099-pdf', requireAuth, isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { year = new Date().getFullYear() } = req.query;

    // Get vendor information
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        storeName: true,
        userId: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    // Get payouts for the specified year
    const startDate = new Date(parseInt(year as string), 0, 1);
    const endDate = new Date(parseInt(year as string), 11, 31, 23, 59, 59);

    const payouts = await prisma.payout.findMany({
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
    const totalPaid = payouts.reduce((sum, p) => sum + p.amount, 0);
    const totalFees = payouts.reduce((sum, p) => sum + p.platformFee, 0);
    const totalNet = totalPaid - totalFees;

    // Check if 1099-K is required (threshold for 2024 is $5,000)
    const NINE_K_THRESHOLD = 5000;
    const requires1099K = totalNet >= NINE_K_THRESHOLD;

    // Generate PDF
    const pdfBuffer = await generate1099PdfForVendor(vendor, payouts, totalPaid, totalFees, totalNet, parseInt(year as string), requires1099K);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="1099-${year}-${vendor.storeName}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating 1099 PDF:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate 1099 PDF'
    });
  }
});

// Helper function to generate 1099 PDF
async function generate1099PdfForVendor(
  vendor: any,
  payouts: any[],
  totalPaid: number,
  totalFees: number,
  totalNet: number,
  year: number,
  requires1099K: boolean
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('Craved Artisan - 1099-K Tax Report', { align: 'center' })
         .moveDown(0.5);

      doc.fontSize(14)
         .font('Helvetica')
         .text(`Tax Year: ${year}`, { align: 'center' })
         .moveDown(1);

      // Vendor Information
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Vendor Information')
         .moveDown(0.5);

      doc.fontSize(12)
         .font('Helvetica')
         .text(`Business Name: ${vendor.storeName}`)
         .text(`Vendor ID: ${vendor.id}`)
         .text(`Email: ${vendor.user.email}`)
         .text(`Contact: ${vendor.user.firstName} ${vendor.user.lastName}`)
         .moveDown(1);

      // Summary Section
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Financial Summary')
         .moveDown(0.5);

      doc.fontSize(12)
         .font('Helvetica')
         .text(`Total Gross Payments: $${totalPaid.toFixed(2)}`)
         .text(`Total Platform Fees: $${totalFees.toFixed(2)}`)
         .text(`Net Amount: $${totalNet.toFixed(2)}`)
         .moveDown(0.5);

      // 1099-K Requirement
      if (requires1099K) {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('red')
           .text(`⚠️  1099-K REQUIRED: Net amount exceeds $${NINE_K_THRESHOLD.toLocaleString()} threshold`)
           .moveDown(0.5);
      } else {
        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('green')
           .text(`✓ 1099-K not required: Net amount below $${NINE_K_THRESHOLD.toLocaleString()} threshold`)
           .moveDown(0.5);
      }

      doc.fillColor('black'); // Reset color
      doc.moveDown(1);

      // Payout Details
      if (payouts.length > 0) {
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('Payout Details')
           .moveDown(0.5);

        // Table header
        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 150;
        const col3 = 250;
        const col4 = 350;
        const col5 = 450;

        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('Date', col1, tableTop)
           .text('Amount', col2, tableTop)
           .text('Platform Fee', col3, tableTop)
           .text('Net', col4, tableTop)
           .text('Method', col5, tableTop);

        doc.moveTo(col1, tableTop + 15)
           .lineTo(col5 + 80, tableTop + 15)
           .stroke();

        // Table rows
        let currentY = tableTop + 25;
        doc.fontSize(9)
           .font('Helvetica');

        payouts.forEach((payout, index) => {
          if (currentY > 650) { // Check if we need a new page
            doc.addPage();
            currentY = 50;
          }

          doc.text(format(new Date(payout.date), 'MM/dd/yyyy'), col1, currentY)
             .text(`$${payout.amount.toFixed(2)}`, col2, currentY)
             .text(`$${payout.platformFee.toFixed(2)}`, col3, currentY)
             .text(`$${(payout.amount - payout.platformFee).toFixed(2)}`, col4, currentY)
             .text(payout.method, col5, currentY);

          currentY += 15;
        });

        doc.moveDown(2);
      }

      // Footer
      doc.fontSize(10)
         .font('Helvetica')
         .text('This report is generated for tax purposes. Please consult with a tax professional for filing requirements.', { align: 'center' })
         .moveDown(0.5)
         .text(`Generated on: ${format(new Date(), 'MM/dd/yyyy HH:mm:ss')}`, { align: 'center' })
         .moveDown(0.5)
         .text('Craved Artisan Platform', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// GET /api/vendors/:vendorId/financials/forecast
router.get('/:vendorId/financials/forecast', requireAuth, isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { months = 12 } = req.query; // Optional: number of months to analyze

    // Get vendor information for validation
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { id: true, storeName: true }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    // Get financial snapshots for trend analysis
    const data = await prisma.financialSnapshot.findMany({
      where: { vendorId },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        date: true,
        revenue: true,
        profit: true,
        orderCount: true,
        averageOrderValue: true
      }
    });

    if (data.length < 2) {
      return res.json({
        vendorId,
        forecast: {
          nextMonthRevenue: 0,
          nextMonthProfit: 0,
          nextMonthOrders: 0,
          avgGrowthRate: 0,
          confidence: 'low',
          message: 'Insufficient data for forecasting (need at least 2 data points)',
          trends: {
            revenue: 'insufficient_data',
            profit: 'insufficient_data',
            orders: 'insufficient_data'
          }
        },
        historicalData: data
      });
    }

    // Get the last N months of data
    const monthsToAnalyze = Math.min(parseInt(months as string), data.length);
    const lastN = data.slice(-monthsToAnalyze);

    // Calculate growth rates for different metrics
    const revenueGrowthRates = calculateGrowthRates(lastN.map(d => d.revenue));
    const profitGrowthRates = calculateGrowthRates(lastN.map(d => d.profit));
    const orderGrowthRates = calculateGrowthRates(lastN.map(d => d.orderCount));

    // Calculate average growth rates
    const avgRevenueGrowth = calculateAverageGrowth(revenueGrowthRates);
    const avgProfitGrowth = calculateAverageGrowth(profitGrowthRates);
    const avgOrderGrowth = calculateAverageGrowth(orderGrowthRates);

    // Get latest values
    const latest = lastN[lastN.length - 1];

    // Calculate forecasts
    const nextMonthRevenue = latest.revenue * (1 + avgRevenueGrowth);
    const nextMonthProfit = latest.profit * (1 + avgProfitGrowth);
    const nextMonthOrders = Math.round(latest.orderCount * (1 + avgOrderGrowth));

    // Calculate confidence based on data consistency
    const confidence = calculateConfidence(revenueGrowthRates, profitGrowthRates, orderGrowthRates);

    // Determine trends
    const trends = {
      revenue: determineTrend(revenueGrowthRates),
      profit: determineTrend(profitGrowthRates),
      orders: determineTrend(orderGrowthRates)
    };

    // Generate insights
    const insights = generateInsights(trends, avgRevenueGrowth, avgProfitGrowth, avgOrderGrowth);

    res.json({
      vendorId,
      vendorName: vendor.storeName,
      forecast: {
        nextMonthRevenue: Math.round(nextMonthRevenue * 100) / 100,
        nextMonthProfit: Math.round(nextMonthProfit * 100) / 100,
        nextMonthOrders: nextMonthOrders,
        avgRevenueGrowthRate: Math.round(avgRevenueGrowth * 10000) / 100, // Percentage
        avgProfitGrowthRate: Math.round(avgProfitGrowth * 10000) / 100,
        avgOrderGrowthRate: Math.round(avgOrderGrowth * 10000) / 100,
        confidence,
        trends,
        insights
      },
      historicalData: lastN.map(entry => ({
        date: entry.date,
        revenue: entry.revenue,
        profit: entry.profit,
        orderCount: entry.orderCount,
        averageOrderValue: entry.averageOrderValue
      }))
    });
  } catch (error) {
    console.error('Error generating financial forecast:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate financial forecast'
    });
  }
});

// Helper function to calculate growth rates
function calculateGrowthRates(values: number[]): number[] {
  const growthRates: number[] = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] !== 0) {
      growthRates.push((values[i] - values[i - 1]) / values[i - 1]);
    } else {
      growthRates.push(0);
    }
  }
  return growthRates;
}

// Helper function to calculate average growth rate
function calculateAverageGrowth(growthRates: number[]): number {
  if (growthRates.length === 0) return 0;
  const validRates = growthRates.filter(rate => !isNaN(rate) && isFinite(rate));
  if (validRates.length === 0) return 0;
  return validRates.reduce((sum, rate) => sum + rate, 0) / validRates.length;
}

// Helper function to calculate confidence level
function calculateConfidence(revenueRates: number[], profitRates: number[], orderRates: number[]): 'high' | 'medium' | 'low' {
  const allRates = [...revenueRates, ...profitRates, ...orderRates];
  const validRates = allRates.filter(rate => !isNaN(rate) && isFinite(rate));
  
  if (validRates.length < 6) return 'low';
  
  // Calculate coefficient of variation (standard deviation / mean)
  const mean = validRates.reduce((sum, rate) => sum + rate, 0) / validRates.length;
  const variance = validRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / validRates.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = Math.abs(stdDev / mean);
  
  if (coefficientOfVariation < 0.3) return 'high';
  if (coefficientOfVariation < 0.6) return 'medium';
  return 'low';
}

// Helper function to determine trend
function determineTrend(growthRates: number[]): 'increasing' | 'decreasing' | 'stable' | 'insufficient_data' {
  if (growthRates.length < 2) return 'insufficient_data';
  
  const avgGrowth = calculateAverageGrowth(growthRates);
  const threshold = 0.05; // 5% threshold
  
  if (avgGrowth > threshold) return 'increasing';
  if (avgGrowth < -threshold) return 'decreasing';
  return 'stable';
}

// Helper function to generate insights
function generateInsights(
  trends: any,
  revenueGrowth: number,
  profitGrowth: number,
  orderGrowth: number
): string[] {
  const insights: string[] = [];
  
  // Revenue insights
  if (trends.revenue === 'increasing') {
    insights.push(`Revenue is trending upward with ${(revenueGrowth * 100).toFixed(1)}% average monthly growth`);
  } else if (trends.revenue === 'decreasing') {
    insights.push(`Revenue is declining with ${(revenueGrowth * 100).toFixed(1)}% average monthly decrease`);
  }
  
  // Profit insights
  if (trends.profit === 'increasing' && trends.revenue === 'increasing') {
    insights.push('Both revenue and profit are growing, indicating healthy business expansion');
  } else if (trends.profit === 'decreasing' && trends.revenue === 'increasing') {
    insights.push('Revenue is growing but profit is declining - consider cost optimization');
  }
  
  // Order insights
  if (trends.orders === 'increasing') {
    insights.push(`Order volume is increasing with ${(orderGrowth * 100).toFixed(1)}% average monthly growth`);
  }
  
  // Cross-metric insights
  if (revenueGrowth > orderGrowth && orderGrowth > 0) {
    insights.push('Average order value is increasing - customers are spending more per order');
  } else if (orderGrowth > revenueGrowth && revenueGrowth > 0) {
    insights.push('Order volume is growing faster than revenue - consider average order value optimization');
  }
  
  // Seasonal patterns (basic detection)
  if (insights.length === 0) {
    insights.push('Business metrics are stable with minimal growth or decline');
  }
  
  return insights;
}

export default router; 