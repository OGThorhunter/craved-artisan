import { Router } from 'express';
import { requireSuperAdmin, requireStaffAdmin, auditAdminAction } from '../middleware/admin-auth';
import { settingsService } from '../services/settings.service';
import { integrationsStatusService } from '../services/integrations-status.service';
import { s3UploadService } from '../services/s3-upload.service';
import { maintenanceModeService } from '../services/maintenance-mode.service';
import { redisCacheService } from '../services/redis-cache.service';
import { ConfigCategory, ComplianceDocType } from '@prisma/client';
import { logger } from '../logger';
import { z } from 'zod';
import multer from 'multer';
import { prisma } from '../lib/prisma';

const router = Router();
// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Validation schemas
const updateSettingSchema = z.object({
  value: z.any(),
  reason: z.string().min(10, 'Reason must be at least 10 characters')
});

const bulkUpdateSchema = z.object({
  updates: z.array(z.object({
    key: z.string(),
    value: z.any()
  })),
  reason: z.string().min(10)
});

const maintenanceModeSchema = z.object({
  enabled: z.boolean(),
  type: z.enum(['GLOBAL_READONLY', 'VENDOR_READONLY', 'QUEUE_DRAIN']),
  reason: z.string().min(10)
});

const clearCacheSchema = z.object({
  namespace: z.string(),
  reason: z.string().min(10)
});

const testNotificationSchema = z.object({
  type: z.enum(['EMAIL', 'SMS']),
  recipient: z.string()
});

// ================================
// READ SETTINGS
// ================================

// GET /api/admin/settings - Get all settings
router.get('/settings', requireStaffAdmin, async (req, res) => {
  try {
    const settings = await settingsService.getAllSettings();
    
    return res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error({ error }, 'Failed to get all settings');
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings'
    });
  }
});

// GET /api/admin/settings/:category - Get settings by category
router.get('/settings/:category', requireStaffAdmin, async (req, res) => {
  try {
    const { category } = req.params;
    
    // Validate category
    if (!Object.values(ConfigCategory).includes(category as ConfigCategory)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }
    
    const settings = await settingsService.getSettingsByCategory(category as ConfigCategory);
    
    return res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error({ error, category: req.params.category }, 'Failed to get settings by category');
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings'
    });
  }
});

// GET /api/admin/settings/key/:key - Get single setting
router.get('/settings/key/:key', requireStaffAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await settingsService.getSetting(key);
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }
    
    return res.json({
      success: true,
      data: setting
    });
  } catch (error) {
    logger.error({ error, key: req.params.key }, 'Failed to get setting');
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve setting'
    });
  }
});

// GET /api/admin/settings/public - Get public settings
router.get('/settings/public', async (req, res) => {
  try {
    const settings = await settingsService.getPublicSettings();
    
    return res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error({ error }, 'Failed to get public settings');
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve public settings'
    });
  }
});

// ================================
// UPDATE SETTINGS
// ================================

// PATCH /api/admin/settings/:key - Update single setting
router.patch('/settings/:key', requireSuperAdmin, auditAdminAction('CONFIG_SETTING_UPDATED'), async (req, res) => {
  try {
    const { key } = req.params;
    const { value, reason } = updateSettingSchema.parse(req.body);
    
    const setting = await settingsService.updateSetting(
      key,
      value,
      req.admin!.id,
      reason
    );
    
    logger.info({ key, updatedBy: req.admin!.id }, 'Setting updated');
    
    return res.json({
      success: true,
      data: setting
    });
  } catch (error) {
    logger.error({ error, key: req.params.key }, 'Failed to update setting');
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to update setting'
    });
  }
});

// POST /api/admin/settings/bulk - Bulk update settings
router.post('/settings/bulk', requireSuperAdmin, auditAdminAction('CONFIG_BULK_UPDATE'), async (req, res) => {
  try {
    const { updates, reason } = bulkUpdateSchema.parse(req.body);
    
    const results = await settingsService.bulkUpdateSettings(
      updates,
      req.admin!.id,
      reason
    );
    
    logger.info({ count: updates.length, updatedBy: req.admin!.id }, 'Bulk settings update completed');
    
    return res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error({ error }, 'Failed to bulk update settings');
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to bulk update settings'
    });
  }
});

// ================================
// CRITICAL ACTIONS
// ================================

// POST /api/admin/settings/maintenance-mode - Toggle maintenance mode
router.post('/settings/maintenance-mode', requireSuperAdmin, auditAdminAction('CONFIG_MAINTENANCE_MODE_CHANGED'), async (req, res) => {
  try {
    const { enabled, type, reason } = maintenanceModeSchema.parse(req.body);
    
    let result;
    switch (type) {
      case 'GLOBAL_READONLY':
        result = await maintenanceModeService.toggleGlobalReadonly(enabled, reason, req.admin!.id);
        break;
      case 'VENDOR_READONLY':
        result = await maintenanceModeService.toggleVendorReadonly(enabled, reason, req.admin!.id);
        break;
      case 'QUEUE_DRAIN':
        result = await maintenanceModeService.toggleQueueDrain(enabled, reason, req.admin!.id);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid maintenance type'
        });
    }
    
    logger.warn({ type, enabled, reason, adminId: req.admin!.id }, 'Maintenance mode toggled');
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error({ error }, 'Failed to toggle maintenance mode');
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle maintenance mode'
    });
  }
});

