import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';
import { cachePromotionsData, invalidateOnMutation } from '../middleware/promotionsCache';

const router = express.Router();
const prisma = new PrismaClient();

// Apply performance optimizations
router.use(invalidateOnMutation());

// Validation schemas
const CreateTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(['social_post', 'story', 'product_showcase', 'promotion', 'event']),
  platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN', 'ALL']),
  dimensions: z.object({
    width: z.number().min(100).max(2000),
    height: z.number().min(100).max(2000)
  }),
  elements: z.array(z.any()), // Template elements as JSON
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false)
});

const UpdateTemplateSchema = CreateTemplateSchema.partial();

// Helper function to authenticate vendor
async function authenticateVendor(req: any) {
  const vendorId = req.user?.userId;
  if (!vendorId) {
    throw new Error('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { id: vendorId },
    include: { vendorProfile: true }
  });

  if (!user?.vendorProfile || user.role !== 'VENDOR') {
    throw new Error('Vendor access required');
  }

  return user.vendorProfile;
}

// GET /api/vendor/content-templates
// Get all templates available to vendor (cached for performance)
router.get('/', cachePromotionsData(10 * 60 * 1000), async (req, res) => {
  try {
    const vendor = await authenticateVendor(req);
    const { category, platform, tags, includePublic = 'true' } = req.query;

    const where: any = {
      OR: [
        { vendorProfileId: vendor.id }, // Vendor's own templates
      ]
    };

    // Include public templates if requested
    if (includePublic === 'true') {
      where.OR.push({ isPublic: true });
    }

    // Apply filters
    if (category && typeof category === 'string') {
      where.category = category.toUpperCase();
    }

    if (platform && typeof platform === 'string' && platform !== 'ALL') {
      where.OR = where.OR.map((condition: any) => ({
        ...condition,
        platform: { in: [platform.toUpperCase(), 'ALL'] }
      }));
    }

    if (tags && typeof tags === 'string') {
      const tagArray = tags.split(',');
      where.tags = {
        hasSome: tagArray
      };
    }

    const templates = await prisma.contentTemplate.findMany({
      where,
      orderBy: [
        { isPublic: 'desc' }, // Public templates first
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        platform: true,
        dimensions: true,
        elements: true,
        tags: true,
        isPublic: true,
        createdAt: true,
        vendorProfile: {
          select: {
            storeName: true
          }
        }
      }
    });

    logger.info(`Retrieved ${templates.length} content templates for vendor: ${vendor.id}`);

    res.json({
      success: true,
      data: templates.map(template => ({
        ...template,
        isOwned: template.vendorProfile ? false : true,
        creatorName: template.vendorProfile?.storeName || 'Built-in Template'
      }))
    });
    
  } catch (error) {
    logger.error('Get content templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get content templates',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/vendor/content-templates
// Create new content template
router.post('/', async (req, res) => {
  try {
    const vendor = await authenticateVendor(req);
    const templateData = CreateTemplateSchema.parse(req.body);

    const template = await prisma.contentTemplate.create({
      data: {
        vendorProfileId: vendor.id,
        name: templateData.name,
        description: templateData.description,
        category: templateData.category.toUpperCase(),
        platform: templateData.platform,
        dimensions: templateData.dimensions,
        elements: templateData.elements,
        tags: templateData.tags,
        isPublic: templateData.isPublic
      }
    });

    logger.info(`Created content template: ${template.id} for vendor: ${vendor.id}`);

    res.json({
      success: true,
      message: 'Template created successfully',
      data: template
    });
    
  } catch (error) {
    logger.error('Create content template error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create template',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/vendor/content-templates/:templateId
// Update content template
router.put('/:templateId', async (req, res) => {
  try {
    const vendor = await authenticateVendor(req);
    const { templateId } = req.params;
    const updates = UpdateTemplateSchema.parse(req.body);

    // Check if template belongs to vendor
    const existingTemplate = await prisma.contentTemplate.findFirst({
      where: {
        id: templateId,
        vendorProfileId: vendor.id
      }
    });

    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied'
      });
    }

    const updatedTemplate = await prisma.contentTemplate.update({
      where: { id: templateId },
      data: {
        ...updates,
        category: updates.category?.toUpperCase(),
        updatedAt: new Date()
      }
    });

    logger.info(`Updated content template: ${templateId} for vendor: ${vendor.id}`);

    res.json({
      success: true,
      message: 'Template updated successfully',
      data: updatedTemplate
    });
    
  } catch (error) {
    logger.error('Update content template error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update template',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/vendor/content-templates/:templateId
// Delete content template
router.delete('/:templateId', async (req, res) => {
  try {
    const vendor = await authenticateVendor(req);
    const { templateId } = req.params;

    const template = await prisma.contentTemplate.findFirst({
      where: {
        id: templateId,
        vendorProfileId: vendor.id
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied'
      });
    }

    await prisma.contentTemplate.delete({
      where: { id: templateId }
    });

    logger.info(`Deleted content template: ${templateId} for vendor: ${vendor.id}`);

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
    
  } catch (error) {
    logger.error('Delete content template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/vendor/content-templates/:templateId
// Get specific template details
router.get('/:templateId', cachePromotionsData(5 * 60 * 1000), async (req, res) => {
  try {
    const vendor = await authenticateVendor(req);
    const { templateId } = req.params;

    const template = await prisma.contentTemplate.findFirst({
      where: {
        id: templateId,
        OR: [
          { vendorProfileId: vendor.id },
          { isPublic: true }
        ]
      },
      include: {
        vendorProfile: {
          select: {
            storeName: true
          }
        }
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...template,
        isOwned: template.vendorProfileId === vendor.id,
        creatorName: template.vendorProfile?.storeName || 'Built-in Template'
      }
    });
    
  } catch (error) {
    logger.error('Get content template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get template',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/vendor/content-templates/:templateId/duplicate
// Duplicate a template (including public templates)
router.post('/:templateId/duplicate', async (req, res) => {
  try {
    const vendor = await authenticateVendor(req);
    const { templateId } = req.params;

    const originalTemplate = await prisma.contentTemplate.findFirst({
      where: {
        id: templateId,
        OR: [
          { vendorProfileId: vendor.id },
          { isPublic: true }
        ]
      }
    });

    if (!originalTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    const duplicatedTemplate = await prisma.contentTemplate.create({
      data: {
        vendorProfileId: vendor.id,
        name: `${originalTemplate.name} (Copy)`,
        description: originalTemplate.description,
        category: originalTemplate.category,
        platform: originalTemplate.platform,
        dimensions: originalTemplate.dimensions,
        elements: originalTemplate.elements,
        tags: originalTemplate.tags,
        isPublic: false // Duplicates are always private
      }
    });

    logger.info(`Duplicated template: ${templateId} -> ${duplicatedTemplate.id} for vendor: ${vendor.id}`);

    res.json({
      success: true,
      message: 'Template duplicated successfully',
      data: duplicatedTemplate
    });
    
  } catch (error) {
    logger.error('Duplicate template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate template',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/vendor/content-templates/categories
// Get available template categories (cached)
router.get('/meta/categories', cachePromotionsData(30 * 60 * 1000), async (req, res) => {
  try {
    const categories = [
      { id: 'social_post', name: 'Social Post', description: 'General social media posts' },
      { id: 'story', name: 'Story', description: 'Instagram/Facebook stories' },
      { id: 'product_showcase', name: 'Product Showcase', description: 'Product photography templates' },
      { id: 'promotion', name: 'Promotion', description: 'Sales and discount announcements' },
      { id: 'event', name: 'Event', description: 'Event announcements and invitations' }
    ];

    res.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    logger.error('Get template categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories'
    });
  }
});

export default router;
