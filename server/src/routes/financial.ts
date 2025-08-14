import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import OpenAI from 'openai';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { Role } from '../lib/prisma';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Validation schemas
const createFinancialSnapshotSchema = z.object({
  revenue: z.number().positive(),
  cogs: z.number().min(0),
  opex: z.number().min(0),
  netProfit: z.number(),
  assets: z.number().min(0),
  liabilities: z.number().min(0),
  equity: z.number(),
  cashIn: z.number().min(0),
  cashOut: z.number().min(0),
  notes: z.string().optional(),
});

const updateFinancialSnapshotSchema = createFinancialSnapshotSchema.partial();

// GET /api/vendors/:id/financials - Get financial snapshots for a specific vendor with range filtering
router.get('/:id/financials', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { range = 'monthly', year, quarter } = req.query;
    
    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      select: { id: true, storeName: true }
    });

    if (!vendor) {
      return res.status(400).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    let startDate: Date;
    let endDate: Date;
    const now = new Date();

    // Handle year and quarter filtering
    if (year) {
      const yearNum = parseInt(year as string);
      startDate = new Date(yearNum, 0, 1); // January 1st of the year
      endDate = new Date(yearNum + 1, 0, 1); // January 1st of next year

      // If quarter is specified, filter to that specific quarter
      if (quarter) {
        const quarterMap: { [key: string]: [number, number] } = {
          'Q1': [0, 3],
          'Q2': [3, 6],
          'Q3': [6, 9],
          'Q4': [9, 12],
        };

        const quarterRange = quarterMap[quarter as string];
        if (quarterRange) {
          startDate = new Date(yearNum, quarterRange[0], 1);
          endDate = new Date(yearNum, quarterRange[1], 1);
        }
      }
    } else {
      // Fall back to range-based filtering
      switch (range) {
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case 'quarterly':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 1);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear() + 1, 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      }
    }

    const snapshots = await prisma.financialSnapshot.findMany({
      where: {
        vendorId: id,
        date: {
          gte: startDate,
          lt: endDate
        }
      },
      orderBy: { date: 'desc' },
      take: 100
    });

    // Calculate summary metrics for the range
    const totalRevenue = snapshots.reduce((sum, s) => sum + s.revenue, 0);
    const totalProfit = snapshots.reduce((sum, s) => sum + s.netProfit, 0);
    const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const totalCashFlow = snapshots.reduce((sum, s) => sum + s.cashIn - s.cashOut, 0);
    
    // Get latest snapshot for current net worth
    const latestSnapshot = snapshots[0];
    const currentNetWorth = latestSnapshot?.equity || 0;

    return res.json({
      vendor: {
        id: vendor.id,
        storeName: vendor.storeName
      },
      range,
      year: year ? parseInt(year as string) : now.getFullYear(),
      quarter: quarter || null,
      period: {
        start: startDate,
        end: endDate
      },
      summary: {
        totalRevenue,
        totalProfit,
        avgProfitMargin: Math.round(avgProfitMargin * 100) / 100,
        totalCashFlow,
        currentNetWorth,
        snapshotCount: snapshots.length
      },
      snapshots
    });
  } catch (error) {
    console.error('Error fetching vendor financials:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch vendor financials'
    });
  }
});

