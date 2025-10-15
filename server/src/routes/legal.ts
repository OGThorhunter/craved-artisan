import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../logger';
import type { Request, Response } from 'express';

const router = Router();
const prisma = new PrismaClient();

// Validation schema for accepting agreements
const acceptAgreementsSchema = z.object({
  agreements: z.array(z.object({
    documentId: z.string(),
    documentType: z.string(),
    documentVersion: z.string()
  })).min(1, 'At least one agreement must be accepted')
});

/**
 * GET /api/legal/documents
 * Get all active legal documents
 */
router.get('/documents', async (req: Request, res: Response) => {
  try {
    const documents = await prisma.legalDocument.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    logger.info({ count: documents.length }, 'Retrieved legal documents');

    res.json({
      success: true,
      documents
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching legal documents');
    res.status(500).json({
      success: false,
      message: 'Failed to fetch legal documents'
    });
  }
});

/**
 * GET /api/legal/documents/:type
 * Get specific document by type (returns latest active version)
 */
router.get('/documents/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    const document = await prisma.legalDocument.findFirst({
      where: {
        type: type.toUpperCase(),
        isActive: true
      },
      orderBy: {
        version: 'desc'
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    logger.info({ type, version: document.version }, 'Retrieved legal document');

    res.json({
      success: true,
      document
    });
  } catch (error) {
    logger.error({ error, type: req.params.type }, 'Error fetching legal document');
    res.status(500).json({
      success: false,
      message: 'Failed to fetch legal document'
    });
  }
});

/**
 * GET /api/legal/documents/required/:role
 * Get required documents for a specific role
 */
router.get('/documents/required/:role', async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const roleUpper = role.toUpperCase();

    // Define which documents are required for each role
    const requiredTypes = ['TOS', 'PRIVACY', 'AI_DISCLAIMER', 'DATA_LIABILITY'];
    
    if (roleUpper === 'VENDOR') {
      requiredTypes.push('VENDOR_AGREEMENT');
    } else if (roleUpper === 'EVENT_COORDINATOR' || roleUpper === 'COORDINATOR') {
      requiredTypes.push('COORDINATOR_AGREEMENT');
    }

    const documents = await prisma.legalDocument.findMany({
      where: {
        type: { in: requiredTypes },
        isActive: true
      },
      orderBy: {
        type: 'asc'
      }
    });

    // Get the latest version of each document type
    const latestDocuments = documents.reduce((acc, doc) => {
      const existing = acc.find(d => d.type === doc.type);
      if (!existing || doc.version > existing.version) {
        return [...acc.filter(d => d.type !== doc.type), doc];
      }
      return acc;
    }, [] as typeof documents);

    logger.info({ role, count: latestDocuments.length }, 'Retrieved required legal documents for role');

    res.json({
      success: true,
      documents: latestDocuments
    });
  } catch (error) {
    logger.error({ error, role: req.params.role }, 'Error fetching required legal documents');
    res.status(500).json({
      success: false,
      message: 'Failed to fetch required legal documents'
    });
  }
});

/**
 * POST /api/legal/agreements
 * Accept multiple legal agreements (batch)
 */
router.post('/agreements', async (req: Request, res: Response) => {
  try {
    // Get userId from session or request
    const userId = (req.session as any)?.userId || (req.body as any).userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Validate request body
    const validation = acceptAgreementsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors
      });
    }

    const { agreements } = validation.data;

    // Get IP address and user agent
    const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Create all agreements in a transaction
    const createdAgreements = await prisma.$transaction(
      agreements.map(agreement =>
        prisma.userAgreement.create({
          data: {
            userId,
            documentId: agreement.documentId,
            documentType: agreement.documentType,
            documentVersion: agreement.documentVersion,
            ipAddress,
            userAgent
          }
        })
      )
    );

    logger.info(
      { 
        userId, 
        agreementCount: createdAgreements.length,
        ipAddress 
      }, 
      'User accepted legal agreements'
    );

    res.json({
      success: true,
      message: 'Agreements accepted successfully',
      agreements: createdAgreements
    });
  } catch (error) {
    logger.error({ error }, 'Error accepting legal agreements');
    res.status(500).json({
      success: false,
      message: 'Failed to accept agreements'
    });
  }
});

/**
 * GET /api/legal/user-agreements
 * Get current user's accepted agreements
 */
router.get('/user-agreements', async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const agreements = await prisma.userAgreement.findMany({
      where: { userId },
      include: {
        document: {
          select: {
            id: true,
            type: true,
            version: true,
            title: true,
            isActive: true
          }
        }
      },
      orderBy: {
        acceptedAt: 'desc'
      }
    });

    logger.info({ userId, agreementCount: agreements.length }, 'Retrieved user agreements');

    res.json({
      success: true,
      agreements
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching user agreements');
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user agreements'
    });
  }
});

/**
 * GET /api/legal/check-acceptance/:userId/:role
 * Check if a user has accepted all required agreements for their role
 */
router.get('/check-acceptance/:userId/:role', async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.params;

    // Define required document types for role
    const requiredTypes = ['TOS', 'PRIVACY', 'AI_DISCLAIMER', 'DATA_LIABILITY'];
    
    if (role.toUpperCase() === 'VENDOR') {
      requiredTypes.push('VENDOR_AGREEMENT');
    } else if (role.toUpperCase() === 'EVENT_COORDINATOR' || role.toUpperCase() === 'COORDINATOR') {
      requiredTypes.push('COORDINATOR_AGREEMENT');
    }

    // Get user's accepted agreements
    const userAgreements = await prisma.userAgreement.findMany({
      where: { userId },
      select: { documentType: true }
    });

    const acceptedTypes = userAgreements.map(a => a.documentType);
    const missingTypes = requiredTypes.filter(type => !acceptedTypes.includes(type));

    const allAccepted = missingTypes.length === 0;

    res.json({
      success: true,
      allAccepted,
      acceptedTypes,
      missingTypes,
      requiredTypes
    });
  } catch (error) {
    logger.error({ error }, 'Error checking agreement acceptance');
    res.status(500).json({
      success: false,
      message: 'Failed to check agreement acceptance'
    });
  }
});

export default router;

