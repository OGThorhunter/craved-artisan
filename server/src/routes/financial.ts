import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import OpenAI from 'openai';

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
router.get('/:id/financials', requireAuth, requireRole(['VENDOR', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { range = 'monthly' } = req.query;
    
    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      select: { id: true, storeName: true }
    });

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

    const snapshots = await prisma.financialSnapshot.findMany({
      where: {
        vendorId: id,
        date: {
          gte: startDate
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

// GET /api/vendors/:id/financials/export.csv - Export financial data as CSV
router.get('/:id/financials/export.csv', requireAuth, requireRole(['VENDOR', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      select: { id: true, storeName: true }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    const entries = await prisma.financialSnapshot.findMany({
      where: { vendorId: id },
      orderBy: { date: 'desc' },
    });

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

// GET /api/vendors/:id/financials/export.pdf - Export financial data as PDF
router.get('/:id/financials/export.pdf', requireAuth, requireRole(['VENDOR', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      select: { id: true, storeName: true }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    const entries = await prisma.financialSnapshot.findMany({
      where: { vendorId: id },
      orderBy: { date: 'desc' },
    });

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

// POST /api/vendors/:id/financials/generate - Generate financial snapshot automatically
router.post('/:id/financials/generate', requireAuth, requireRole(['VENDOR', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { period = 'monthly', notes } = req.body;

    // Verify vendor exists
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      select: { id: true, storeName: true }
    });

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

    res.status(201).json({
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
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate financial snapshot'
    });
  }
});

// GET /api/financial/snapshots - Get all financial snapshots for a vendor
router.get('/snapshots', requireAuth, requireRole(['VENDOR', 'ADMIN']), async (req, res) => {
  try {
    const vendorId = req.session.userId;
    
    const snapshots = await prisma.financialSnapshot.findMany({
      where: { vendorId },
      orderBy: { date: 'desc' },
      take: 100, // Limit to last 100 snapshots
    });

    res.json({ snapshots });
  } catch (error) {
    console.error('Error fetching financial snapshots:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch financial snapshots'
    });
  }
});

// GET /api/financial/snapshots/:id - Get a specific financial snapshot
router.get('/snapshots/:id', requireAuth, requireRole(['VENDOR', 'ADMIN']), async (req, res) => {
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
      return res.status(404).json({
        error: 'Financial snapshot not found',
        message: 'Snapshot does not exist or you do not have access'
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

// POST /api/financial/snapshots - Create a new financial snapshot
router.post('/snapshots', requireAuth, requireRole(['VENDOR', 'ADMIN']), async (req, res) => {
  try {
    const vendorId = req.session.userId;
    const validatedData = createFinancialSnapshotSchema.parse(req.body);

    const snapshot = await prisma.financialSnapshot.create({
      data: {
        ...validatedData,
        vendorId,
      }
    });

    res.status(201).json({ snapshot });
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

// PUT /api/financial/snapshots/:id - Update a financial snapshot
router.put('/snapshots/:id', requireAuth, requireRole(['VENDOR', 'ADMIN']), async (req, res) => {
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
      return res.status(404).json({
        error: 'Financial snapshot not found',
        message: 'Snapshot does not exist or you do not have access'
      });
    }

    const snapshot = await prisma.financialSnapshot.update({
      where: { id },
      data: validatedData
    });

    res.json({ snapshot });
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

// DELETE /api/financial/snapshots/:id - Delete a financial snapshot
router.delete('/snapshots/:id', requireAuth, requireRole(['VENDOR', 'ADMIN']), async (req, res) => {
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
      return res.status(404).json({
        error: 'Financial snapshot not found',
        message: 'Snapshot does not exist or you do not have access'
      });
    }

    await prisma.financialSnapshot.delete({
      where: { id }
    });

    res.json({ message: 'Financial snapshot deleted successfully' });
  } catch (error) {
    console.error('Error deleting financial snapshot:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete financial snapshot'
    });
  }
});

// GET /api/financial/analytics - Get financial analytics and trends
router.get('/analytics', requireAuth, requireRole(['VENDOR', 'ADMIN']), async (req, res) => {
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

    res.json({
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
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch financial analytics'
    });
  }
});

// POST /api/vendors/:id/financials/import - Upload and import CSV/Excel financial data with AI header mapping
router.post('/:id/financials/import', requireAuth, requireRole(['VENDOR', 'ADMIN']), upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify vendor exists and user has access
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      select: { id: true, storeName: true }
    });

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

    res.json({ 
      message: '✅ Financial data imported successfully',
      importedCount: importedSnapshots.length,
      totalRows: records.length,
      mapping: mappedFields
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