// POST /api/admin/settings/clear-cache - Clear cache namespace
router.post('/settings/clear-cache', requireSuperAdmin, auditAdminAction('CONFIG_CACHE_CLEARED'), async (req, res) => {
  try {
    const { namespace, reason } = clearCacheSchema.parse(req.body);
    
    const deleted = await redisCacheService.flushNamespace(namespace, reason);
    
    logger.warn({ namespace, deleted, reason, adminId: req.admin!.id }, 'Cache namespace cleared');
    
    return res.json({
      success: true,
      data: { deleted, namespace }
    });
  } catch (error) {
    logger.error({ error }, 'Failed to clear cache');
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to clear cache'
    });
  }
});

// POST /api/admin/settings/test-notification - Send test notification
router.post('/settings/test-notification', requireSuperAdmin, async (req, res) => {
  try {
    const { type, recipient } = testNotificationSchema.parse(req.body);
    
    if (type === 'EMAIL') {
      // TODO: Implement email test when SendGrid is set up
      logger.info({ recipient, type }, 'Test email would be sent');
      return res.json({
        success: true,
        message: 'Email test feature coming soon',
        data: { type, recipient }
      });
    } else if (type === 'SMS') {
      // TODO: Implement SMS test when Twilio is fully set up
      logger.info({ recipient, type }, 'Test SMS would be sent');
      return res.json({
        success: true,
        message: 'SMS test feature coming soon',
        data: { type, recipient }
      });
    }
    
    return res.status(400).json({
      success: false,
      message: 'Invalid notification type'
    });
  } catch (error) {
    logger.error({ error }, 'Failed to send test notification');
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to send test notification'
    });
  }
});

// ================================
// INTEGRATION HEALTH
// ================================

// GET /api/admin/settings/integrations/status - Get all integration statuses
router.get('/settings/integrations/status', requireStaffAdmin, async (req, res) => {
  try {
    const statuses = await integrationsStatusService.getAllStatuses();
    
    return res.json({
      success: true,
      data: statuses
    });
  } catch (error) {
    logger.error({ error }, 'Failed to get integration statuses');
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve integration statuses'
    });
  }
});

// POST /api/admin/settings/integrations/:service/test - Test specific integration
router.post('/settings/integrations/:service/test', requireSuperAdmin, async (req, res) => {
  try {
    const { service } = req.params;
    const status = await integrationsStatusService.testIntegration(service);
    
    logger.info({ service, status: status.status }, 'Integration test completed');
    
    return res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error({ error, service: req.params.service }, 'Failed to test integration');
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to test integration'
    });
  }
});

// GET /api/admin/settings/integrations/s3/status - Get S3 status
router.get('/settings/integrations/s3/status', requireStaffAdmin, async (req, res) => {
  try {
    const status = s3UploadService.getStatus();
    
    return res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error({ error }, 'Failed to get S3 status');
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve S3 status'
    });
  }
});

// ================================
// COMPLIANCE DOCUMENTS
// ================================

// GET /api/admin/settings/compliance/documents - List compliance documents
router.get('/settings/compliance/documents', requireStaffAdmin, async (req, res) => {
  try {
    const documents = await prisma.complianceDocument.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });
    
    return res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    logger.error({ error }, 'Failed to list compliance documents');
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve compliance documents'
    });
  }
});

// POST /api/admin/settings/compliance/documents - Upload compliance document
router.post(
  '/settings/compliance/documents',
  requireSuperAdmin,
  upload.single('file'),
  auditAdminAction('CONFIG_COMPLIANCE_DOC_UPLOADED'),
  async (req, res) => {
    try {
      const { type, title, version, expiresAt } = req.body;
      const file = req.file;
      
      // Validate document type
      if (!Object.values(ComplianceDocType).includes(type as ComplianceDocType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid document type'
        });
      }
      
      // Upload to S3 (with graceful fallback)
      let fileUrl = null;
      let warning = null;
      
      if (file) {
        const uploadResult = await s3UploadService.uploadComplianceDoc(file, type);
        fileUrl = uploadResult.fileUrl || null;
        warning = uploadResult.warning || uploadResult.error || null;
      }
      
      // Save document metadata
      const document = await prisma.complianceDocument.create({
        data: {
          type: type as ComplianceDocType,
          title,
          fileUrl,
          fileName: file?.originalname,
          fileSize: file?.size,
          version,
          uploadedBy: req.admin!.id,
          uploadedAt: new Date(),
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          metadata: {
            mimetype: file?.mimetype,
            originalName: file?.originalname
          }
        }
      });
      
      logger.info({
        documentId: document.id,
        type,
        uploadedBy: req.admin!.id,
        fileUploaded: !!fileUrl
      }, 'Compliance document created');
      
      return res.json({
        success: true,
        data: document,
        warning
      });
    } catch (error) {
      logger.error({ error }, 'Failed to upload compliance document');
      return res.status(500).json({
        success: false,
        message: 'Failed to upload compliance document'
      });
    }
  }
);

// DELETE /api/admin/settings/compliance/documents/:id - Delete compliance document
router.delete(
  '/settings/compliance/documents/:id',
  requireSuperAdmin,
  auditAdminAction('CONFIG_COMPLIANCE_DOC_DELETED'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get document
      const document = await prisma.complianceDocument.findUnique({
        where: { id }
      });
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }
      
      // Delete from S3 if exists
      if (document.fileUrl) {
        await s3UploadService.deleteComplianceDoc(document.fileUrl);
      }
      
      // Delete from database
      await prisma.complianceDocument.delete({
        where: { id }
      });
      
      logger.info({ documentId: id, deletedBy: req.admin!.id }, 'Compliance document deleted');
      
      return res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      logger.error({ error, documentId: req.params.id }, 'Failed to delete compliance document');
      return res.status(500).json({
        success: false,
        message: 'Failed to delete compliance document'
      });
    }
  }
);

export default router;