// GET /api/vendors/:id/financials/export.csv - Export financial data as CSV
router.get('/:id/financials/export.csv', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      select: { id: true, storeName: true }
    });

    if (!vendor) {
      return res.status(400).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    const entries = await prisma.financialSnapshot.findMany({
      where: { vendorId: id },
      orderBy: { date: 'desc' },
    });

    if (entries.length === 0) {
      return res.status(400).json({
        error: 'No financial data found',
        message: 'No financial snapshots available for export'
      });
    }

    const parser = new Parser();
    const csv = parser.parse(entries);

    res.header('Content-Type', 'text/csv');
    res.attachment(`financials-${vendor.storeName}-${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csv);
  } catch (error) {
    console.error('Error exporting financial data:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to export financial data'
    });
  }
});

// GET /api/vendors/:id/financials/export.pdf - Export financial data as PDF with charts
router.get('/:id/financials/export.pdf', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      select: { id: true, storeName: true }
    });

    if (!vendor) {
      return res.status(400).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    const entries = await prisma.financialSnapshot.findMany({
      where: { vendorId: id },
      orderBy: { date: 'asc' }, // Sort by date ascending for charts
    });

    if (entries.length === 0) {
      return res.status(400).json({
        error: 'No financial data found',
        message: 'No financial snapshots available for export'
      });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 40 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="financials-${vendor.storeName}-${new Date().toISOString().split('T')[0]}.pdf"`);
    
    // Pipe the PDF to the response
    doc.pipe(res);

    // Create chart canvas
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 800, height: 400 });

    // Add title page
    doc.fontSize(28).text('Financial Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(20).text(vendor.storeName, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(3);

    // Add summary section
    const totalRevenue = entries.reduce((sum, e) => sum + e.revenue, 0);
    const totalProfit = entries.reduce((sum, e) => sum + e.netProfit, 0);
    const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const latestSnapshot = entries[entries.length - 1];

    doc.fontSize(18).text('Executive Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total Revenue: $${totalRevenue.toLocaleString()}`);
    doc.fontSize(12).text(`Total Net Profit: $${totalProfit.toLocaleString()}`);
    doc.fontSize(12).text(`Average Profit Margin: ${avgProfitMargin.toFixed(1)}%`);
    doc.fontSize(12).text(`Current Net Worth: $${latestSnapshot.equity.toLocaleString()}`);
    doc.fontSize(12).text(`Reporting Period: ${entries.length} snapshots`);
    doc.moveDown(2);

    // Generate Revenue Chart
    const revenueChartConfig = {
      type: 'line' as const,
      data: {
        labels: entries.map(e => new Date(e.date).toLocaleDateString()),
        datasets: [{
          label: 'Revenue',
          data: entries.map(e => e.revenue),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Revenue Trend Over Time'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return '$' + value.toLocaleString();
              }
            }
          }
        }
      }
    };

    const revenueChartBuffer = await chartJSNodeCanvas.renderToBuffer(revenueChartConfig);
    doc.addPage();
    doc.fontSize(18).text('Revenue Analysis', { underline: true });
    doc.moveDown(0.5);
    doc.image(revenueChartBuffer, { fit: [500, 250] });
    doc.moveDown(1);

    // Generate Profit vs COGS Chart
    const profitCogsChartConfig = {
      type: 'bar' as const,
      data: {
        labels: entries.map(e => new Date(e.date).toLocaleDateString()),
        datasets: [
          {
            label: 'Net Profit',
            data: entries.map(e => e.netProfit),
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
          },
          {
            label: 'COGS',
            data: entries.map(e => e.cogs),
            backgroundColor: 'rgba(255, 99, 132, 0.8)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Net Profit vs Cost of Goods Sold'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return '$' + value.toLocaleString();
              }
            }
          }
        }
      }
    };

    const profitCogsChartBuffer = await chartJSNodeCanvas.renderToBuffer(profitCogsChartConfig);
    doc.fontSize(18).text('Profitability Analysis', { underline: true });
    doc.moveDown(0.5);
    doc.image(profitCogsChartBuffer, { fit: [500, 250] });

    // Generate Cash Flow Chart
    const cashFlowChartConfig = {
      type: 'line' as const,
      data: {
        labels: entries.map(e => new Date(e.date).toLocaleDateString()),
        datasets: [
          {
            label: 'Cash In',
            data: entries.map(e => e.cashIn),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1
          },
          {
            label: 'Cash Out',
            data: entries.map(e => e.cashOut),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Cash Flow Analysis'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return '$' + value.toLocaleString();
              }
            }
          }
        }
      }
    };

    const cashFlowChartBuffer = await chartJSNodeCanvas.renderToBuffer(cashFlowChartConfig);
    doc.addPage();
    doc.fontSize(18).text('Cash Flow Analysis', { underline: true });
    doc.moveDown(0.5);
    doc.image(cashFlowChartBuffer, { fit: [500, 250] });

    // Generate Balance Sheet Chart
    const balanceSheetChartConfig = {
      type: 'doughnut' as const,
      data: {
        labels: ['Assets', 'Liabilities', 'Equity'],
        datasets: [{
          data: [
            latestSnapshot.assets,
            latestSnapshot.liabilities,
            latestSnapshot.equity
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)'
          ],
          borderColor: [
            'rgb(75, 192, 192)',
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Current Balance Sheet Composition'
          },
          legend: {
            position: 'bottom' as const
          }
        }
      }
    };

    const balanceSheetChartBuffer = await chartJSNodeCanvas.renderToBuffer(balanceSheetChartConfig);
    doc.fontSize(18).text('Balance Sheet Overview', { underline: true });
    doc.moveDown(0.5);
    doc.image(balanceSheetChartBuffer, { fit: [400, 300] });

    // Add detailed financial snapshots table
    doc.addPage();
    doc.fontSize(18).text('Detailed Financial Snapshots', { underline: true });
    doc.moveDown(0.5);

    // Table headers
    const tableTop = doc.y;
    const tableLeft = 50;
    const colWidth = 90;
    const rowHeight = 18;

    // Draw table headers
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Date', tableLeft, tableTop);
    doc.text('Revenue', tableLeft + colWidth, tableTop);
    doc.text('COGS', tableLeft + colWidth * 2, tableTop);
    doc.text('OPEX', tableLeft + colWidth * 3, tableTop);
    doc.text('Net Profit', tableLeft + colWidth * 4, tableTop);
    doc.text('Equity', tableLeft + colWidth * 5, tableTop);

    // Draw header line
    doc.moveTo(tableLeft, tableTop + 15).lineTo(tableLeft + colWidth * 6, tableTop + 15).stroke();

    // Add table rows
    doc.fontSize(8).font('Helvetica');
    entries.forEach((entry, index) => {
      const y = tableTop + rowHeight + (index * rowHeight);
      
      // Check if we need a new page
      if (y > doc.page.height - 100) {
        doc.addPage();
        doc.fontSize(16).text('Financial Snapshots (Continued)', { underline: true });
        doc.moveDown(0.5);
        // Reset table position for new page
        const newTableTop = doc.y;
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('Date', tableLeft, newTableTop);
        doc.text('Revenue', tableLeft + colWidth, newTableTop);
        doc.text('COGS', tableLeft + colWidth * 2, newTableTop);
        doc.text('OPEX', tableLeft + colWidth * 3, newTableTop);
        doc.text('Net Profit', tableLeft + colWidth * 4, newTableTop);
        doc.text('Equity', tableLeft + colWidth * 5, newTableTop);
        doc.moveTo(tableLeft, newTableTop + 15).lineTo(tableLeft + colWidth * 6, newTableTop + 15).stroke();
        doc.fontSize(8).font('Helvetica');
        const adjustedY = newTableTop + rowHeight;
        doc.text(new Date(entry.date).toLocaleDateString(), tableLeft, adjustedY);
        doc.text(`$${entry.revenue.toLocaleString()}`, tableLeft + colWidth, adjustedY);
        doc.text(`$${entry.cogs.toLocaleString()}`, tableLeft + colWidth * 2, adjustedY);
        doc.text(`$${entry.opex.toLocaleString()}`, tableLeft + colWidth * 3, adjustedY);
        doc.text(`$${entry.netProfit.toLocaleString()}`, tableLeft + colWidth * 4, adjustedY);
        doc.text(`$${entry.equity.toLocaleString()}`, tableLeft + colWidth * 5, adjustedY);
      } else {
        doc.text(new Date(entry.date).toLocaleDateString(), tableLeft, y);
        doc.text(`$${entry.revenue.toLocaleString()}`, tableLeft + colWidth, y);
        doc.text(`$${entry.cogs.toLocaleString()}`, tableLeft + colWidth * 2, y);
        doc.text(`$${entry.opex.toLocaleString()}`, tableLeft + colWidth * 3, y);
        doc.text(`$${entry.netProfit.toLocaleString()}`, tableLeft + colWidth * 4, y);
        doc.text(`$${entry.equity.toLocaleString()}`, tableLeft + colWidth * 5, y);
      }
    });

    // Add footer
    doc.addPage();
    doc.fontSize(12).text('Report Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`• Total snapshots analyzed: ${entries.length}`);
    doc.fontSize(10).text(`• Date range: ${new Date(entries[0].date).toLocaleDateString()} to ${new Date(entries[entries.length - 1].date).toLocaleDateString()}`);
    doc.fontSize(10).text(`• Average monthly revenue: $${(totalRevenue / entries.length).toLocaleString()}`);
    doc.fontSize(10).text(`• Average monthly profit: $${(totalProfit / entries.length).toLocaleString()}`);
    doc.moveDown(2);
    doc.fontSize(10).text(`Report generated for ${vendor.storeName} on ${new Date().toLocaleString()}`, { align: 'center' });

    // End the PDF
    doc.end();
  } catch (error) {
    console.error('Error exporting financial data as PDF:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to export financial data as PDF'
    });
  }
});

