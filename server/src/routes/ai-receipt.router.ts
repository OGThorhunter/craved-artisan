import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin-mock';
import { ocrParse, callOllamaChat, RECEIPT_POST_PROCESSOR_PROMPT } from '../lib/ai';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  },
});

// Validation schemas
const ParseReceiptSchema = z.object({
  text: z.string().optional(),
});

const BulkReceiveSchema = z.object({
  jobId: z.string(),
  rows: z.array(z.object({
    inventoryItemId: z.string().optional(),
    suggestedName: z.string().optional(),
    qty: z.number().positive(),
    unit: z.string(),
    unit_price: z.number().positive(),
    supplier: z.string().optional(),
    batch: z.string().optional(),
    expiry: z.string().optional(),
  })),
  createMissing: z.boolean().default(false),
});

// POST /api/ai/receipt/parse
router.post('/parse', isVendorOwnerOrAdmin, upload.single('file'), async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { text } = ParseReceiptSchema.parse(req.body);
    const file = req.file;

    if (!file && !text) {
      return res.status(400).json({ error: 'Either file or text must be provided' });
    }

    let sourceType: string;
    let rawText: string | undefined;

    if (file) {
      sourceType = file.mimetype.startsWith('image/') ? 'IMAGE' : 'PDF';
      // For now, we'll use the filename as raw text (in production, use actual OCR)
      rawText = file.originalname;
    } else {
      sourceType = 'TEXT';
      rawText = text;
    }

    // Create parse job
    const parseJob = await prisma.receiptParseJob.create({
      data: {
        vendorProfileId,
        status: 'PENDING',
        sourceType,
        rawText,
      },
    });

    try {
      // Call OCR service
      const ocrResult = await ocrParse({
        file: file?.buffer,
        filename: file?.originalname,
        text,
      });

      if (ocrResult.status === 'FAILED') {
        throw new Error(ocrResult.error || 'OCR parsing failed');
      }

      // Post-process with LLM for better structure
      let parsedJson = ocrResult.parsed_json;
      
      if (parsedJson && rawText) {
        try {
          const llmResponse = await callOllamaChat({
            system: RECEIPT_POST_PROCESSOR_PROMPT,
            prompt: `Receipt text: ${rawText}\n\nCurrent parsed data: ${JSON.stringify(parsedJson)}\n\nImprove and normalize this data:`,
          });

          // Try to parse LLM response as JSON
          const llmJson = JSON.parse(llmResponse);
          if (llmJson && llmJson.lines) {
            parsedJson = llmJson;
          }
        } catch (llmError) {
          console.warn('LLM post-processing failed, using OCR result:', llmError);
        }
      }

      // Update job with results
      await prisma.receiptParseJob.update({
        where: { id: parseJob.id },
        data: {
          status: 'DONE',
          parsedJson: JSON.stringify(parsedJson),
        },
      });

      // Create system message
      await prisma.systemMessage.create({
        data: {
          vendorProfileId,
          scope: 'inventory',
          type: 'receipt_parsed',
          title: 'Receipt Parsed Successfully',
          body: `Receipt parsed with ${parsedJson?.lines?.length || 0} items. Review and receive items.`,
          data: JSON.stringify({ jobId: parseJob.id }),
        },
      });

      res.json({
        jobId: parseJob.id,
        status: 'DONE',
        parsed_json: parsedJson,
      });

    } catch (error) {
      // Update job with error
      await prisma.receiptParseJob.update({
        where: { id: parseJob.id },
        data: {
          status: 'FAILED',
        },
      });

      throw error;
    }

  } catch (error) {
    console.error('Receipt parse error:', error);
    res.status(500).json({ error: 'Failed to parse receipt' });
  }
});

// GET /api/ai/receipt/parse/:jobId
router.get('/parse/:jobId', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { jobId } = req.params;

    const job = await prisma.receiptParseJob.findFirst({
      where: {
        id: jobId,
        vendorProfileId,
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      jobId: job.id,
      status: job.status,
      parsed_json: job.parsedJson ? JSON.parse(job.parsedJson) : null,
      error: job.status === 'FAILED' ? 'Parsing failed' : undefined,
      created_at: job.createdAt,
    });

  } catch (error) {
    console.error('Get parse job error:', error);
    res.status(500).json({ error: 'Failed to get parse job' });
  }
});

