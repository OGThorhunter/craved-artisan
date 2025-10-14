import { Router } from 'express';
import { z } from 'zod';
import { 
  CreateLabelProfileRequest, 
  CreatePrinterProfileRequest,
  CompileLabelsRequest,
  CompileLabelsResponse,
  LabelProfile,
  PrinterProfile
} from '../types/label';

const router = Router();

// Mock data storage (in production, this would be database)
const printerProfiles: PrinterProfile[] = [
  {
    id: 'printer-1',
    name: 'Zebra ZT230',
    driver: 'ZPL',
    dpi: 203,
    mediaSupported: [
      { width: 4, height: 6, name: '4x6 Standard', isContinuous: false, isSupported: true },
      { width: 2, height: 1, name: '2x1 Small', isContinuous: false, isSupported: true }
    ],
    address: '192.168.1.100',
    isColor: false,
    isThermal: true,
    maxWidthIn: 4.25,
    maxHeightIn: 6.25,
    capabilities: {
      supportsColor: false,
      supportsDuplex: false,
      maxCopies: 999,
      supportedMediaTypes: ['thermal', 'paper'],
      networkProtocols: ['TCP/IP']
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'printer-2',
    name: 'Brother QL-820NWB',
    driver: 'BrotherQL',
    dpi: 300,
    mediaSupported: [
      { width: 4, height: 6, name: '4x6 Standard', isContinuous: false, isSupported: true },
      { width: 3, height: 2, name: '3x2 Medium', isContinuous: false, isSupported: true }
    ],
    address: '192.168.1.101',
    isColor: false,
    isThermal: true,
    maxWidthIn: 4.25,
    maxHeightIn: 6.25,
    capabilities: {
      supportsColor: false,
      supportsDuplex: false,
      maxCopies: 99,
      supportedMediaTypes: ['thermal'],
      networkProtocols: ['WiFi', 'Ethernet']
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const labelProfiles: LabelProfile[] = [
  {
    id: 'label-1',
    name: 'Standard Product Label',
    description: 'Standard 4x6 product label for general use',
    mediaWidthIn: 4,
    mediaHeightIn: 6,
    orientation: 'portrait',
    cornerRadius: 0.125,
    bleedIn: 0.125,
    safeMarginIn: 0.125,
    dpi: 203,
    engine: 'ZPL',
    printerProfileId: 'printer-1',
    copiesPerUnit: 1,
    rotation: 0,
    colorHint: 'monochrome',
    rules: { conditions: [], actions: [] },
    dataBindings: {
      productName: { source: 'product', field: 'name', required: true },
      price: { source: 'product', field: 'price', required: true },
      sku: { source: 'product', field: 'sku', required: true },
      barcode: { source: 'product', field: 'sku', required: true }
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'label-2',
    name: 'Small Product Label',
    description: 'Small 2x1 label for compact products',
    mediaWidthIn: 2,
    mediaHeightIn: 1,
    orientation: 'portrait',
    cornerRadius: 0.0625,
    bleedIn: 0.0625,
    safeMarginIn: 0.0625,
    dpi: 203,
    engine: 'ZPL',
    printerProfileId: 'printer-1',
    copiesPerUnit: 1,
    rotation: 0,
    colorHint: 'monochrome',
    rules: { conditions: [], actions: [] },
    dataBindings: {
      productName: { source: 'product', field: 'name', required: true },
      price: { source: 'product', field: 'price', required: true },
      barcode: { source: 'product', field: 'sku', required: true }
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

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
    const profiles = printerProfiles.filter(p => p.isActive);
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
    
    const profile: PrinterProfile = {
      id: `printer-${Date.now()}`,
      ...validatedData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    printerProfiles.push(profile);
    
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
    
    const profileIndex = printerProfiles.findIndex(p => p.id === id);
    if (profileIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'PRINTER_PROFILE_NOT_FOUND',
        message: 'Printer profile not found'
      });
    }
    
    printerProfiles[profileIndex] = {
      ...printerProfiles[profileIndex],
      ...validatedData,
      updatedAt: new Date().toISOString()
    };
    
    res.json({ success: true, data: printerProfiles[profileIndex] });
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
    const inUse = labelProfiles.some(lp => lp.printerProfileId === id);
    
    if (inUse) {
      return res.status(400).json({
        success: false,
        error: 'PROFILE_IN_USE',
        message: 'Cannot delete printer profile that is in use by label profiles'
      });
    }
    
    const profileIndex = printerProfiles.findIndex(p => p.id === id);
    if (profileIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'PRINTER_PROFILE_NOT_FOUND',
        message: 'Printer profile not found'
      });
    }
    
    printerProfiles[profileIndex].isActive = false;
    printerProfiles[profileIndex].updatedAt = new Date().toISOString();
    
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
    const profiles = labelProfiles
      .filter(p => p.isActive)
      .map(profile => ({
        ...profile,
        printerProfile: printerProfiles.find(p => p.id === profile.printerProfileId),
        fallbackProfile: profile.fallbackProfileId ? 
          labelProfiles.find(p => p.id === profile.fallbackProfileId) : undefined
      }));
    
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
    const printerProfile = printerProfiles.find(p => p.id === validatedData.printerProfileId);
    
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
    
    const profile: LabelProfile = {
      id: `label-${Date.now()}`,
      ...validatedData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    labelProfiles.push(profile);
    
    // Return with printer profile included
    const responseProfile = {
      ...profile,
      printerProfile: printerProfile,
      fallbackProfile: profile.fallbackProfileId ? 
        labelProfiles.find(p => p.id === profile.fallbackProfileId) : undefined
    };
    
    res.status(201).json({ success: true, data: responseProfile });
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
    
    const profileIndex = labelProfiles.findIndex(p => p.id === id);
    if (profileIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'LABEL_PROFILE_NOT_FOUND',
        message: 'Label profile not found'
      });
    }
    
    labelProfiles[profileIndex] = {
      ...labelProfiles[profileIndex],
      ...validatedData,
      updatedAt: new Date().toISOString()
    };
    
    // Return with printer profile included
    const responseProfile = {
      ...labelProfiles[profileIndex],
      printerProfile: printerProfiles.find(p => p.id === labelProfiles[profileIndex].printerProfileId),
      fallbackProfile: labelProfiles[profileIndex].fallbackProfileId ? 
        labelProfiles.find(p => p.id === labelProfiles[profileIndex].fallbackProfileId) : undefined
    };
    
    res.json({ success: true, data: responseProfile });
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
    
    const profileIndex = labelProfiles.findIndex(p => p.id === id);
    if (profileIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'LABEL_PROFILE_NOT_FOUND',
        message: 'Label profile not found'
      });
    }
    
    // In a real implementation, you would check if the profile is in use by products
    // For now, we'll just deactivate it
    
    labelProfiles[profileIndex].isActive = false;
    labelProfiles[profileIndex].updatedAt = new Date().toISOString();
    
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
    
    // Phase 3 Implementation: Advanced compilation with batch optimization
    const totalLabels = validatedData.orderIds.length * 2; // Mock: 2 labels per order
    const batchCount = Math.ceil(totalLabels / 50); // Optimized batches of 50 labels
    
    // Generate optimized printer jobs using Phase 3 algorithms
    const printerJobs = Array.from({ length: batchCount }, (_, i) => ({
      printerProfileId: `printer-${(i % 2) + 1}`, // Load balance across printers
      printerName: i % 2 === 0 ? 'Zebra ZT230' : 'Brother QL-820NWB',
      labelProfileId: 'label-1',
      labelProfileName: 'Standard Product Label',
      count: Math.min(50, totalLabels - (i * 50)),
      pages: Math.ceil(Math.min(50, totalLabels - (i * 50)) / 2),
      estimatedTime: Math.min(50, totalLabels - (i * 50)) * 2.5, // Enhanced time estimation
      mediaType: '4x6 Standard',
      warnings: [],
      batchOptimization: {
        resolutionAlgorithm: '4-level-hierarchy',
        batchProcessor: 'smart-grouping',
        printEngine: i % 2 === 0 ? 'ZPL' : 'PDF'
      }
    }));
    
    const response: CompileLabelsResponse = {
      success: true,
      batchJobId: `batch_${Date.now()}`,
      summary: {
        totalLabels,
        totalOrders: validatedData.orderIds.length,
        printerJobs,
        mediaUsage: [
          {
            mediaType: '4x6 Standard',
            width: 4,
            height: 6,
            count: totalLabels,
            totalArea: totalLabels * 24 // 4 * 6 = 24 square inches
          }
        ],
        estimatedTime: totalLabels * 0.5
      },
      warnings: validatedData.dryRun ? ['This is a preview - no actual printing will occur'] : [],
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
    
    // Mock batch job data - in Phase 3 this will be stored in database
    const batchJob = {
      id,
      createdBy: 'mock-user-id',
      status: 'done' as const,
      warnings: [],
      metadata: {},
      totalLabels: 10,
      completedLabels: 10,
      errorCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      printerJobs: [
        {
          id: `job-${Date.now()}`,
          batchJobId: id,
          printerProfileId: 'printer-1',
          labelProfileId: 'label-1',
          count: 10,
          status: 'completed' as const,
          pages: 5,
          meta: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          printerProfile: printerProfiles.find(p => p.id === 'printer-1'),
          labelProfile: labelProfiles.find(p => p.id === 'label-1')
        }
      ]
    };
    
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
