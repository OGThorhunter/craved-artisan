import express from 'express';
import { z } from 'zod';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin-mock';
import { prisma } from '../lib/prisma';

const router = express.Router();
// Validation schemas
const createPrinterProfileSchema = z.object({
  name: z.string().min(1),
  networkAddr: z.string().optional(),
  type: z.enum(['THERMAL', 'LASER', 'INKJET', 'VIRTUAL']),
  engine: z.enum(['PDF', 'ZPL', 'EPL', 'ESC_POS']),
  dpi: z.number().int().min(72).max(600),
  maxWidthIn: z.number().positive(),
  maxHeightIn: z.number().positive(),
  capabilities: z.string().optional(),
});

const createLabelProfileSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  printerProfileId: z.string(),
  widthIn: z.number().positive(),
  heightIn: z.number().positive(),
  orientation: z.enum(['PORTRAIT', 'LANDSCAPE']).default('PORTRAIT'),
  cornerRadius: z.number().min(0).default(0),
  background: z.string().optional(),
  copies: z.number().int().min(1).default(1),
  engine: z.enum(['PDF', 'ZPL', 'EPL', 'ESC_POS']),
});

const createLabelTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  labelProfileId: z.string().optional(),
  engine: z.enum(['PDF', 'ZPL', 'EPL', 'ESC_POS']),
  canvasJson: z.string(),
  tokensUsed: z.string().optional(),
});

const createLabelJobSchema = z.object({
  source: z.enum(['ORDER', 'PRODUCT', 'MANUAL']),
  orderId: z.string().optional(),
  orderItemId: z.string().optional(),
  productId: z.string().optional(),
  labelProfileId: z.string(),
  templateId: z.string(),
  printerProfileId: z.string().optional(),
  tokensPayload: z.string(),
  copies: z.number().int().min(1).default(1),
  engine: z.enum(['PDF', 'ZPL', 'EPL', 'ESC_POS']),
});

// Printer Profiles
router.get('/printer-profiles', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const printers = await prisma.printerProfile.findMany({
      where: { vendorProfileId: vendorId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ printers });
  } catch (error) {
    console.error('Error fetching printer profiles:', error);
    return res.status(500).json({ error: 'Failed to fetch printer profiles' });
  }
});

router.post('/printer-profiles', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const data = createPrinterProfileSchema.parse(req.body);
    
    const printer = await prisma.printerProfile.create({
      data: {
        ...data,
        vendorProfileId: vendorId,
        driver: 'PDF', // Default driver
      },
    });

    res.status(201).json({ printer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating printer profile:', error);
    return res.status(500).json({ error: 'Failed to create printer profile' });
  }
});

router.put('/printer-profiles/:id', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    const { id } = req.params;
    
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const data = createPrinterProfileSchema.partial().parse(req.body);
    
    const printer = await prisma.printerProfile.update({
      where: { 
        id,
        vendorProfileId: vendorId,
      },
      data,
    });

    res.json({ printer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating printer profile:', error);
    res.status(500).json({ error: 'Failed to update printer profile' });
  }
});

// Label Profiles
router.get('/profiles', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const profiles = await prisma.labelProfile.findMany({
      where: { vendorProfileId: vendorId },
      include: {
        printerProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ profiles });
  } catch (error) {
    console.error('Error fetching label profiles:', error);
    return res.status(500).json({ error: 'Failed to fetch label profiles' });
  }
});

router.post('/profiles', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const data = createLabelProfileSchema.parse(req.body);
    
    const profile = await prisma.labelProfile.create({
      data: {
        ...data,
        vendorProfileId: vendorId,
        engine: data.engine as any, // Cast to match enum
      },
      include: {
        printerProfile: true,
      },
    });

    res.status(201).json({ profile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating label profile:', error);
    return res.status(500).json({ error: 'Failed to create label profile' });
  }
});

router.put('/profiles/:id', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    const { id } = req.params;
    
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const data = createLabelProfileSchema.partial().parse(req.body);
    
    const { printerProfileId, ...updateData } = data;
    const profile = await prisma.labelProfile.update({
      where: { 
        id,
        vendorProfileId: vendorId,
      },
      data: {
        ...updateData,
        engine: data.engine as any, // Cast to match enum
      },
      include: {
        printerProfile: true,
      },
    });

    res.json({ profile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating label profile:', error);
    return res.status(500).json({ error: 'Failed to update label profile' });
  }
});

// Label Templates
router.get('/templates', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const templates = await prisma.labelTemplate.findMany({
      where: { vendorProfileId: vendorId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ templates });
  } catch (error) {
    console.error('Error fetching label templates:', error);
    return res.status(500).json({ error: 'Failed to fetch label templates' });
  }
});