// POST /api/vendors/:id/financials/generate - Generate financial snapshot automatically
router.post('/:id/financials/generate', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = 'monthly', notes } = req.body;

    // Verify vendor exists
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      select: { id: true, storeName: true }
    });

    if (!vendor) {
      return res.status(400).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    // Calculate period dates
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    
    switch (period) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Get orders for the period to calculate revenue
    const orders = await prisma.order.findMany({
      where: {
        vendorId: id,
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        items: true
      }
    });

    // Calculate revenue from orders
    const revenue = orders.reduce((sum, order) => sum + Number(order.total), 0);

    // Get products to calculate COGS
    const products = await prisma.product.findMany({
      where: { vendorProfileId: id },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                ingredient: true
              }
            }
          }
        }
      }
    });

    // Calculate COGS based on recipe costs
    let cogs = 0;
    orders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product?.recipe) {
          const recipeCost = product.recipe.ingredients.reduce((sum, ri) => {
            return sum + (Number(ri.ingredient.cost) * ri.quantity);
          }, 0);
          cogs += recipeCost * item.quantity;
        }
      });
    });

    // Estimate operating expenses (mock calculation - in real app would come from expense tracking)
    const opex = revenue * 0.15; // Assume 15% of revenue as operating expenses

    // Calculate net profit
    const netProfit = revenue - cogs - opex;

    // Get latest snapshot for baseline assets/liabilities
    const latestSnapshot = await prisma.financialSnapshot.findFirst({
      where: { vendorId: id },
      orderBy: { date: 'desc' }
    });

    // Calculate new assets and liabilities
    const previousAssets = latestSnapshot?.assets || 0;
    const previousLiabilities = latestSnapshot?.liabilities || 0;
    
    // Assets grow with profit, liabilities stay relatively stable
    const assets = previousAssets + netProfit;
    const liabilities = previousLiabilities; // Assume no change in liabilities
    const equity = assets - liabilities;

    // Calculate cash flow
    const cashIn = revenue;
    const cashOut = cogs + opex;

    // Create the financial snapshot
    const snapshot = await prisma.financialSnapshot.create({
      data: {
        vendorId: id,
        date: now,
        revenue,
        cogs,
        opex,
        netProfit,
        assets,
        liabilities,
        equity,
        cashIn,
        cashOut,
        notes: notes || `Auto-generated ${period} financial snapshot`
      }
    });

    return res.status(400).json({
      message: 'Financial snapshot generated successfully',
      snapshot,
      period: {
        start: startDate,
        end: endDate,
        type: period
      },
      calculations: {
        revenue,
        cogs,
        opex,
        netProfit,
        profitMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Error generating financial snapshot:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to generate financial snapshot'
    });
  }
});

