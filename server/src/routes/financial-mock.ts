import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth-mock';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin-mock';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Mock data
let mockSnapshots = [
  // 2025 Data
  {
    id: 'snapshot-1',
    vendorId: 'vendor-1',
    date: new Date('2025-08-01'),
    revenue: 12500.00,
    cogs: 7500.00,
    opex: 2000.00,
    netProfit: 3000.00,
    assets: 25000.00,
    liabilities: 8000.00,
    equity: 17000.00,
    cashIn: 13000.00,
    cashOut: 10000.00,
    notes: 'Strong month with new product launch'
  },
  {
    id: 'snapshot-2',
    vendorId: 'vendor-1',
    date: new Date('2025-07-01'),
    revenue: 9800.00,
    cogs: 6000.00,
    opex: 1800.00,
    netProfit: 2000.00,
    assets: 22000.00,
    liabilities: 7500.00,
    equity: 14500.00,
    cashIn: 10500.00,
    cashOut: 8500.00,
    notes: 'Steady growth month'
  },
  {
    id: 'snapshot-3',
    vendorId: 'vendor-1',
    date: new Date('2025-06-01'),
    revenue: 8200.00,
    cogs: 5200.00,
    opex: 1600.00,
    netProfit: 1400.00,
    assets: 20000.00,
    liabilities: 7000.00,
    equity: 13000.00,
    cashIn: 9000.00,
    cashOut: 7500.00,
    notes: 'Recovery from slow period'
  },
  {
    id: 'snapshot-4',
    vendorId: 'vendor-1',
    date: new Date('2025-05-01'),
    revenue: 7500.00,
    cogs: 4800.00,
    opex: 1500.00,
    netProfit: 1200.00,
    assets: 18500.00,
    liabilities: 6800.00,
    equity: 11700.00,
    cashIn: 8000.00,
    cashOut: 7000.00,
    notes: 'Spring season boost'
  },
  {
    id: 'snapshot-5',
    vendorId: 'vendor-1',
    date: new Date('2025-04-01'),
    revenue: 6800.00,
    cogs: 4200.00,
    opex: 1400.00,
    netProfit: 1200.00,
    assets: 17000.00,
    liabilities: 6500.00,
    equity: 10500.00,
    cashIn: 7200.00,
    cashOut: 6500.00,
    notes: 'Easter holiday sales'
  },
  {
    id: 'snapshot-6',
    vendorId: 'vendor-1',
    date: new Date('2025-03-01'),
    revenue: 6200.00,
    cogs: 3800.00,
    opex: 1300.00,
    netProfit: 1100.00,
    assets: 15500.00,
    liabilities: 6200.00,
    equity: 9300.00,
    cashIn: 6500.00,
    cashOut: 6000.00,
    notes: 'March Madness catering'
  },
  {
    id: 'snapshot-7',
    vendorId: 'vendor-1',
    date: new Date('2025-02-01'),
    revenue: 5800.00,
    cogs: 3500.00,
    opex: 1200.00,
    netProfit: 1100.00,
    assets: 14000.00,
    liabilities: 5900.00,
    equity: 8100.00,
    cashIn: 6000.00,
    cashOut: 5500.00,
    notes: 'Valentine\'s Day specials'
  },
  {
    id: 'snapshot-8',
    vendorId: 'vendor-1',
    date: new Date('2025-01-01'),
    revenue: 5200.00,
    cogs: 3200.00,
    opex: 1100.00,
    netProfit: 900.00,
    assets: 12500.00,
    liabilities: 5600.00,
    equity: 6900.00,
    cashIn: 5500.00,
    cashOut: 5000.00,
    notes: 'New Year resolution boost'
  },
  // 2024 Data
  {
    id: 'snapshot-9',
    vendorId: 'vendor-1',
    date: new Date('2024-12-01'),
    revenue: 15000.00,
    cogs: 9000.00,
    opex: 2500.00,
    netProfit: 3500.00,
    assets: 12000.00,
    liabilities: 5300.00,
    equity: 6700.00,
    cashIn: 15500.00,
    cashOut: 12000.00,
    notes: 'Holiday season peak'
  },
  {
    id: 'snapshot-10',
    vendorId: 'vendor-1',
    date: new Date('2024-11-01'),
    revenue: 11000.00,
    cogs: 6600.00,
    opex: 2000.00,
    netProfit: 2400.00,
    assets: 10000.00,
    liabilities: 5000.00,
    equity: 5000.00,
    cashIn: 11500.00,
    cashOut: 9500.00,
    notes: 'Thanksgiving preparation'
  },
  {
    id: 'snapshot-11',
    vendorId: 'vendor-1',
    date: new Date('2024-10-01'),
    revenue: 9500.00,
    cogs: 5700.00,
    opex: 1800.00,
    netProfit: 2000.00,
    assets: 8500.00,
    liabilities: 4700.00,
    equity: 3800.00,
    cashIn: 10000.00,
    cashOut: 8500.00,
    notes: 'Fall festival season'
  },
  {
    id: 'snapshot-12',
    vendorId: 'vendor-1',
    date: new Date('2024-09-01'),
    revenue: 8800.00,
    cogs: 5300.00,
    opex: 1700.00,
    netProfit: 1800.00,
    assets: 7000.00,
    liabilities: 4400.00,
    equity: 2600.00,
    cashIn: 9200.00,
    cashOut: 8000.00,
    notes: 'Back to school rush'
  }
];

