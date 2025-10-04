import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin-mock';
import { logger } from '../logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/receipts/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.'));
    }
  }
});

// Validation schemas
const parseReceiptSchema = z.object({
  source_type: z.enum(['IMAGE', 'PDF', 'TEXT']),
  raw_text: z.string().optional(),
});

const bulkReceiveSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    qty: z.number().positive(),
    unit: z.string(),
    unit_cost: z.number().positive(),
    supplier_name: z.string().optional(),
    batch_number: z.string().optional(),
    expiry_date: z.string().datetime().optional(),
    category: z.string().default('UNKNOWN'),
    location: z.string().optional(),
  }))
});

// POST /api/vendor/inventory/parse-receipt - Parse receipt (image/PDF/text)
router.post('/parse-receipt', isVendorOwnerOrAdmin, upload.single('file'), async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const { source_type, raw_text } = parseReceiptSchema.parse(req.body);
    let filePath: string | undefined;
    let extractedText = '';

    // Handle file upload
    if (req.file) {
      filePath = req.file.path;
      
      // Mock OCR processing (replace with actual OCR service)
      extractedText = await mockOCRProcessing(filePath, source_type);
    } else if (raw_text) {
      extractedText = raw_text;
    } else {
      return res.status(400).json({ error: 'Either file or raw_text is required' });
    }

    // Create parse job
    const job = await prisma.receiptParseJob.create({
      data: {
        vendorProfileId: vendorId,
        source_type,
        status: 'PENDING',
        raw_text: extractedText
      }
    });

    // Process the receipt asynchronously
    processReceiptAsync(job.id, extractedText, vendorId);

    res.json({
      jobId: job.id,
      status: 'PENDING',
      message: 'Receipt parsing started'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error starting receipt parsing:', error);
    res.status(500).json({ error: 'Failed to start receipt parsing' });
  }
});

// GET /api/vendor/inventory/parse-receipt/:jobId - Get parse job status and results
router.get('/parse-receipt/:jobId', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const { jobId } = req.params;

    const job = await prisma.receiptParseJob.findFirst({
      where: {
        id: jobId,
        vendorProfileId: vendorId
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Parse job not found' });
    }

    const result = {
      id: job.id,
      status: job.status,
      source_type: job.source_type,
      raw_text: job.raw_text,
      parsed_json: job.parsed_json ? JSON.parse(job.parsed_json) : null,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    };

    res.json(result);
  } catch (error) {
    logger.error('Error fetching parse job:', error);
    res.status(500).json({ error: 'Failed to fetch parse job' });
  }
});

// POST /api/vendor/inventory/bulk-receive - Bulk receive from parsed receipt
router.post('/bulk-receive', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const data = bulkReceiveSchema.parse(req.body);
    const results = [];

    // Process each item
    for (const item of data.items) {
      try {
        // Check if inventory item already exists
        let inventoryItem = await prisma.inventoryItem.findFirst({
          where: {
            vendorProfileId: vendorId,
            name: item.name
          }
        });

        if (!inventoryItem) {
          // Create new inventory item
          inventoryItem = await prisma.inventoryItem.create({
            data: {
              vendorProfileId: vendorId,
              name: item.name,
              category: item.category,
              unit: item.unit,
              current_qty: 0,
              reorder_point: 0,
              preferred_qty: 0,
              avg_cost: 0,
              last_cost: 0,
              supplier_name: item.supplier_name,
              location: item.location,
              batch_number: item.batch_number,
              expiry_date: item.expiry_date ? new Date(item.expiry_date) : null,
              tags: JSON.stringify([])
            }
          });
        }

        // Receive the inventory
        const newQty = Number(inventoryItem.current_qty) + item.qty;
        const newAvgCost = newQty > 0 
          ? ((Number(inventoryItem.current_qty) * Number(inventoryItem.avg_cost)) + (item.qty * item.unit_cost)) / newQty
          : item.unit_cost;

        const result = await prisma.$transaction(async (tx) => {
          const updatedItem = await tx.inventoryItem.update({
            where: { id: inventoryItem!.id },
            data: {
              current_qty: newQty,
              avg_cost: newAvgCost,
              last_cost: item.unit_cost,
              supplier_name: item.supplier_name || inventoryItem!.supplier_name,
              batch_number: item.batch_number || inventoryItem!.batch_number,
              expiry_date: item.expiry_date ? new Date(item.expiry_date) : inventoryItem!.expiry_date,
            }
          });

          const movement = await tx.inventoryMovement.create({
            data: {
              vendorProfileId: vendorId,
              inventoryItemId: inventoryItem!.id,
              type: 'RECEIVE',
              qty: item.qty,
              unit_cost: item.unit_cost,
              notes: 'Bulk receive from receipt parsing'
            }
          });

          return { item: updatedItem, movement };
        });

        results.push({
          success: true,
          item: result.item,
          movement: result.movement
        });
      } catch (itemError) {
        logger.error(`Error processing item ${item.name}:`, itemError);
        results.push({
          success: false,
          item: item,
          error: 'Failed to process item'
        });
      }
    }

    res.json({
      message: 'Bulk receive completed',
      results,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error in bulk receive:', error);
    res.status(500).json({ error: 'Failed to process bulk receive' });
  }
});