// GET /api/financial/snapshots - Get all financial snapshots for a vendor
router.get('/snapshots', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), async (req, res) => {
  try {
    const vendorId = req.session.userId;
    
    const snapshots = await prisma.financialSnapshot.findMany({
      where: { vendorId },
      orderBy: { date: 'desc' },
      take: 100, // Limit to last 100 snapshots
    });

    return res.json({ snapshots });
  } catch (error) {
    console.error('Error fetching financial snapshots:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch financial snapshots'
    });
  }
});

// GET /api/financial/snapshots/:id - Get a specific financial snapshot
router.get('/snapshots/:id', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.session.userId;

    const snapshot = await prisma.financialSnapshot.findFirst({
      where: { 
        id,
        vendorId 
      }
    });

    if (!snapshot) {
      return res.status(400).json({
        error: 'Financial snapshot not found',
        message: 'Snapshot does not exist or you do not have access'
      });
    }

    return res.json({ snapshot });
  } catch (error) {
    console.error('Error fetching financial snapshot:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch financial snapshot'
    });
  }
});

// POST /api/financial/snapshots - Create a new financial snapshot
router.post('/snapshots', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), async (req, res) => {
  try {
    const vendorId = req.session.userId;
    const validatedData = createFinancialSnapshotSchema.parse(req.body);

    const snapshot = await prisma.financialSnapshot.create({
      data: {
        ...validatedData,
        vendorId,
      }
    });

    return res.status(400).json({ snapshot });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid data provided',
        details: error.errors
      });
    }

    console.error('Error creating financial snapshot:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to create financial snapshot'
    });
  }
});