// Mock vendor data
const mockVendors = [
  {
    id: 'vendor-1',
    storeName: 'Rose Creek Artisan Foods'
  },
  {
    id: 'vendor-2',
    storeName: 'Artisan Bakery Co.'
  }
];

// Mock orders data for generation
const mockOrders = [
  {
    id: 'order-1',
    vendorId: 'vendor-1',
    total: 150.00,
    status: 'COMPLETED',
    createdAt: new Date('2025-08-15'),
    items: [
      { productId: 'product-1', quantity: 2, price: 75.00 }
    ]
  },
  {
    id: 'order-2',
    vendorId: 'vendor-1',
    total: 200.00,
    status: 'COMPLETED',
    createdAt: new Date('2025-08-20'),
    items: [
      { productId: 'product-2', quantity: 1, price: 200.00 }
    ]
  }
];

// Mock products data for COGS calculation
const mockProducts = [
  {
    id: 'product-1',
    vendorProfileId: 'vendor-1',
    recipe: {
      ingredients: [
        { ingredient: { cost: 25.00 }, quantity: 2 },
        { ingredient: { cost: 10.00 }, quantity: 1 }
      ]
    }
  },
  {
    id: 'product-2',
    vendorProfileId: 'vendor-1',
    recipe: {
      ingredients: [
        { ingredient: { cost: 80.00 }, quantity: 1 },
        { ingredient: { cost: 20.00 }, quantity: 2 }
      ]
    }
  }
];

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