router.post('/templates', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const data = createLabelTemplateSchema.parse(req.body);
    
    const template = await prisma.labelTemplate.create({
      data: {
        ...data,
        vendorProfileId: vendorId,
        title: data.name, // Use name as title
        schema: '{}', // Default empty schema
      },
    });

    res.status(201).json({ template });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating label template:', error);
    return res.status(500).json({ error: 'Failed to create label template' });
  }
});

router.put('/templates/:id', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    const { id } = req.params;
    
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const data = createLabelTemplateSchema.partial().parse(req.body);
    
    const template = await prisma.labelTemplate.update({
      where: { 
        id,
        vendorProfileId: vendorId,
      },
      data,
    });

    res.json({ template });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating label template:', error);
    return res.status(500).json({ error: 'Failed to update label template' });
  }
});

// Label Jobs
router.get('/queue', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    const { status } = req.query;
    
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const where: any = { vendorProfileId: vendorId };
    if (status) {
      where.status = status;
    }

    const jobs = await prisma.labelJob.findMany({
      where,
      include: {
        labelProfile: true,
        printerProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ jobs });
  } catch (error) {
    console.error('Error fetching label jobs:', error);
    return res.status(500).json({ error: 'Failed to fetch label jobs' });
  }
});

router.post('/jobs', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const data = createLabelJobSchema.parse(req.body);
    
    const job = await prisma.labelJob.create({
      data: {
        ...data,
        vendorProfileId: vendorId,
        requestedByUserId: vendorId, // Use vendorId as fallback
        sourceId: data.orderId || data.productId || 'MANUAL',
        payload: data.tokensPayload,
        printerProfileId: data.printerProfileId || '', // Provide default
      },
      include: {
        labelProfile: true,
        printerProfile: true,
      },
    });

    res.status(201).json({ job });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating label job:', error);
    return res.status(500).json({ error: 'Failed to create label job' });
  }
});

router.post('/jobs/bulk', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const { jobs } = req.body;
    if (!Array.isArray(jobs)) {
      return res.status(400).json({ error: 'Jobs must be an array' });
    }

    const validatedJobs = jobs.map(job => createLabelJobSchema.parse(job));
    
    const createdJobs = await prisma.labelJob.createMany({
      data: validatedJobs.map(job => ({
        ...job,
        vendorProfileId: vendorId,
        requestedByUserId: vendorId, // Use vendorId as fallback
        sourceId: job.orderId || job.productId || 'MANUAL',
        payload: job.tokensPayload,
        printerProfileId: job.printerProfileId || '', // Provide default
      })),
    });

    res.status(201).json({ 
      message: `Created ${createdJobs.count} label jobs`,
      count: createdJobs.count 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating bulk label jobs:', error);
    return res.status(500).json({ error: 'Failed to create bulk label jobs' });
  }
});

router.post('/jobs/:id/render', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    const { id } = req.params;
    
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const job = await prisma.labelJob.findFirst({
      where: { 
        id,
        vendorProfileId: vendorId,
      },
      include: {
        labelProfile: true,
        printerProfile: true,
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Label job not found' });
    }

    // TODO: Implement rendering logic
    // For now, just update the status
    const updatedJob = await prisma.labelJob.update({
      where: { id },
      data: {
        status: 'RENDERING',
      },
    });

    res.json({ job: updatedJob });
  } catch (error) {
    console.error('Error rendering label job:', error);
    return res.status(500).json({ error: 'Failed to render label job' });
  }
});

router.post('/jobs/:id/print', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    const { id } = req.params;
    
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const job = await prisma.labelJob.findFirst({
      where: { 
        id,
        vendorProfileId: vendorId,
      },
      include: {
        labelProfile: true,
        printerProfile: true,
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Label job not found' });
    }

    // TODO: Implement printing logic
    // For now, just update the status
    const updatedJob = await prisma.labelJob.update({
      where: { id },
      data: {
        status: 'COMPLETED',
      },
    });

    res.json({ job: updatedJob });
  } catch (error) {
    console.error('Error printing label job:', error);
    return res.status(500).json({ error: 'Failed to print label job' });
  }
});

router.post('/jobs/:id/cancel', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    const { id } = req.params;
    
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const job = await prisma.labelJob.update({
      where: { 
        id,
        vendorProfileId: vendorId,
      },
      data: {
        status: 'CANCELLED',
      },
    });

    res.json({ job });
  } catch (error) {
    console.error('Error cancelling label job:', error);
    return res.status(500).json({ error: 'Failed to cancel label job' });
  }
});

// Assets
router.get('/assets', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const assets = await prisma.asset.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ assets });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

export default router;