// PUT /api/financial/snapshots/:id - Update a financial snapshot
router.put('/snapshots/:id', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.session.userId;
    const validatedData = updateFinancialSnapshotSchema.parse(req.body);

    // Check if snapshot exists and belongs to vendor
    const existingSnapshot = await prisma.financialSnapshot.findFirst({
      where: { 
        id,
        vendorId 
      }
    });

    if (!existingSnapshot) {
      return res.status(400).json({
        error: 'Financial snapshot not found',
        message: 'Snapshot does not exist or you do not have access'
      });
    }

    const snapshot = await prisma.financialSnapshot.update({
      where: { id },
      data: validatedData
    });

    return res.json({ snapshot });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid data provided',
        details: error.errors
      });
    }

    console.error('Error updating financial snapshot:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to update financial snapshot'
    });
  }
});

// DELETE /api/financial/snapshots/:id - Delete a financial snapshot
router.delete('/snapshots/:id', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.session.userId;

    // Check if snapshot exists and belongs to vendor
    const existingSnapshot = await prisma.financialSnapshot.findFirst({
      where: { 
        id,
        vendorId 
      }
    });

    if (!existingSnapshot) {
      return res.status(400).json({
        error: 'Financial snapshot not found',
        message: 'Snapshot does not exist or you do not have access'
      });
    }

    await prisma.financialSnapshot.delete({
      where: { id }
    });

    return res.json({ message: 'Financial snapshot deleted successfully' });
  } catch (error) {
    console.error('Error deleting financial snapshot:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to delete financial snapshot'
    });
  }
});

// GET /api/financial/analytics - Get financial analytics and trends
router.get('/analytics', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), async (req, res) => {
  try {
    const vendorId = req.session.userId;
    const { period = '30' } = req.query; // Default to 30 days

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period as string));

    const snapshots = await prisma.financialSnapshot.findMany({
      where: {
        vendorId,
        date: {
          gte: daysAgo
        }
      },
      orderBy: { date: 'asc' }
    });

    if (snapshots.length === 0) {
      return res.json({
        analytics: {
          totalRevenue: 0,
          totalProfit: 0,
          avgProfitMargin: 0,
          cashFlow: 0,
          netWorth: 0,
          trends: []
        }
      });
    }

    // Calculate analytics
    const totalRevenue = snapshots.reduce((sum, s) => sum + s.revenue, 0);
    const totalProfit = snapshots.reduce((sum, s) => sum + s.netProfit, 0);
    const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const cashFlow = snapshots.reduce((sum, s) => sum + s.cashIn - s.cashOut, 0);
    
    // Get latest snapshot for net worth
    const latestSnapshot = snapshots[snapshots.length - 1];
    const netWorth = latestSnapshot.equity;

    // Calculate trends (month-over-month or week-over-week)
    const trends = snapshots.map((snapshot, index) => ({
      date: snapshot.date,
      revenue: snapshot.revenue,
      profit: snapshot.netProfit,
      profitMargin: snapshot.revenue > 0 ? (snapshot.netProfit / snapshot.revenue) * 100 : 0,
      cashFlow: snapshot.cashIn - snapshot.cashOut
    }));

    return res.json({
      analytics: {
        totalRevenue,
        totalProfit,
        avgProfitMargin: Math.round(avgProfitMargin * 100) / 100,
        cashFlow,
        netWorth,
        trends,
        snapshotCount: snapshots.length
      }
    });
  } catch (error) {
    console.error('Error fetching financial analytics:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch financial analytics'
    });
  }
});