// POST /api/ai/receipt/bulk-receive
router.post('/bulk-receive', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { jobId, rows, createMissing } = BulkReceiveSchema.parse(req.body);

    // Get the parse job
    const job = await prisma.receiptParseJob.findFirst({
      where: {
        id: jobId,
        vendorProfileId,
        status: 'DONE',
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found or not completed' });
    }

    const results = [];
    const errors = [];

    for (const row of rows) {
      try {
        let inventoryItemId = row.inventoryItemId;

        // Create inventory item if missing and createMissing is true
        if (!inventoryItemId && createMissing && row.suggestedName) {
          const newItem = await prisma.inventoryItem.create({
            data: {
              vendorProfileId,
              name: row.suggestedName,
              category: 'FOOD_GRADE', // Default category
              unit: row.unit,
              current_qty: 0,
              reorder_point: 0,
              preferred_qty: 0,
              avg_cost: 0,
              last_cost: 0,
            },
          });
          inventoryItemId = newItem.id;
        }

        if (!inventoryItemId) {
          errors.push(`No inventory item ID for: ${row.suggestedName}`);
          continue;
        }

        // Get current inventory item
        const inventoryItem = await prisma.inventoryItem.findUnique({
          where: { id: inventoryItemId },
        });

        if (!inventoryItem) {
          errors.push(`Inventory item not found: ${inventoryItemId}`);
          continue;
        }

        // Calculate new quantities and costs
        const newQty = Number(inventoryItem.current_qty) + row.qty;
        const newAvgCost = calculateMovingAverage(
          Number(inventoryItem.current_qty),
          Number(inventoryItem.avg_cost),
          row.qty,
          row.unit_price
        );

        // Create inventory movement
        await prisma.inventoryMovement.create({
          data: {
            inventoryItemId,
            type: 'RECEIVE',
            quantity: row.qty,
            unit_cost: row.unit_price,
            total_cost: row.qty * row.unit_price,
            reference: `Receipt: ${jobId}`,
            notes: `Bulk receive from receipt parsing. ${row.supplier ? `Supplier: ${row.supplier}` : ''} ${row.batch ? `Batch: ${row.batch}` : ''}`,
          },
        });

        // Update inventory item
        await prisma.inventoryItem.update({
          where: { id: inventoryItemId },
          data: {
            current_qty: newQty,
            avg_cost: newAvgCost,
            last_cost: row.unit_price,
            supplier_name: row.supplier || inventoryItem.supplier_name,
            batch_number: row.batch || inventoryItem.batch_number,
            expiry_date: row.expiry ? new Date(row.expiry) : inventoryItem.expiry_date,
          },
        });

        // Update receipt item mapping if suggested name was used
        if (row.suggestedName && inventoryItemId) {
          await prisma.receiptItemMap.upsert({
            where: {
              vendorProfileId_rawName: {
                vendorProfileId,
                rawName: row.suggestedName,
              },
            },
            update: {
              inventoryItemId,
              lastUsedAt: new Date(),
            },
            create: {
              vendorProfileId,
              rawName: row.suggestedName,
              inventoryItemId,
            },
          });
        }

        results.push({
          inventoryItemId,
          name: inventoryItem.name,
          qty: row.qty,
          unit: row.unit,
          unit_price: row.unit_price,
          total_cost: row.qty * row.unit_price,
        });

      } catch (error) {
        console.error('Error processing row:', error);
        errors.push(`Failed to process ${row.suggestedName || row.inventoryItemId}: ${error}`);
      }
    }

    // Create system message
    await prisma.systemMessage.create({
      data: {
        vendorProfileId,
        scope: 'inventory',
        type: 'receipt_parsed',
        title: 'Bulk Receive Completed',
        body: `Successfully received ${results.length} items. ${errors.length > 0 ? `${errors.length} errors occurred.` : ''}`,
        data: JSON.stringify({ jobId, results, errors }),
      },
    });

    res.json({
      success: true,
      results,
      errors,
      summary: {
        total_processed: rows.length,
        successful: results.length,
        failed: errors.length,
      },
    });

  } catch (error) {
    console.error('Bulk receive error:', error);
    res.status(500).json({ error: 'Failed to bulk receive items' });
  }
});

// Helper function for moving average calculation
function calculateMovingAverage(
  currentQty: number,
  currentAvgCost: number,
  newQty: number,
  newUnitCost: number
): number {
  const totalQty = currentQty + newQty;
  const totalCost = (currentQty * currentAvgCost) + (newQty * newUnitCost);
  
  return totalQty > 0 ? totalCost / totalQty : newUnitCost;
}

export default router;
