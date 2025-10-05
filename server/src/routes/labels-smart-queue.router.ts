import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin-mock';
import { getLabelSuggestions } from '../services/label-suggestor';
import { resolveTokens, replaceTokens } from '../services/token-resolver';

const prisma = new PrismaClient();

const router = express.Router();

// Validation schemas
const tokenPreviewSchema = z.object({
  context: z.object({
    orderId: z.string().optional(),
    orderItemId: z.string().optional(),
    productId: z.string().optional(),
  }),
  template: z.string(),
});

// Smart Queue - Get suggested label jobs
router.get('/smart-needed', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const suggestions = await getLabelSuggestions(vendorId);

    res.json({ 
      suggestions,
      summary: {
        total: suggestions.length,
        urgent: suggestions.filter(s => s.priority === 'urgent').length,
        high: suggestions.filter(s => s.priority === 'high').length,
        medium: suggestions.filter(s => s.priority === 'medium').length,
        low: suggestions.filter(s => s.priority === 'low').length,
      }
    });
  } catch (error) {
    console.error('Error getting label suggestions:', error);
    res.status(500).json({ error: 'Failed to get label suggestions' });
  }
});

// Token Preview - Preview tokens for a given context
router.get('/tokens/preview', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const { context, template } = tokenPreviewSchema.parse(req.query);

    // Build the context object
    const tokenContext: any = {};

    if (context.orderId) {
      const order = await prisma.order.findFirst({
        where: { 
          id: context.orderId,
        },
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });
      
      if (order) {
        tokenContext.order = order;
        tokenContext.vendor = { storeName: 'Test Bakery' }; // Mock vendor data
      }
    }

    if (context.orderItemId) {
      const orderItem = await prisma.orderItem.findFirst({
        where: { 
          id: context.orderItemId,
          vendorProfileId: vendorId,
        },
        include: {
          product: {
            include: {
              category: true,
            },
          },
          order: true,
        },
      });
      
      if (orderItem) {
        tokenContext.orderItem = orderItem;
        tokenContext.product = orderItem.product;
        tokenContext.order = orderItem.order;
        tokenContext.vendor = { storeName: 'Test Bakery' }; // Mock vendor data
      }
    }

    if (context.productId) {
      const product = await prisma.product.findFirst({
        where: { 
          id: context.productId,
          vendorProfileId: vendorId,
        },
        include: {
          category: true,
        },
      });
      
      if (product) {
        tokenContext.product = product;
        tokenContext.vendor = { storeName: 'Test Bakery' }; // Mock vendor data
      }
    }

    // Resolve tokens
    const tokens = await resolveTokens(tokenContext);
    
    // Replace tokens in template
    const preview = replaceTokens(template, tokens);

    res.json({ 
      tokens,
      preview,
      context: tokenContext,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error previewing tokens:', error);
    res.status(500).json({ error: 'Failed to preview tokens' });
  }
});

// Create label jobs from suggestions
router.post('/suggestions/:suggestionId/create-job', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    const { suggestionId } = req.params;
    
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    // Get the suggestion (in real implementation, this would be stored)
    const suggestions = await getLabelSuggestions(vendorId);
    const suggestion = suggestions.find(s => s.id === suggestionId);
    
    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    // Create the label job
    const job = await prisma.labelJob.create({
      data: {
        vendorProfileId: vendorId,
        source: suggestion.type as any, // Cast to match enum
        orderId: suggestion.orderId,
        orderItemId: suggestion.orderItemId,
        productId: suggestion.productId,
        labelProfileId: suggestion.labelProfileId,
        templateId: suggestion.templateId,
        tokensPayload: JSON.stringify(suggestion.tokens),
        copies: suggestion.copies,
        engine: 'PDF', // Default engine
        status: 'QUEUED',
      },
      include: {
        labelProfile: true,
        order: true,
        orderItem: true,
        product: true,
      },
    });

    res.status(201).json({ job });
  } catch (error) {
    console.error('Error creating job from suggestion:', error);
    res.status(500).json({ error: 'Failed to create job from suggestion' });
  }
});

// Bulk create jobs from suggestions
router.post('/suggestions/bulk-create', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    const { suggestionIds } = req.body;
    
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    if (!Array.isArray(suggestionIds)) {
      return res.status(400).json({ error: 'suggestionIds must be an array' });
    }

    // Get all suggestions
    const suggestions = await getLabelSuggestions(vendorId);
    const selectedSuggestions = suggestions.filter(s => suggestionIds.includes(s.id));
    
    if (selectedSuggestions.length === 0) {
      return res.status(404).json({ error: 'No valid suggestions found' });
    }

    // Create jobs
    const jobs = await Promise.all(
      selectedSuggestions.map(suggestion =>
        prisma.labelJob.create({
          data: {
            vendorProfileId: vendorId,
            source: suggestion.type as any, // Cast to match enum
            orderId: suggestion.orderId,
            orderItemId: suggestion.orderItemId,
            productId: suggestion.productId,
            labelProfileId: suggestion.labelProfileId,
            templateId: suggestion.templateId,
            tokensPayload: JSON.stringify(suggestion.tokens),
            copies: suggestion.copies,
            engine: 'PDF', // Default engine
            status: 'QUEUED',
          },
        })
      )
    );

    res.status(201).json({ 
      message: `Created ${jobs.length} label jobs`,
      jobs,
      count: jobs.length,
    });
  } catch (error) {
    console.error('Error bulk creating jobs from suggestions:', error);
    res.status(500).json({ error: 'Failed to bulk create jobs from suggestions' });
  }
});

// Get available tokens for a context
router.get('/tokens/available', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { context } = req.query;
    
    // Return all available tokens with descriptions
    const availableTokens = {
      // Product tokens
      'product.name': 'Product name',
      'product.variant': 'Product variant name',
      'product.sku': 'Product SKU',
      'product.price': 'Product price',
      'product.ingredientsList': 'Comma-separated list of ingredients',
      'product.allergens': 'Comma-separated list of allergens',
      'product.netWeight': 'Net weight (e.g., "500g")',
      'product.servingSize': 'Serving size',
      'product.servingsPerContainer': 'Number of servings per container',
      'product.nutrition.calories': 'Calories per serving',
      'product.nutrition.panel': 'Full nutrition panel text',
      
      // Production & Legal tokens
      'bornOn': 'Born on date (MM/DD/YYYY)',
      'expires': 'Expiry date (MM/DD/YYYY)',
      'shelfLife': 'Shelf life in days',
      'lot': 'Lot number (YYYYMMDD-####)',
      'storage': 'Storage instructions',
      'countryOfOrigin': 'Country of origin',
      'madeBy.name': 'Vendor name',
      'madeBy.address': 'Vendor address',
      
      // Codes
      'qr.purchaseUrl': 'QR code for product purchase URL',
      'qr.orderPickup': 'QR code for order pickup',
      'barcode.ean13': 'EAN-13 barcode',
      'barcode.code128': 'Code 128 barcode',
      'gs1.datamatrix': 'GS1 DataMatrix code',
      
      // Operational
      'order.number': 'Order number',
      'order.customerName': 'Customer name',
      'order.dueAt': 'Order due date',
      'quantity': 'Quantity of items',
      'notes': 'Order or item notes',
    };

    res.json({ tokens: availableTokens });
  } catch (error) {
    console.error('Error getting available tokens:', error);
    res.status(500).json({ error: 'Failed to get available tokens' });
  }
});

export default router;