// POST /api/vendors/:id/financials/import - Upload and import CSV/Excel financial data with AI header mapping
router.post('/:id/financials/import', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), isVendorOwnerOrAdmin, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      select: { id: true, storeName: true }
    });

    if (!vendor) {
      return res.status(400).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a CSV or Excel file'
      });
    }

    // Convert file buffer to string
    const csvText = req.file.buffer.toString();

    // Parse CSV and structure into array
    const records = parse(csvText, { columns: true });

    if (records.length === 0) {
      return res.status(400).json({
        error: 'Empty file',
        message: 'The uploaded file contains no data'
      });
    }

    // 🔍 Ask OpenAI to map headers to financial fields
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const systemPrompt = `Map CSV headers to known financial fields. Return a JSON object with the mapping. Available fields: revenue, cogs, opex, netProfit, cashIn, cashOut, assets, liabilities, equity, notes, date. Example: {"revenue": "Revenue", "cogs": "Cost of Goods Sold", "date": "Date"}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user',
          content: `Headers: ${Object.keys(records[0]).join(', ')}`
        },
      ],
    });

    const mappedFields = JSON.parse(completion.choices[0].message.content || '{}');

    // Insert parsed & mapped financial data
    const importedSnapshots = [];
    for (const row of records) {
      try {
        const snapshot = await prisma.financialSnapshot.create({
          data: {
            vendorId: id,
            date: new Date(row[mappedFields.date] || new Date()),
            revenue: parseFloat(row[mappedFields.revenue]) || 0,
            cogs: parseFloat(row[mappedFields.cogs]) || 0,
            opex: parseFloat(row[mappedFields.opex]) || 0,
            netProfit: parseFloat(row[mappedFields.netProfit]) || 0,
            cashIn: parseFloat(row[mappedFields.cashIn]) || 0,
            cashOut: parseFloat(row[mappedFields.cashOut]) || 0,
            assets: parseFloat(row[mappedFields.assets]) || 0,
            liabilities: parseFloat(row[mappedFields.liabilities]) || 0,
            equity: parseFloat(row[mappedFields.equity]) || 0,
            notes: row[mappedFields.notes] || '',
          },
        });
        importedSnapshots.push(snapshot);
      } catch (error) {
        console.error('Error importing row:', row, error);
        // Continue with other rows even if one fails
      }
    }

    return res.json({ 
      message: '✅ Financial data imported successfully',
      importedCount: importedSnapshots.length,
      totalRows: records.length,
      mapping: mappedFields
    });
  } catch (error) {
    console.error('Error importing financial data:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to import financial data'
    });
  }
});

// GET /api/vendors/:id/financials/insights - Get financial insights and analytics
router.get('/:id/financials/insights', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { year, quarter } = req.query;

    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      select: { id: true, storeName: true }
    });

    if (!vendor) {
      return res.status(400).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    // Build date filter
    let startDate: Date;
    let endDate: Date;
    const now = new Date();

    if (year) {
      const yearNum = parseInt(year as string);
      startDate = new Date(yearNum, 0, 1);
      endDate = new Date(yearNum + 1, 0, 1);

      if (quarter) {
        const quarterMap: { [key: string]: [number, number] } = {
          'Q1': [0, 3],
          'Q2': [3, 6],
          'Q3': [6, 9],
          'Q4': [9, 12],
        };

        const quarterRange = quarterMap[quarter as string];
        if (quarterRange) {
          startDate = new Date(yearNum, quarterRange[0], 1);
          endDate = new Date(yearNum, quarterRange[1], 1);
        }
      }
    } else {
      // Default to last 12 months
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // Get financial snapshots for the period
    const snapshots = await prisma.financialSnapshot.findMany({
      where: {
        vendorId: id,
        date: {
          gte: startDate,
          lt: endDate
        }
      },
      orderBy: { date: 'asc' }
    });

    if (snapshots.length === 0) {
      return res.json({
        topGains: [],
        costTrend: { trend: 'stable', percentage: 0, direction: 'neutral' },
        burnRate: { monthly: 0, runway: 0, status: 'healthy' },
        period: { start: startDate, end: endDate },
        summary: 'No financial data available for the specified period'
      });
    }

    // Calculate top gains (highest net profit periods)
    const topGains = snapshots
      .map(snapshot => ({
        date: snapshot.date,
        netProfit: snapshot.netProfit,
        revenue: snapshot.revenue,
        margin: snapshot.revenue > 0 ? (snapshot.netProfit / snapshot.revenue) * 100 : 0
      }))
      .sort((a, b) => b.netProfit - a.netProfit)
      .slice(0, 5);

    // Calculate cost trend
    const totalCogs = snapshots.reduce((sum, s) => sum + s.cogs, 0);
    const totalOpex = snapshots.reduce((sum, s) => sum + s.opex, 0);
    const totalRevenue = snapshots.reduce((sum, s) => sum + s.revenue, 0);
    
    const avgCostRatio = totalRevenue > 0 ? ((totalCogs + totalOpex) / totalRevenue) * 100 : 0;
    
    // Determine cost trend direction by comparing first and last periods
    const firstHalf = snapshots.slice(0, Math.ceil(snapshots.length / 2));
    const secondHalf = snapshots.slice(Math.ceil(snapshots.length / 2));
    
    const firstHalfCostRatio = firstHalf.length > 0 && firstHalf.reduce((sum, s) => sum + s.revenue, 0) > 0 
      ? (firstHalf.reduce((sum, s) => sum + s.cogs + s.opex, 0) / firstHalf.reduce((sum, s) => sum + s.revenue, 0)) * 100 
      : 0;
    
    const secondHalfCostRatio = secondHalf.length > 0 && secondHalf.reduce((sum, s) => sum + s.revenue, 0) > 0 
      ? (secondHalf.reduce((sum, s) => sum + s.cogs + s.opex, 0) / secondHalf.reduce((sum, s) => sum + s.revenue, 0)) * 100 
      : 0;

    const costTrendPercentage = secondHalfCostRatio - firstHalfCostRatio;
    let costTrendDirection: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let costTrendTrend: 'improving' | 'worsening' | 'stable' = 'stable';

    if (Math.abs(costTrendPercentage) > 2) { // 2% threshold
      costTrendDirection = costTrendPercentage > 0 ? 'increasing' : 'decreasing';
      costTrendTrend = costTrendPercentage > 0 ? 'worsening' : 'improving';
    }

    // Calculate burn rate
    const avgMonthlyCashOut = snapshots.reduce((sum, s) => sum + s.cashOut, 0) / snapshots.length;
    const avgMonthlyCashIn = snapshots.reduce((sum, s) => sum + s.cashIn, 0) / snapshots.length;
    const netCashFlow = avgMonthlyCashIn - avgMonthlyCashOut;
    
    // Get current cash balance (latest snapshot)
    const latestSnapshot = snapshots[snapshots.length - 1];
    const currentCashBalance = latestSnapshot.assets - latestSnapshot.liabilities;
    
    const runway = netCashFlow < 0 ? Math.abs(currentCashBalance / Math.abs(netCashFlow)) : Infinity;
    
    let burnRateStatus: 'healthy' | 'caution' | 'critical' = 'healthy';
    if (netCashFlow < 0) {
      if (runway < 3) {
        burnRateStatus = 'critical';
      } else if (runway < 6) {
        burnRateStatus = 'caution';
      }
    }

    return res.json({
      topGains,
      costTrend: {
        trend: costTrendTrend,
        percentage: Math.abs(costTrendPercentage),
        direction: costTrendDirection,
        avgCostRatio: Math.round(avgCostRatio * 100) / 100
      },
      burnRate: {
        monthly: Math.round(netCashFlow * 100) / 100,
        runway: Math.round(runway * 100) / 100,
        status: burnRateStatus,
        currentBalance: Math.round(currentCashBalance * 100) / 100
      },
      period: {
        start: startDate,
        end: endDate,
        snapshotsCount: snapshots.length
      },
      summary: `Analyzed ${snapshots.length} financial snapshots from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
    });

  } catch (error) {
    console.error('Error generating financial insights:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to generate financial insights'
    });
  }
});