// GET /api/vendors/:id/financials/test - Get financial snapshots for a specific vendor with range filtering
router.get('/:id/financials/test', requireAuth, requireRole(['VENDOR', 'ADMIN']), isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { range = 'monthly', year, quarter } = req.query;
    
    // Verify vendor exists
    const vendor = mockVendors.find(v => v.id === id);
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

    const snapshots = mockSnapshots
      .filter(s => {
        const snapshotDate = new Date(s.date);
        return s.vendorId === id && snapshotDate >= startDate && snapshotDate < endDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

// GET /api/vendors/:id/financials/export.csv/test - Export financial data as CSV
router.get('/:id/financials/export.csv/test', requireAuth, requireRole(['VENDOR', 'ADMIN']), isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify vendor exists
    const vendor = mockVendors.find(v => v.id === id);
    if (!vendor) {
      return res.status(400).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    const entries = mockSnapshots
      .filter(s => s.vendorId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

// GET /api/vendors/:id/financials/export.pdf/test - Export financial data as PDF with charts
router.get('/:id/financials/export.pdf/test', requireAuth, requireRole(['VENDOR', 'ADMIN']), isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify vendor exists
    const vendor = mockVendors.find(v => v.id === id);
    if (!vendor) {
      return res.status(400).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    const entries = mockSnapshots
      .filter(s => s.vendorId === id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort ascending for charts

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

// POST /api/vendors/:id/financials/generate/test - Generate financial snapshot automatically
router.post('/:id/financials/generate/test', requireAuth, requireRole(['VENDOR', 'ADMIN']), isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = 'monthly', notes } = req.body;

    // Verify vendor exists
    const vendor = mockVendors.find(v => v.id === id);
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
    const orders = mockOrders.filter(order => 
      order.vendorId === id && 
      new Date(order.createdAt) >= startDate && 
      new Date(order.createdAt) <= endDate &&
      order.status === 'COMPLETED'
    );

    // Calculate revenue from orders
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Calculate COGS based on recipe costs
    let cogs = 0;
    orders.forEach(order => {
      order.items.forEach(item => {
        const product = mockProducts.find(p => p.id === item.productId);
        if (product?.recipe) {
          const recipeCost = product.recipe.ingredients.reduce((sum, ri) => {
            return sum + (ri.ingredient.cost * ri.quantity);
          }, 0);
          cogs += recipeCost * item.quantity;
        }
      });
    });

    // Estimate operating expenses (mock calculation)
    const opex = revenue * 0.15; // Assume 15% of revenue as operating expenses

    // Calculate net profit
    const netProfit = revenue - cogs - opex;

    // Get latest snapshot for baseline assets/liabilities
    const latestSnapshot = mockSnapshots
      .filter(s => s.vendorId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

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
    const newSnapshot = {
      id: `snapshot-${Date.now()}`,
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
    };

    mockSnapshots.push(newSnapshot);

    return res.status(400).json({
      message: 'Financial snapshot generated successfully',
      snapshot: newSnapshot,
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

// GET /api/financial/snapshots/test - Get all financial snapshots for a vendor
router.get('/snapshots/test', async (req, res) => {
  try {
    const snapshots = mockSnapshots.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return res.json({ snapshots });
  } catch (error) {
    console.error('Error fetching financial snapshots:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch financial snapshots'
    });
  }
});

// GET /api/financial/snapshots/:id/test - Get a specific financial snapshot
router.get('/snapshots/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = mockSnapshots.find(s => s.id === id);

    if (!snapshot) {
      return res.status(400).json({
        error: 'Financial snapshot not found',
        message: 'Snapshot does not exist'
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

// POST /api/financial/snapshots/test - Create a new financial snapshot
router.post('/snapshots/test', async (req, res) => {
  try {
    const validatedData = createFinancialSnapshotSchema.parse(req.body);
    
    const newSnapshot = {
      id: `snapshot-${Date.now()}`,
      vendorId: 'vendor-1',
      date: new Date(),
      ...validatedData
    };

    mockSnapshots.push(newSnapshot);

    return res.status(400).json({ snapshot: newSnapshot });
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

// PUT /api/financial/snapshots/:id/test - Update a financial snapshot
router.put('/snapshots/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateFinancialSnapshotSchema.parse(req.body);

    const snapshotIndex = mockSnapshots.findIndex(s => s.id === id);

    if (snapshotIndex === -1) {
      return res.status(400).json({
        error: 'Financial snapshot not found',
        message: 'Snapshot does not exist'
      });
    }

    mockSnapshots[snapshotIndex] = {
      ...mockSnapshots[snapshotIndex],
      ...validatedData
    };

    return res.json({ snapshot: mockSnapshots[snapshotIndex] });
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

// DELETE /api/financial/snapshots/:id/test - Delete a financial snapshot
router.delete('/snapshots/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const snapshotIndex = mockSnapshots.findIndex(s => s.id === id);

    if (snapshotIndex === -1) {
      return res.status(400).json({
        error: 'Financial snapshot not found',
        message: 'Snapshot does not exist'
      });
    }

    mockSnapshots.splice(snapshotIndex, 1);

    return res.json({ message: 'Financial snapshot deleted successfully' });
  } catch (error) {
    console.error('Error deleting financial snapshot:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to delete financial snapshot'
    });
  }
});

// GET /api/financial/analytics/test - Get financial analytics and trends
router.get('/analytics/test', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period as string));

    const filteredSnapshots = mockSnapshots.filter(s => new Date(s.date) >= daysAgo);

    if (filteredSnapshots.length === 0) {
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
    const totalRevenue = filteredSnapshots.reduce((sum, s) => sum + s.revenue, 0);
    const totalProfit = filteredSnapshots.reduce((sum, s) => sum + s.netProfit, 0);
    const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const cashFlow = filteredSnapshots.reduce((sum, s) => sum + s.cashIn - s.cashOut, 0);
    
    // Get latest snapshot for net worth
    const latestSnapshot = filteredSnapshots[filteredSnapshots.length - 1];
    const netWorth = latestSnapshot.equity;

    // Calculate trends
    const trends = filteredSnapshots.map((snapshot) => ({
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
        snapshotCount: filteredSnapshots.length
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

// POST /api/vendors/:id/financials/import/test - Mock upload and import CSV/Excel financial data
router.post('/:id/financials/import/test', requireAuth, requireRole(['VENDOR', 'ADMIN']), isVendorOwnerOrAdmin, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify vendor exists
    const vendor = mockVendors.find(v => v.id === id);
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

    // Mock AI header mapping (simplified for testing)
    const mockMapping = {
      revenue: 'Revenue',
      cogs: 'Cost of Goods Sold',
      opex: 'Operating Expenses',
      netProfit: 'Net Profit',
      cashIn: 'Cash In',
      cashOut: 'Cash Out',
      assets: 'Assets',
      liabilities: 'Liabilities',
      equity: 'Equity',
      notes: 'Notes',
      date: 'Date'
    };

    // Insert parsed & mapped financial data into mock array
    const importedSnapshots = [];
    for (const row of records) {
      try {
        const snapshot = {
          id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          vendorId: id,
          date: new Date(row[mockMapping.date] || new Date()),
          revenue: parseFloat(row[mockMapping.revenue]) || 0,
          cogs: parseFloat(row[mockMapping.cogs]) || 0,
          opex: parseFloat(row[mockMapping.opex]) || 0,
          netProfit: parseFloat(row[mockMapping.netProfit]) || 0,
          cashIn: parseFloat(row[mockMapping.cashIn]) || 0,
          cashOut: parseFloat(row[mockMapping.cashOut]) || 0,
          assets: parseFloat(row[mockMapping.assets]) || 0,
          liabilities: parseFloat(row[mockMapping.liabilities]) || 0,
          equity: parseFloat(row[mockMapping.equity]) || 0,
          notes: row[mockMapping.notes] || '',
        };
        
        mockSnapshots.push(snapshot);
        importedSnapshots.push(snapshot);
      } catch (error) {
        console.error('Error importing row:', row, error);
        // Continue with other rows even if one fails
      }
    }

    return res.json({ 
      message: '✅ Financial data imported successfully (Mock)',
      importedCount: importedSnapshots.length,
      totalRows: records.length,
      mapping: mockMapping
    });
  } catch (error) {
    console.error('Error importing financial data:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to import financial data'
    });
  }
});

// GET /api/vendors/:id/financials/insights/test - Get financial insights and analytics (Mock)
router.get('/:id/financials/insights/test', requireAuth, requireRole(['VENDOR', 'ADMIN']), isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { year, quarter } = req.query;

    // Verify vendor exists
    const vendor = mockVendors.find(v => v.id === id);
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

    // Filter snapshots for the period
    const snapshots = mockSnapshots.filter(s => 
      s.vendorId === id && 
      new Date(s.date) >= startDate && 
      new Date(s.date) < endDate
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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

// GET /api/vendors/:vendorId/financials/summary/test - Get financial summary data for charts (Mock)
router.get('/:vendorId/financials/summary/test', requireAuth, requireRole(['VENDOR', 'ADMIN']), isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    // Filter snapshots for the vendor
    const data = mockSnapshots.filter(s => s.vendorId === vendorId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
router.patch('/:id/financials/:snapshotId/test', requireAuth, requireRole(['VENDOR', 'ADMIN']), isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { id, snapshotId } = req.params;
    const updateData = req.body;

    // Find the snapshot in mock data
    const snapshotIndex = mockSnapshots.findIndex(s => s.id === snapshotId && s.vendorId === id);

    if (snapshotIndex === -1) {
      return res.status(400).json({ error: 'Financial snapshot not found' });
    }

    // Update the snapshot
    mockSnapshots[snapshotIndex] = {
      ...mockSnapshots[snapshotIndex],
      ...updateData
    };

    return res.json(mockSnapshots[snapshotIndex]);
  } catch (error) {
    console.error('Error updating financial snapshot:', error);
    return res.status(400).json({ error: 'Failed to update financial snapshot' });
  }
});

export default router; 