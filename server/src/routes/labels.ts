import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/session-simple';
import { rateLimit } from 'express-rate-limit';
import { labelQueue } from '../services/labels/queue';
import { resolveLabelData } from '../services/labels/dataResolver';
import { getRenderer, RenderConfig } from '../services/labels/renderers';

const router = Router();
const prisma = new PrismaClient();

// Rate limiting for label jobs (30 requests/min per vendor)
const labelJobRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many label job requests, please try again later.',
  keyGenerator: (req) => {
    // Rate limit by vendor ID if available
    return req.session?.userId || req.ip;
  }
});

// Validation middleware
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// GET /api/labels/printers - List printer profiles
router.get('/printers', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!vendorProfile) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    // Super admin can see all printers, vendors see only their own
    const whereClause = user.role === 'ADMIN' ? {} : { vendorProfileId: vendorProfile.id };

    const printers = await prisma.printerProfile.findMany({
      where: whereClause,
      include: {
        vendorProfile: {
          select: { storeName: true }
        },
        _count: {
          select: { labelProfiles: true, labelJobs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ printers });
  } catch (error) {
    console.error('Error fetching printers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/labels/printers - Create printer profile
router.post('/printers', 
  requireAuth,
  requireRole(['VENDOR', 'ADMIN']),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('driver').isIn(['ZPL', 'BROTHER_QL', 'PDF']).withMessage('Invalid driver'),
    body('dpi').isInt({ min: 72, max: 600 }).withMessage('DPI must be between 72 and 600'),
    body('maxWidthIn').isFloat({ min: 0.5, max: 12 }).withMessage('Max width must be between 0.5 and 12 inches'),
    body('maxHeightIn').isFloat({ min: 0.5, max: 12 }).withMessage('Max height must be between 0.5 and 12 inches'),
    body('networkAddress').optional().isIP().withMessage('Network address must be a valid IP'),
    body('mediaTypes').optional().isString().withMessage('Media types must be a JSON string')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const user = req.user;
      const vendorProfile = await prisma.vendorProfile.findUnique({
        where: { userId: user.id },
        select: { id: true }
      });

      if (!vendorProfile && user.role !== 'ADMIN') {
        return res.status(404).json({ error: 'Vendor profile not found' });
      }

      const printerData = {
        ...req.body,
        vendorProfileId: vendorProfile?.id || req.body.vendorProfileId, // Admin can specify vendor
        mediaTypes: req.body.mediaTypes || '[]'
      };

      const printer = await prisma.printerProfile.create({
        data: printerData,
        include: {
          vendorProfile: {
            select: { storeName: true }
          }
        }
      });

      res.status(201).json({ printer });
    } catch (error) {
      console.error('Error creating printer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PATCH /api/labels/printers/:id - Update printer profile
router.patch('/printers/:id',
  requireAuth,
  requireRole(['VENDOR', 'ADMIN']),
  [
    param('id').isString().withMessage('Invalid printer ID'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('driver').optional().isIn(['ZPL', 'BROTHER_QL', 'PDF']).withMessage('Invalid driver'),
    body('dpi').optional().isInt({ min: 72, max: 600 }).withMessage('DPI must be between 72 and 600'),
    body('maxWidthIn').optional().isFloat({ min: 0.5, max: 12 }).withMessage('Max width must be between 0.5 and 12 inches'),
    body('maxHeightIn').optional().isFloat({ min: 0.5, max: 12 }).withMessage('Max height must be between 0.5 and 12 inches'),
    body('networkAddress').optional().isIP().withMessage('Network address must be a valid IP'),
    body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'OFFLINE']).withMessage('Invalid status')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const user = req.user;
      const printerId = req.params.id;

      // Check if printer exists and user has access
      const existingPrinter = await prisma.printerProfile.findUnique({
        where: { id: printerId },
        select: { vendorProfileId: true }
      });

      if (!existingPrinter) {
        return res.status(404).json({ error: 'Printer not found' });
      }

      if (user.role !== 'ADMIN') {
        const vendorProfile = await prisma.vendorProfile.findUnique({
          where: { userId: user.id },
          select: { id: true }
        });

        if (vendorProfile?.id !== existingPrinter.vendorProfileId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      const printer = await prisma.printerProfile.update({
        where: { id: printerId },
        data: req.body,
        include: {
          vendorProfile: {
            select: { storeName: true }
          }
        }
      });

      res.json({ printer });
    } catch (error) {
      console.error('Error updating printer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /api/labels/profiles - List label profiles
router.get('/profiles', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!vendorProfile) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    // Super admin can see all profiles, vendors see only their own
    const whereClause = user.role === 'ADMIN' ? {} : { vendorProfileId: vendorProfile.id };

    const profiles = await prisma.labelProfile.findMany({
      where: whereClause,
      include: {
        printerProfile: {
          select: { name: true, driver: true, dpi: true }
        },
        template: {
          select: { title: true, version: true, status: true }
        },
        _count: {
          select: { labelJobs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ profiles });
  } catch (error) {
    console.error('Error fetching label profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/labels/profiles - Create label profile
router.post('/profiles',
  requireAuth,
  requireRole(['VENDOR', 'ADMIN']),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('printerProfileId').isString().withMessage('Printer profile ID is required'),
    body('widthIn').isFloat({ min: 0.5, max: 12 }).withMessage('Width must be between 0.5 and 12 inches'),
    body('heightIn').isFloat({ min: 0.5, max: 12 }).withMessage('Height must be between 0.5 and 12 inches'),
    body('orientation').optional().isIn(['PORTRAIT', 'LANDSCAPE']).withMessage('Invalid orientation'),
    body('engine').optional().isIn(['ZPL', 'BROTHER_QL', 'PDF']).withMessage('Invalid engine'),
    body('copies').optional().isInt({ min: 1, max: 100 }).withMessage('Copies must be between 1 and 100')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const user = req.user;
      const vendorProfile = await prisma.vendorProfile.findUnique({
        where: { userId: user.id },
        select: { id: true }
      });

      if (!vendorProfile && user.role !== 'ADMIN') {
        return res.status(404).json({ error: 'Vendor profile not found' });
      }

      // Verify printer profile exists and user has access
      const printerProfile = await prisma.printerProfile.findUnique({
        where: { id: req.body.printerProfileId },
        select: { vendorProfileId: true, maxWidthIn: true, maxHeightIn: true }
      });

      if (!printerProfile) {
        return res.status(404).json({ error: 'Printer profile not found' });
      }

      if (user.role !== 'ADMIN' && printerProfile.vendorProfileId !== vendorProfile?.id) {
        return res.status(403).json({ error: 'Access denied to printer profile' });
      }

      // Validate dimensions against printer limits
      if (req.body.widthIn > printerProfile.maxWidthIn || req.body.heightIn > printerProfile.maxHeightIn) {
        return res.status(400).json({ error: 'Label dimensions exceed printer limits' });
      }

      const profileData = {
        ...req.body,
        vendorProfileId: vendorProfile?.id || req.body.vendorProfileId, // Admin can specify vendor
        copies: req.body.copies || 1
      };

      const profile = await prisma.labelProfile.create({
        data: profileData,
        include: {
          printerProfile: {
            select: { name: true, driver: true, dpi: true }
          },
          template: {
            select: { title: true, version: true, status: true }
          }
        }
      });

      res.status(201).json({ profile });
    } catch (error) {
      console.error('Error creating label profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PATCH /api/labels/profiles/:id - Update label profile
router.patch('/profiles/:id',
  requireAuth,
  requireRole(['VENDOR', 'ADMIN']),
  [
    param('id').isString().withMessage('Invalid profile ID'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('widthIn').optional().isFloat({ min: 0.5, max: 12 }).withMessage('Width must be between 0.5 and 12 inches'),
    body('heightIn').optional().isFloat({ min: 0.5, max: 12 }).withMessage('Height must be between 0.5 and 12 inches'),
    body('orientation').optional().isIn(['PORTRAIT', 'LANDSCAPE']).withMessage('Invalid orientation'),
    body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'DRAFT']).withMessage('Invalid status')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const user = req.user;
      const profileId = req.params.id;

      // Check if profile exists and user has access
      const existingProfile = await prisma.labelProfile.findUnique({
        where: { id: profileId },
        select: { vendorProfileId: true, printerProfile: { select: { maxWidthIn: true, maxHeightIn: true } } }
      });

      if (!existingProfile) {
        return res.status(404).json({ error: 'Label profile not found' });
      }

      if (user.role !== 'ADMIN') {
        const vendorProfile = await prisma.vendorProfile.findUnique({
          where: { userId: user.id },
          select: { id: true }
        });

        if (vendorProfile?.id !== existingProfile.vendorProfileId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      // Validate dimensions if being updated
      if (req.body.widthIn || req.body.heightIn) {
        const width = req.body.widthIn || existingProfile.printerProfile.maxWidthIn;
        const height = req.body.heightIn || existingProfile.printerProfile.maxHeightIn;
        
        if (width > existingProfile.printerProfile.maxWidthIn || height > existingProfile.printerProfile.maxHeightIn) {
          return res.status(400).json({ error: 'Label dimensions exceed printer limits' });
        }
      }

      const profile = await prisma.labelProfile.update({
        where: { id: profileId },
        data: req.body,
        include: {
          printerProfile: {
            select: { name: true, driver: true, dpi: true }
          },
          template: {
            select: { title: true, version: true, status: true }
          }
        }
      });

      res.json({ profile });
    } catch (error) {
      console.error('Error updating label profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /api/labels/templates - List templates
router.get('/templates', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!vendorProfile) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    // Super admin can see all templates, vendors see only their own + system templates
    const whereClause = user.role === 'ADMIN' 
      ? {} 
      : {
          OR: [
            { vendorProfileId: vendorProfile.id },
            { isSystem: true }
          ]
        };

    const templates = await prisma.labelTemplate.findMany({
      where: whereClause,
      include: {
        vendorProfile: {
          select: { storeName: true }
        },
        _count: {
          select: { labelProfiles: true }
        }
      },
      orderBy: [
        { isSystem: 'desc' },
        { lastPublishedAt: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/labels/templates - Create template
router.post('/templates',
  requireAuth,
  requireRole(['VENDOR', 'ADMIN']),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('schema').isString().withMessage('Schema is required'),
    body('version').optional().matches(/^\d+\.\d+\.\d+$/).withMessage('Version must be in format x.y.z')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const user = req.user;
      const vendorProfile = await prisma.vendorProfile.findUnique({
        where: { userId: user.id },
        select: { id: true }
      });

      if (!vendorProfile && user.role !== 'ADMIN') {
        return res.status(404).json({ error: 'Vendor profile not found' });
      }

      // Validate JSON schema
      try {
        JSON.parse(req.body.schema);
      } catch {
        return res.status(400).json({ error: 'Invalid JSON schema' });
      }

      const templateData = {
        ...req.body,
        vendorProfileId: vendorProfile?.id || req.body.vendorProfileId, // Admin can specify vendor
        version: req.body.version || '1.0.0'
      };

      const template = await prisma.labelTemplate.create({
        data: templateData,
        include: {
          vendorProfile: {
            select: { storeName: true }
          }
        }
      });

      res.status(201).json({ template });
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PATCH /api/labels/templates/:id/publish - Publish template
router.patch('/templates/:id/publish',
  requireAuth,
  requireRole(['VENDOR', 'ADMIN']),
  [
    param('id').isString().withMessage('Invalid template ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const user = req.user;
      const templateId = req.params.id;

      // Check if template exists and user has access
      const existingTemplate = await prisma.labelTemplate.findUnique({
        where: { id: templateId },
        select: { vendorProfileId: true, version: true }
      });

      if (!existingTemplate) {
        return res.status(404).json({ error: 'Template not found' });
      }

      if (user.role !== 'ADMIN') {
        const vendorProfile = await prisma.vendorProfile.findUnique({
          where: { userId: user.id },
          select: { id: true }
        });

        if (vendorProfile?.id !== existingTemplate.vendorProfileId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      // Bump version (simple patch version increment)
      const versionParts = existingTemplate.version.split('.');
      const patchVersion = parseInt(versionParts[2]) + 1;
      const newVersion = `${versionParts[0]}.${versionParts[1]}.${patchVersion}`;

      const template = await prisma.labelTemplate.update({
        where: { id: templateId },
        data: {
          status: 'PUBLISHED',
          lastPublishedAt: new Date(),
          version: newVersion
        },
        include: {
          vendorProfile: {
            select: { storeName: true }
          }
        }
      });

      res.json({ template });
    } catch (error) {
      console.error('Error publishing template:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/labels/jobs/preview - Preview label (no queue)
router.post('/jobs/preview',
  requireAuth,
  [
    body('source').isIn(['order', 'product', 'manual']).withMessage('Invalid source'),
    body('sourceId').notEmpty().withMessage('Source ID is required'),
    body('labelProfileId').isString().withMessage('Label profile ID is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const user = req.user;
      const { source, sourceId, labelProfileId } = req.body;

      // Verify label profile exists and user has access
      const labelProfile = await prisma.labelProfile.findUnique({
        where: { id: labelProfileId },
        include: {
          printerProfile: true,
          template: true
        }
      });

      if (!labelProfile) {
        return res.status(404).json({ error: 'Label profile not found' });
      }

      if (user.role !== 'ADMIN') {
        const vendorProfile = await prisma.vendorProfile.findUnique({
          where: { userId: user.id },
          select: { id: true }
        });

        if (vendorProfile?.id !== labelProfile.vendorProfileId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      // Resolve data
      const resolvedData = await resolveLabelData({
        source: source as 'order' | 'product' | 'manual',
        sourceId,
        vendorProfileId: labelProfile.vendorProfileId
      });

      // Generate preview
      let previewResult;
      if (labelProfile.template) {
        try {
          const templateSchema = JSON.parse(labelProfile.template.schema);
          const renderConfig: RenderConfig = {
            template: templateSchema,
            payload: resolvedData,
            dpi: labelProfile.printerProfile.dpi,
            widthIn: labelProfile.widthIn,
            heightIn: labelProfile.heightIn
          };

          const RendererClass = getRenderer(labelProfile.engine);
          const renderer = new RendererClass();
          const result = await renderer.render(renderConfig);

          // For preview, always generate PDF
          if (result.mime !== 'application/pdf') {
            const PDFRenderer = getRenderer('PDF');
            const pdfRenderer = new PDFRenderer();
            previewResult = await pdfRenderer.render(renderConfig);
          } else {
            previewResult = result;
          }

          // Save preview file
          const filename = `preview-${Date.now()}.pdf`;
          const filepath = `./static/labels/previews/${filename}`;
          
          const fs = require('fs');
          const path = require('path');
          const dir = path.dirname(filepath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          fs.writeFileSync(filepath, previewResult.buffer);
          
          res.json({
            preview: {
              type: 'application/pdf',
              url: `/static/labels/previews/${filename}`,
              width: labelProfile.widthIn,
              height: labelProfile.heightIn,
              dpi: labelProfile.printerProfile.dpi
            },
            data: resolvedData
          });
        } catch (error) {
          console.error('Preview generation error:', error);
          res.status(500).json({ error: 'Failed to generate preview' });
        }
      } else {
        res.status(400).json({ error: 'No template attached to label profile' });
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/labels/jobs - Create label job
router.post('/jobs',
  requireAuth,
  labelJobRateLimit,
  [
    body('source').isIn(['order', 'product', 'manual']).withMessage('Invalid source'),
    body('sourceId').notEmpty().withMessage('Source ID is required'),
    body('labelProfileId').isString().withMessage('Label profile ID is required'),
    body('copies').optional().isInt({ min: 1, max: 100 }).withMessage('Copies must be between 1 and 100')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const user = req.user;
      const { source, sourceId, labelProfileId, copies = 1 } = req.body;

      // Verify label profile exists and user has access
      const labelProfile = await prisma.labelProfile.findUnique({
        where: { id: labelProfileId },
        include: {
          printerProfile: true,
          template: true
        }
      });

      if (!labelProfile) {
        return res.status(404).json({ error: 'Label profile not found' });
      }

      if (user.role !== 'ADMIN') {
        const vendorProfile = await prisma.vendorProfile.findUnique({
          where: { userId: user.id },
          select: { id: true }
        });

        if (vendorProfile?.id !== labelProfile.vendorProfileId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      // Resolve data for the job
      const resolvedData = await resolveLabelData({
        source: source as 'order' | 'product' | 'manual',
        sourceId,
        vendorProfileId: labelProfile.vendorProfileId
      });

      const payload = JSON.stringify({
        source,
        sourceId,
        resolvedAt: new Date().toISOString(),
        data: resolvedData
      });

      const job = await prisma.labelJob.create({
        data: {
          vendorProfileId: labelProfile.vendorProfileId,
          printerProfileId: labelProfile.printerProfileId,
          labelProfileId,
          requestedByUserId: user.id,
          source: source.toUpperCase(),
          sourceId,
          payload,
          copies
        },
        include: {
          labelProfile: {
            select: { name: true }
          },
          printerProfile: {
            select: { name: true }
          },
          requestedBy: {
            select: { email: true, name: true }
          }
        }
      });

      // Enqueue job for processing
      await labelQueue.enqueueJob(job.id);

      res.status(201).json({ job });
    } catch (error) {
      console.error('Error creating label job:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /api/labels/jobs/:id - Get job status
router.get('/jobs/:id',
  requireAuth,
  [
    param('id').isString().withMessage('Invalid job ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const user = req.user;
      const jobId = req.params.id;

      const job = await prisma.labelJob.findUnique({
        where: { id: jobId },
        include: {
          labelProfile: {
            select: { name: true }
          },
          printerProfile: {
            select: { name: true }
          },
          requestedBy: {
            select: { email: true, name: true }
          }
        }
      });

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      // Check access permissions
      if (user.role !== 'ADMIN') {
        const vendorProfile = await prisma.vendorProfile.findUnique({
          where: { userId: user.id },
          select: { id: true }
        });

        if (vendorProfile?.id !== job.vendorProfileId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      res.json({ job });
    } catch (error) {
      console.error('Error fetching job:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/labels/jobs/:id/retry - Retry failed job
router.post('/jobs/:id/retry',
  requireAuth,
  [
    param('id').isString().withMessage('Invalid job ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const user = req.user;
      const jobId = req.params.id;

      const job = await prisma.labelJob.findUnique({
        where: { id: jobId },
        select: { vendorProfileId: true, status: true }
      });

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      // Check access permissions
      if (user.role !== 'ADMIN') {
        const vendorProfile = await prisma.vendorProfile.findUnique({
          where: { userId: user.id },
          select: { id: true }
        });

        if (vendorProfile?.id !== job.vendorProfileId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      if (job.status !== 'FAILED') {
        return res.status(400).json({ error: 'Job is not in failed state' });
      }

      const updatedJob = await prisma.labelJob.update({
        where: { id: jobId },
        data: {
          status: 'QUEUED',
          error: null
        },
        include: {
          labelProfile: {
            select: { name: true }
          },
          printerProfile: {
            select: { name: true }
          }
        }
      });

      // TODO: Re-enqueue job for processing

      res.json({ job: updatedJob });
    } catch (error) {
      console.error('Error retrying job:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/labels/jobs/:id/cancel - Cancel job
router.post('/jobs/:id/cancel',
  requireAuth,
  [
    param('id').isString().withMessage('Invalid job ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const user = req.user;
      const jobId = req.params.id;

      const job = await prisma.labelJob.findUnique({
        where: { id: jobId },
        select: { vendorProfileId: true, status: true }
      });

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      // Check access permissions
      if (user.role !== 'ADMIN') {
        const vendorProfile = await prisma.vendorProfile.findUnique({
          where: { userId: user.id },
          select: { id: true }
        });

        if (vendorProfile?.id !== job.vendorProfileId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      if (!['QUEUED', 'RENDERING'].includes(job.status)) {
        return res.status(400).json({ error: 'Job cannot be cancelled in current state' });
      }

      const updatedJob = await prisma.labelJob.update({
        where: { id: jobId },
        data: {
          status: 'CANCELLED'
        },
        include: {
          labelProfile: {
            select: { name: true }
          },
          printerProfile: {
            select: { name: true }
          }
        }
      });

      res.json({ job: updatedJob });
    } catch (error) {
      console.error('Error cancelling job:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