// GET /api/vendors/:vendorId/financials/summary - Get financial summary data for charts
router.get('/:vendorId/financials/summary', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { id: true, storeName: true }
    });

    if (!vendor) {
      return res.status(400).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    const data = await prisma.financialSnapshot.findMany({
      where: { vendorId },
      orderBy: { date: "asc" }
    });

    const revenueVsProfit = data.map(d => ({
      date: d.date,
      revenue: d.revenue,
      profit: d.netProfit,
    }));

    const cogsTrend = data.map(d => ({
      date: d.date,
      cogs: d.cogs,
    }));

    return res.json({ revenueVsProfit, cogsTrend });
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch financial summary'
    });
  }
});

// PATCH endpoint for inline editing of financial snapshots
router.patch('/:id/financials/:snapshotId', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { id, snapshotId } = req.params;
    const updateData = req.body;

    // Verify the snapshot belongs to the vendor
    const existingSnapshot = await prisma.financialSnapshot.findFirst({
      where: {
        id: snapshotId,
        vendorId: id
      }
    });

    if (!existingSnapshot) {
      return res.status(400).json({ error: 'Financial snapshot not found' });
    }

    // Update the financial snapshot
    const updatedSnapshot = await prisma.financialSnapshot.update({
      where: { id: snapshotId },
      data: updateData
    });

    return res.json(updatedSnapshot);
  } catch (error) {
    console.error('Error updating financial snapshot:', error);
    return res.status(400).json({ error: 'Failed to update financial snapshot' });
  }
});

export default router; 
