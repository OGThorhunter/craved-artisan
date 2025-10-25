import { Router } from 'express';
import { requireAdmin, auditAdminAction } from '../middleware/admin-auth';
import { securityComplianceService } from '../services/security-compliance';
import { z } from 'zod';

const router = Router();

// Validation schemas
const ASVSChecklistSchema = z.object({
  category: z.enum(['authentication', 'session_management', 'access_control', 'input_validation', 'output_encoding', 'cryptography', 'error_handling', 'data_protection', 'communications', 'malicious_controls', 'business_logic', 'files_resources', 'api', 'configuration']).optional(),
  level: z.enum(['L1', 'L2', 'L3']).optional(),
  status: z.enum(['compliant', 'non_compliant', 'not_applicable', 'under_review']).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20)
});

const SecretsInventorySchema = z.object({
  type: z.enum(['api_key', 'database_password', 'jwt_secret', 'encryption_key', 'oauth_token', 'ssh_key', 'certificate', 'other']).optional(),
  environment: z.enum(['development', 'staging', 'production']).optional(),
  status: z.enum(['active', 'expired', 'compromised', 'deprecated']).optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20)
});

const IncidentsSchema = z.object({
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['open', 'investigating', 'resolved', 'closed']).optional(),
  category: z.enum(['security', 'performance', 'availability', 'data_loss', 'compliance', 'other']).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20)
});

const RunbooksSchema = z.object({
  category: z.enum(['incident_response', 'maintenance', 'deployment', 'security', 'backup', 'monitoring', 'other']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20)
});

const ASVSUpdateSchema = z.object({
  status: z.enum(['compliant', 'non_compliant', 'not_applicable', 'under_review']),
  evidence: z.string().optional(),
  notes: z.string().optional()
});

const IncidentUpdateSchema = z.object({
  status: z.enum(['open', 'investigating', 'resolved', 'closed']),
  resolution: z.string().optional()
});

// GET /api/admin/security-compliance/asvs - Get ASVS checklist
router.get('/security-compliance/asvs', requireAdmin, async (req, res) => {
  try {
    const filters = ASVSChecklistSchema.parse(req.query);
    const result = await securityComplianceService.getASVSChecklist(filters);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('ASVS checklist error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      error: (error as Error).message
    });
  }
});

// PUT /api/admin/security-compliance/asvs/:id - Update ASVS compliance status
router.put('/security-compliance/asvs/:id', requireAdmin, auditAdminAction('security-compliance.asvs.update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, evidence, notes } = ASVSUpdateSchema.parse(req.body);
    const checkedBy = req.user?.userId || 'unknown';
    
    const success = await securityComplianceService.updateASVSStatus(id, status, evidence, notes, checkedBy);
    
    if (success) {
      return res.json({
        success: true,
        message: 'ASVS compliance status updated successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to update ASVS compliance status'
      });
    }
  } catch (error) {
    console.error('Update ASVS status error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid update data',
      error: (error as Error).message
    });
  }
});

// GET /api/admin/security-compliance/secrets - Get secrets inventory
router.get('/security-compliance/secrets', requireAdmin, async (req, res) => {
  try {
    const filters = SecretsInventorySchema.parse(req.query);
    const result = await securityComplianceService.getSecretsInventory(filters);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Secrets inventory error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      error: (error as Error).message
    });
  }
});

// POST /api/admin/security-compliance/secrets/:id/rotate - Rotate secret
router.post('/security-compliance/secrets/:id/rotate', requireAdmin, auditAdminAction('security-compliance.secret.rotate'), async (req, res) => {
  try {
    const { id } = req.params;
    const rotatedBy = req.user?.userId || 'unknown';
    
    const success = await securityComplianceService.rotateSecret(id, rotatedBy);
    
    if (success) {
      return res.json({
        success: true,
        message: 'Secret rotated successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to rotate secret'
      });
    }
  } catch (error) {
    console.error('Rotate secret error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to rotate secret'
    });
  }
});

// GET /api/admin/security-compliance/incidents - Get incidents
router.get('/security-compliance/incidents', requireAdmin, async (req, res) => {
  try {
    const filters = IncidentsSchema.parse(req.query);
    const result = await securityComplianceService.getIncidents(filters);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Incidents error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      error: (error as Error).message
    });
  }
});

// PUT /api/admin/security-compliance/incidents/:id - Update incident status
router.put('/security-compliance/incidents/:id', requireAdmin, auditAdminAction('security-compliance.incident.update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = IncidentUpdateSchema.parse(req.body);
    const updatedBy = req.user?.userId || 'unknown';
    
    const success = await securityComplianceService.updateIncidentStatus(id, status, resolution, updatedBy);
    
    if (success) {
      return res.json({
        success: true,
        message: 'Incident status updated successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to update incident status'
      });
    }
  } catch (error) {
    console.error('Update incident status error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid update data',
      error: (error as Error).message
    });
  }
});

// GET /api/admin/security-compliance/runbooks - Get runbooks
router.get('/security-compliance/runbooks', requireAdmin, async (req, res) => {
  try {
    const filters = RunbooksSchema.parse(req.query);
    const result = await securityComplianceService.getRunbooks(filters);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Runbooks error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      error: (error as Error).message
    });
  }
});

// POST /api/admin/security-compliance/runbooks/:id/execute - Execute runbook
router.post('/security-compliance/runbooks/:id/execute', requireAdmin, auditAdminAction('security-compliance.runbook.execute'), async (req, res) => {
  try {
    const { id } = req.params;
    const executedBy = req.user?.userId || 'unknown';
    
    const success = await securityComplianceService.executeRunbook(id, executedBy);
    
    if (success) {
      return res.json({
        success: true,
        message: 'Runbook executed successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to execute runbook'
      });
    }
  } catch (error) {
    console.error('Execute runbook error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to execute runbook'
    });
  }
});

// GET /api/admin/security-compliance/metrics - Get security metrics
router.get('/security-compliance/metrics', requireAdmin, async (req, res) => {
  try {
    const metrics = await securityComplianceService.getSecurityMetrics();
    
    return res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Security metrics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch security metrics'
    });
  }
});

export default router;

































