import { Router } from 'express';
import { z } from 'zod';
import { requireVendorAuth } from '../middleware/auth';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { prisma } from '../lib/prisma';

const router = Router();
// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// Validation schema for CSV import
const ImportProductSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['FOOD', 'NON_FOOD', 'SERVICE']).default('FOOD'),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  baseCost: z.coerce.number().min(0).default(0),
  laborCost: z.coerce.number().min(0).default(0),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  tags: z.string().optional(), // Comma-separated
  active: z.coerce.boolean().default(true),
  // Food-specific
  allergenFlags: z.string().optional(), // Comma-separated
  nutritionNotes: z.string().optional(),
  // Service-specific
  serviceDurationMin: z.coerce.number().positive().optional(),
  serviceCapacityPerDay: z.coerce.number().positive().optional(),
  serviceLeadTimeDays: z.coerce.number().positive().optional(),
  requiresDeposit: z.coerce.boolean().default(false),
});

// Helper function to generate slug
function generateSlug(name: string, vendorId: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${baseSlug}-${vendorId.slice(-6)}`;
}

// Helper function to parse CSV row
function parseCSVRow(row: any): z.infer<typeof ImportProductSchema> {
  return {
    name: row.name || row.Name || row.product_name || '',
    type: (row.type || row.Type || row.product_type || 'FOOD') as 'FOOD' | 'NON_FOOD' | 'SERVICE',
    description: row.description || row.Description || row.product_description || '',
    price: parseFloat(row.price || row.Price || row.product_price || '0'),
    baseCost: parseFloat(row.base_cost || row.baseCost || row.cost || '0'),
    laborCost: parseFloat(row.labor_cost || row.laborCost || '0'),
    sku: row.sku || row.SKU || row.product_sku || '',
    barcode: row.barcode || row.Barcode || row.product_barcode || '',
    category: row.category || row.Category || row.product_category || '',
    subcategory: row.subcategory || row.Subcategory || row.product_subcategory || '',
    tags: row.tags || row.Tags || row.product_tags || '',
    active: row.active !== 'false' && row.active !== '0' && row.active !== 'no',
    allergenFlags: row.allergen_flags || row.allergenFlags || row.allergens || '',
    nutritionNotes: row.nutrition_notes || row.nutritionNotes || row.nutrition || '',
    serviceDurationMin: row.service_duration_min ? parseInt(row.service_duration_min) : undefined,
    serviceCapacityPerDay: row.service_capacity_per_day ? parseInt(row.service_capacity_per_day) : undefined,
    serviceLeadTimeDays: row.service_lead_time_days ? parseInt(row.service_lead_time_days) : undefined,
    requiresDeposit: row.requires_deposit === 'true' || row.requiresDeposit === 'true' || row.requires_deposit === '1',
  };
}

// POST /api/vendor/products/import-csv - Import products from CSV
router.post('/import-csv', requireVendorAuth, upload.single('file'), async (req, res) => {
  try {
    const vendorId = req.user!.vendorProfileId;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results: any[] = [];
    const errors: any[] = [];
    const buffer = req.file.buffer;
    const stream = Readable.from(buffer.toString());

    // Parse CSV
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => {
          try {
            const parsedRow = parseCSVRow(row);
            const validatedRow = ImportProductSchema.parse(parsedRow);
            results.push(validatedRow);
          } catch (error) {
            errors.push({
              row: row,
              error: error instanceof Error ? error.message : 'Validation error',
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'CSV validation failed',
        errors: errors.slice(0, 10), // Limit to first 10 errors
        totalErrors: errors.length,
      });
    }

    // Get or create categories
    const categoryMap = new Map<string, string>();
    for (const product of results) {
      if (product.category && !categoryMap.has(product.category)) {
        let category = await prisma.category.findFirst({
          where: {
            vendorProfileId: vendorId,
            name: product.category,
          },
        });

        if (!category) {
          category = await prisma.category.create({
            data: {
              name: product.category,
              vendorProfileId: vendorId,
            },
          });
        }
        categoryMap.set(product.category, category.id);
      }
    }

    // Create products
    const createdProducts = [];
    for (const productData of results) {
      try {
        const slug = generateSlug(productData.name, vendorId);
        
        const product = await prisma.product.create({
          data: {
            name: productData.name,
            slug,
            type: productData.type,
            description: productData.description,
            price: productData.price,
            baseCost: productData.baseCost,
            laborCost: productData.laborCost,
            sku: productData.sku || null,
            barcode: productData.barcode || null,
            categoryId: productData.category ? categoryMap.get(productData.category) : null,
            tags: productData.tags ? productData.tags.split(',').map(t => t.trim()) : [],
            active: productData.active,
            allergenFlags: productData.allergenFlags ? productData.allergenFlags.split(',').map(a => a.trim()) : [],
            nutritionNotes: productData.nutritionNotes || null,
            serviceDurationMin: productData.serviceDurationMin || null,
            serviceCapacityPerDay: productData.serviceCapacityPerDay || null,
            serviceLeadTimeDays: productData.serviceLeadTimeDays || null,
            requiresDeposit: productData.requiresDeposit,
            vendorProfileId: vendorId,
          },
        });

        createdProducts.push(product);
      } catch (error) {
        errors.push({
          product: productData.name,
          error: error instanceof Error ? error.message : 'Creation error',
        });
      }
    }

    res.json({
      success: true,
      created: createdProducts.length,
      errors: errors.length,
      products: createdProducts,
      errorDetails: errors,
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).json({ error: 'Failed to import CSV' });
  }
});

// GET /api/vendor/products/export-csv - Export products to CSV
router.get('/export-csv', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.user!.vendorProfileId;
    const { productIds } = req.query;

    const where: any = { vendorProfileId: vendorId };
    if (productIds) {
      const ids = (productIds as string).split(',');
      where.id = { in: ids };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        subcategory: true,
        materials: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    // Convert to CSV format
    const csvHeaders = [
      'name',
      'type',
      'description',
      'price',
      'baseCost',
      'laborCost',
      'sku',
      'barcode',
      'category',
      'subcategory',
      'tags',
      'active',
      'allergenFlags',
      'nutritionNotes',
      'serviceDurationMin',
      'serviceCapacityPerDay',
      'serviceLeadTimeDays',
      'requiresDeposit',
      'createdAt',
      'updatedAt',
    ];

    const csvRows = products.map(product => [
      product.name,
      product.type,
      product.description || '',
      product.price,
      product.baseCost,
      product.laborCost,
      product.sku || '',
      product.barcode || '',
      product.category?.name || '',
      product.subcategory?.name || '',
      product.tags.join(','),
      product.active,
      product.allergenFlags.join(','),
      product.nutritionNotes || '',
      product.serviceDurationMin || '',
      product.serviceCapacityPerDay || '',
      product.serviceLeadTimeDays || '',
      product.requiresDeposit,
      product.createdAt.toISOString(),
      product.updatedAt.toISOString(),
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// GET /api/vendor/products/csv-template - Download CSV template
router.get('/csv-template', requireVendorAuth, async (req, res) => {
  try {
    const templateHeaders = [
      'name',
      'type',
      'description',
      'price',
      'baseCost',
      'laborCost',
      'sku',
      'barcode',
      'category',
      'subcategory',
      'tags',
      'active',
      'allergenFlags',
      'nutritionNotes',
      'serviceDurationMin',
      'serviceCapacityPerDay',
      'serviceLeadTimeDays',
      'requiresDeposit',
    ];

    const exampleRow = [
      'Chocolate Chip Cookies',
      'FOOD',
      'Delicious homemade chocolate chip cookies',
      '12.99',
      '3.50',
      '2.00',
      'COOKIE-001',
      '123456789012',
      'Baked Goods',
      'Cookies',
      'dessert,baking,chocolate',
      'true',
      'wheat,eggs,dairy',
      'Contains gluten, eggs, and dairy',
      '',
      '',
      '',
      'false',
    ];

    const csvContent = [
      templateHeaders.join(','),
      exampleRow.map(cell => `"${cell}"`).join(','),
      // Add empty rows for user input
      ...Array(5).fill('').map(() => templateHeaders.map(() => '""').join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="products-import-template.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error generating CSV template:', error);
    res.status(500).json({ error: 'Failed to generate CSV template' });
  }
});

export default router;






