// Mock OCR processing function (replace with actual OCR service)
async function mockOCRProcessing(filePath: string, sourceType: string): Promise<string> {
  // This is a mock implementation
  // In a real implementation, you would use services like:
  // - Google Cloud Vision API
  // - AWS Textract
  // - Azure Computer Vision
  // - Tesseract.js for client-side processing
  
  logger.info(`Mock OCR processing for ${sourceType} file: ${filePath}`);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock extracted text
  return `MOCK RECEIPT TEXT
Store: Sample Supplier
Date: ${new Date().toLocaleDateString()}
Items:
- Flour 5kg @ $2.50/kg = $12.50
- Sugar 2kg @ $1.80/kg = $3.60
- Eggs 12pk @ $3.00/pk = $3.00
- Milk 1L @ $2.20/L = $2.20
Total: $21.30`;
}

// Async receipt processing function
async function processReceiptAsync(jobId: string, rawText: string, vendorId: string) {
  try {
    // Mock parsing logic (replace with actual parsing)
    const parsedItems = mockParseReceiptText(rawText);
    
    // Update job with results
    await prisma.receiptParseJob.update({
      where: { id: jobId },
      data: {
        status: 'DONE',
        parsed_json: JSON.stringify(parsedItems)
      }
    });

    // Create system message
    const { createInventorySystemMessage } = await import('./system-messages.router');
    await createInventorySystemMessage(
      vendorId,
      'receipt_parsed',
      'Receipt Parsed Successfully',
      `Receipt has been parsed and ${parsedItems.length} items are ready for review.`,
      {
        jobId,
        itemCount: parsedItems.length,
        route: `/inventory/receipt-review/${jobId}`
      }
    );

    logger.info(`Receipt parsing completed for job ${jobId}`);
  } catch (error) {
    logger.error(`Error processing receipt job ${jobId}:`, error);
    
    // Update job with error
    await prisma.receiptParseJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED'
      }
    });
  }
}

// Mock receipt text parsing function
function mockParseReceiptText(text: string): any[] {
  // This is a mock implementation
  // In a real implementation, you would use NLP/AI to extract structured data
  
  const lines = text.split('\n');
  const items = [];
  
  for (const line of lines) {
    // Simple regex to extract item information
    const match = line.match(/^-\s*(.+?)\s+(\d+(?:\.\d+)?)\s*(\w+)\s+@\s+\$(\d+(?:\.\d+)?)\/(\w+)\s*=\s*\$(\d+(?:\.\d+)?)/);
    
    if (match) {
      const [, name, qty, qtyUnit, unitCost, costUnit, total] = match;
      
      items.push({
        name: name.trim(),
        qty: parseFloat(qty),
        unit: qtyUnit,
        unit_cost: parseFloat(unitCost),
        total_cost: parseFloat(total),
        category: 'FOOD_GRADE', // Default category
        confidence: 0.85 // Mock confidence score
      });
    }
  }
  
  return items;
}

export default router;