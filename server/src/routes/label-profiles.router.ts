import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { 
  CreateLabelProfileRequest, 
  CreatePrinterProfileRequest,
  CompileLabelsRequest,
  CompileLabelsResponse,
  LabelProfile,
  PrinterProfile
} from '../types/label';

const router = Router();

// Validation schemas
const CreatePrinterProfileSchema = z.object({
  name: z.string().min(1).max(100),
  driver: z.enum(['PDF', 'ZPL', 'TSPL', 'BrotherQL', 'Custom']),
  dpi: z.number().int().min(72).max(1200).default(203),
  mediaSupported: z.array(z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    name: z.string(),
    isContinuous: z.boolean().default(false),
    isSupported: z.boolean().default(true)
  })).default([]),
  address: z.string().optional(),
  isColor: z.boolean().default(false),
  isThermal: z.boolean().default(true),
  maxWidthIn: z.number().positive(),
  maxHeightIn: z.number().positive(),
  capabilities: z.object({}).default({})
});

const CreateLabelProfileSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  mediaWidthIn: z.number().positive(),
  mediaHeightIn: z.number().positive(),
  orientation: z.enum(['portrait', 'landscape', 'auto']).default('portrait'),
  cornerRadius: z.number().min(0).default(0.125),
  bleedIn: z.number().min(0).default(0.125),
  safeMarginIn: z.number().min(0).default(0.125),
  dpi: z.number().int().min(72).max(1200).default(203),
  engine: z.enum(['PDF', 'ZPL', 'TSPL', 'BrotherQL']).default('PDF'),
  templateId: z.string().optional(),
  printerProfileId: z.string(),
  batchGroupKey: z.string().optional(),
  copiesPerUnit: z.number().int().min(1).default(1),
  rotation: z.number().int().min(0).max(360).default(0),
  colorHint: z.enum(['monochrome', 'color', 'auto']).default('monochrome'),
  fallbackProfileId: z.string().optional(),
  rules: z.object({}).default({}),
  dataBindings: z.object({}).default({})
});

const CompileLabelsSchema = z.object({
  orderIds: z.array(z.string()).min(1),
  groupBy: z.enum(['salesWindow', 'pickupTime', 'route', 'printer']).optional(),
  dryRun: z.boolean().default(false),
  options: z.object({
    includeWarnings: z.boolean().default(true),
    validateMedia: z.boolean().default(true),
    checkTextFit: z.boolean().default(true),
    validateBarcodes: z.boolean().default(true)
  }).optional()
});

// GET /api/printer-profiles
router.get('/printer-profiles', async (req, res) => {
  try {
    const profiles = await prisma.printerProfile.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    
    res.json({ success: true, data: profiles });
  } catch (error: any) {
    console.error('FETCH_PRINTER_PROFILES_ERROR', error);
    res.status(500).json({ 
      success: false, 
      error: 'FETCH_PRINTER_PROFILES_FAILED', 
      message: error.message 
    });
  }
});

// POST /api/printer-profiles
router.post('/printer-profiles', async (req, res) => {
  try {
    const validatedData = CreatePrinterProfileSchema.parse(req.body);
    
    const profile = await prisma.printerProfile.create({
      data: validatedData
    });
    
    res.status(201).json({ success: true, data: profile });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid printer profile data',
        details: error.errors
      });
    }
    
    console.error('CREATE_PRINTER_PROFILE_ERROR', error);
    res.status(500).json({ 
      success: false, 
      error: 'CREATE_PRINTER_PROFILE_FAILED', 
      message: error.message 
    });
  }
});

// PUT /api/printer-profiles/:id
router.put('/printer-profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = CreatePrinterProfileSchema.parse(req.body);
    
    const profile = await prisma.printerProfile.update({
      where: { id },
      data: validatedData
    });
    
    res.json({ success: true, data: profile });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid printer profile data',
        details: error.errors
      });
    }
    
    console.error('UPDATE_PRINTER_PROFILE_ERROR', error);
    res.status(500).json({ 
      success: false, 
      error: 'UPDATE_PRINTER_PROFILE_FAILED', 
      message: error.message 
    });
  }
});

// DELETE /api/printer-profiles/:id
router.delete('/printer-profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if profile is in use
    const inUse = await prisma.labelProfile.findFirst({
      where: { printerProfileId: id }
    });
    
    if (inUse) {
      return res.status(400).json({
        success: false,
        error: 'PROFILE_IN_USE',
        message: 'Cannot delete printer profile that is in use by label profiles'
      });
    }
    
    await prisma.printerProfile.update({
      where: { id },
      data: { isActive: false }
    });
    
    res.json({ success: true, message: 'Printer profile deactivated' });
  } catch (error: any) {
    console.error('DELETE_PRINTER_PROFILE_ERROR', error);
    res.status(500).json({ 
      success: false, 
      error: 'DELETE_PRINTER_PROFILE_FAILED', 
      message: error.message 
    });
  }
});

