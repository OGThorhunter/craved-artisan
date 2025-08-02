import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth-mock';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import multer from 'multer';
import { parse } from 'csv-parse/sync';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Mock data
let mockSnapshots = [
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
router.get('/:id/financials/test', async (req, res) => {
  try {
    const { id } = req.params;
    const { range = 'monthly' } = req.query;
    
    // Verify vendor exists
    const vendor = mockVendors.find(v => v.id === id);
    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    // Calculate date range based on the range parameter
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const snapshots = mockSnapshots
      .filter(s => s.vendorId === id && new Date(s.date) >= startDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate summary metrics for the range
    const totalRevenue = snapshots.reduce((sum, s) => sum + s.revenue, 0);
    const totalProfit = snapshots.reduce((sum, s) => sum + s.netProfit, 0);
    const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const totalCashFlow = snapshots.reduce((sum, s) => sum + s.cashIn - s.cashOut, 0);
    
    // Get latest snapshot for current net worth
    const latestSnapshot = snapshots[0];
    const currentNetWorth = latestSnapshot?.equity || 0;

    res.json({
      vendor: {
        id: vendor.id,
        storeName: vendor.storeName
      },
      range,
      period: {
        start: startDate,
        end: now
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
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch vendor financials'
    });
  }
});

// GET /api/vendors/:id/financials/export.csv/test - Export financial data as CSV
router.get('/:id/financials/export.csv/test', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify vendor exists
    const vendor = mockVendors.find(v => v.id === id);
    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    const entries = mockSnapshots
      .filter(s => s.vendorId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (entries.length === 0) {
      return res.status(404).json({
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
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to export financial data'
    });
  }
});

// GET /api/vendors/:id/financials/export.pdf/test - Export financial data as PDF
router.get('/:id/financials/export.pdf/test', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify vendor exists
    const vendor = mockVendors.find(v => v.id === id);
    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    const entries = mockSnapshots
      .filter(s => s.vendorId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (entries.length === 0) {
      return res.status(404).json({
        error: 'No financial data found',
        message: 'No financial snapshots available for export'
      });
    }

    // Create PDF document
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="financials-${vendor.storeName}-${new Date().toISOString().split('T')[0]}.pdf"`);
    
    // Pipe the PDF to the response
    doc.pipe(res);

    // Add title
    doc.fontSize(24).text('Financial Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(18).text(vendor.storeName, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Add summary section
    const totalRevenue = entries.reduce((sum, e) => sum + e.revenue, 0);
    const totalProfit = entries.reduce((sum, e) => sum + e.netProfit, 0);
    const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const latestSnapshot = entries[0];

    doc.fontSize(16).text('Executive Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total Revenue: $${totalRevenue.toLocaleString()}`);
    doc.fontSize(12).text(`Total Net Profit: $${totalProfit.toLocaleString()}`);
    doc.fontSize(12).text(`Average Profit Margin: ${avgProfitMargin.toFixed(1)}%`);
    doc.fontSize(12).text(`Current Net Worth: $${latestSnapshot.equity.toLocaleString()}`);
    doc.moveDown(2);

    // Add financial snapshots table
    doc.fontSize(16).text('Financial Snapshots', { underline: true });
    doc.moveDown(0.5);

    // Table headers
    const tableTop = doc.y;
    const tableLeft = 50;
    const colWidth = 100;
    const rowHeight = 20;

    // Draw table headers
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Date', tableLeft, tableTop);
    doc.text('Revenue', tableLeft + colWidth, tableTop);
    doc.text('COGS', tableLeft + colWidth * 2, tableTop);
    doc.text('OPEX', tableLeft + colWidth * 3, tableTop);
    doc.text('Net Profit', tableLeft + colWidth * 4, tableTop);
    doc.text('Equity', tableLeft + colWidth * 5, tableTop);

    // Draw header line
    doc.moveTo(tableLeft, tableTop + 15).lineTo(tableLeft + colWidth * 6, tableTop + 15).stroke();

    // Add table rows
    doc.fontSize(9).font('Helvetica');
    entries.forEach((entry, index) => {
      const y = tableTop + rowHeight + (index * rowHeight);
      
      // Check if we need a new page
      if (y > doc.page.height - 100) {
        doc.addPage();
        doc.fontSize(16).text('Financial Snapshots (Continued)', { underline: true });
        doc.moveDown(0.5);
        // Reset table position for new page
        const newTableTop = doc.y;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Date', tableLeft, newTableTop);
        doc.text('Revenue', tableLeft + colWidth, newTableTop);
        doc.text('COGS', tableLeft + colWidth * 2, newTableTop);
        doc.text('OPEX', tableLeft + colWidth * 3, newTableTop);
        doc.text('Net Profit', tableLeft + colWidth * 4, newTableTop);
        doc.text('Equity', tableLeft + colWidth * 5, newTableTop);
        doc.moveTo(tableLeft, newTableTop + 15).lineTo(tableLeft + colWidth * 6, newTableTop + 15).stroke();
        doc.fontSize(9).font('Helvetica');
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
    doc.moveDown(2);
    doc.fontSize(10).text(`Report generated for ${vendor.storeName} on ${new Date().toLocaleString()}`, { align: 'center' });

    // End the PDF
    doc.end();
  } catch (error) {
    console.error('Error exporting financial data as PDF:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to export financial data as PDF'
    });
  }
});

// POST /api/vendors/:id/financials/generate/test - Generate financial snapshot automatically
router.post('/:id/financials/generate/test', async (req, res) => {
  try {
    const { id } = req.params;
    const { period = 'monthly', notes } = req.body;

    // Verify vendor exists
    const vendor = mockVendors.find(v => v.id === id);
    if (!vendor) {
      return res.status(404).json({
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

    res.status(201).json({
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
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate financial snapshot'
    });
  }
});

// GET /api/financial/snapshots/test - Get all financial snapshots for a vendor
router.get('/snapshots/test', async (req, res) => {
  try {
    const snapshots = mockSnapshots.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json({ snapshots });
  } catch (error) {
    console.error('Error fetching financial snapshots:', error);
    res.status(500).json({
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
      return res.status(404).json({
        error: 'Financial snapshot not found',
        message: 'Snapshot does not exist'
      });
    }

    res.json({ snapshot });
  } catch (error) {
    console.error('Error fetching financial snapshot:', error);
    res.status(500).json({
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

    res.status(201).json({ snapshot: newSnapshot });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid data provided',
        details: error.errors
      });
    }

    console.error('Error creating financial snapshot:', error);
    res.status(500).json({
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
      return res.status(404).json({
        error: 'Financial snapshot not found',
        message: 'Snapshot does not exist'
      });
    }

    mockSnapshots[snapshotIndex] = {
      ...mockSnapshots[snapshotIndex],
      ...validatedData
    };

    res.json({ snapshot: mockSnapshots[snapshotIndex] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid data provided',
        details: error.errors
      });
    }

    console.error('Error updating financial snapshot:', error);
    res.status(500).json({
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
      return res.status(404).json({
        error: 'Financial snapshot not found',
        message: 'Snapshot does not exist'
      });
    }

    mockSnapshots.splice(snapshotIndex, 1);

    res.json({ message: 'Financial snapshot deleted successfully' });
  } catch (error) {
    console.error('Error deleting financial snapshot:', error);
    res.status(500).json({
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

    res.json({
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
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch financial analytics'
    });
  }
});

// POST /api/vendors/:id/financials/import/test - Mock upload and import CSV/Excel financial data
router.post('/:id/financials/import/test', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify vendor exists
    const vendor = mockVendors.find(v => v.id === id);
    if (!vendor) {
      return res.status(404).json({
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

    res.json({ 
      message: '✅ Financial data imported successfully (Mock)',
      importedCount: importedSnapshots.length,
      totalRows: records.length,
      mapping: mockMapping
    });
  } catch (error) {
    console.error('Error importing financial data:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to import financial data'
    });
  }
});

export default router; 