// GET /api/label-profiles
router.get('/label-profiles', async (req, res) => {
  try {
    const profiles = await prisma.labelProfile.findMany({
      where: { isActive: true },
      include: {
        printerProfile: true,
        fallbackProfile: true
      },
      orderBy: { name: 'asc' }
    });
    
    res.json({ success: true, data: profiles });
  } catch (error: any) {
    console.error('FETCH_LABEL_PROFILES_ERROR', error);
    res.status(500).json({ 
      success: false, 
      error: 'FETCH_LABEL_PROFILES_FAILED', 
      message: error.message 
    });
  }
});

// POST /api/label-profiles
router.post('/label-profiles', async (req, res) => {
  try {
    const validatedData = CreateLabelProfileSchema.parse(req.body);
    
    // Validate printer profile exists
    const printerProfile = await prisma.printerProfile.findUnique({
      where: { id: validatedData.printerProfileId }
    });
    
    if (!printerProfile) {
      return res.status(400).json({
        success: false,
        error: 'PRINTER_PROFILE_NOT_FOUND',
        message: 'Specified printer profile does not exist'
      });
    }
    
    // Validate media size compatibility
    const isMediaSupported = printerProfile.mediaSupported.some(media => 
      Math.abs(media.width - validatedData.mediaWidthIn) < 0.01 &&
      Math.abs(media.height - validatedData.mediaHeightIn) < 0.01
    );
    
    if (!isMediaSupported && printerProfile.mediaSupported.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'MEDIA_NOT_SUPPORTED',
        message: 'Media size not supported by selected printer profile'
      });
    }
    
    const profile = await prisma.labelProfile.create({
      data: validatedData,
      include: {
        printerProfile: true,
        fallbackProfile: true
      }
    });
    
    res.status(201).json({ success: true, data: profile });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid label profile data',
        details: error.errors
      });
    }
    
    console.error('CREATE_LABEL_PROFILE_ERROR', error);
    res.status(500).json({ 
      success: false, 
      error: 'CREATE_LABEL_PROFILE_FAILED', 
      message: error.message 
    });
  }
});

// PUT /api/label-profiles/:id
router.put('/label-profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = CreateLabelProfileSchema.parse(req.body);
    
    const profile = await prisma.labelProfile.update({
      where: { id },
      data: validatedData,
      include: {
        printerProfile: true,
        fallbackProfile: true
      }
    });
    
    res.json({ success: true, data: profile });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid label profile data',
        details: error.errors
      });
    }
    
    console.error('UPDATE_LABEL_PROFILE_ERROR', error);
    res.status(500).json({ 
      success: false, 
      error: 'UPDATE_LABEL_PROFILE_FAILED', 
      message: error.message 
    });
  }
});

// DELETE /api/label-profiles/:id
router.delete('/label-profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if profile is in use
    const inUse = await prisma.product.findFirst({
      where: { defaultLabelProfileId: id }
    });
    
    if (inUse) {
      return res.status(400).json({
        success: false,
        error: 'PROFILE_IN_USE',
        message: 'Cannot delete label profile that is in use by products'
      });
    }
    
    await prisma.labelProfile.update({
      where: { id },
      data: { isActive: false }
    });
    
    res.json({ success: true, message: 'Label profile deactivated' });
  } catch (error: any) {
    console.error('DELETE_LABEL_PROFILE_ERROR', error);
    res.status(500).json({ 
      success: false, 
      error: 'DELETE_LABEL_PROFILE_FAILED', 
      message: error.message 
    });
  }
});

// POST /api/labels/compile
router.post('/labels/compile', async (req, res) => {
  try {
    const validatedData = CompileLabelsSchema.parse(req.body);
    
    // This is a placeholder for the complex compilation logic
    // Will be implemented in Phase 3
    const response: CompileLabelsResponse = {
      success: true,
      batchJobId: `batch_${Date.now()}`,
      summary: {
        totalLabels: 0,
        totalOrders: validatedData.orderIds.length,
        printerJobs: [],
        mediaUsage: [],
        estimatedTime: 0
      },
      warnings: [],
      errors: [],
      dryRun: validatedData.dryRun
    };
    
    res.json(response);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid compile labels request',
        details: error.errors
      });
    }
    
    console.error('COMPILE_LABELS_ERROR', error);
    res.status(500).json({ 
      success: false, 
      error: 'COMPILE_LABELS_FAILED', 
      message: error.message 
    });
  }
});

// GET /api/labels/batch/:id
router.get('/labels/batch/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const batchJob = await prisma.labelBatchJob.findUnique({
      where: { id },
      include: {
        printerJobs: {
          include: {
            printerProfile: true,
            labelProfile: true
          }
        }
      }
    });
    
    if (!batchJob) {
      return res.status(404).json({
        success: false,
        error: 'BATCH_JOB_NOT_FOUND',
        message: 'Batch job not found'
      });
    }
    
    res.json({ success: true, data: batchJob });
  } catch (error: any) {
    console.error('FETCH_BATCH_JOB_ERROR', error);
    res.status(500).json({ 
      success: false, 
      error: 'FETCH_BATCH_JOB_FAILED', 
      message: error.message 
    });
  }
});

export { router as labelProfilesRouter };
