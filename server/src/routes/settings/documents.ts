import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { loadAccountContext, requireAccountContext, canManageOrganization } from '../../middleware/account-auth';
import { validateRequest } from '../../middleware/validation';
import { z } from 'zod';
import { prisma } from '../../db';
import { logger } from '../../logger';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, PNG, JPG, JPEG, and WEBP files are allowed.'));
    }
  }
});

// Validation schemas
const updateDocumentSchema = z.object({
  title: z.string().min(1).max(100),
  category: z.enum(['CONTRACT', 'POLICY', 'LICENSE', 'INSURANCE', 'MISC']),
  signedAt: z.string().datetime().optional()
});

// GET /api/settings/documents
export const getDocuments = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const { category } = req.query;

    const where: any = { accountId };
    if (category) {
      where.category = category;
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: documents
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error fetching documents');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// POST /api/settings/documents
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const userId = req.user!.userId;
    const { title, category } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const document = await prisma.document.create({
      data: {
        accountId,
        title,
        category,
        storageKey: file.path,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        uploadedBy: userId
      }
    });

    res.json({
      success: true,
      data: document,
      message: 'Document uploaded successfully'
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error uploading document');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// PUT /api/settings/documents/:id
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const { id } = req.params;
    const { title, category, signedAt } = req.body;

    const document = await prisma.document.update({
      where: {
        id,
        accountId
      },
      data: {
        title,
        category,
        signedAt: signedAt ? new Date(signedAt) : null
      }
    });

    res.json({
      success: true,
      data: document,
      message: 'Document updated successfully'
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error updating document');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// DELETE /api/settings/documents/:id
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const { id } = req.params;

    const document = await prisma.document.delete({
      where: {
        id,
        accountId
      }
    });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error deleting document');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Apply middleware and routes
router.use(requireAuth);
router.use(loadAccountContext);
router.use(requireAccountContext);

router.get('/', getDocuments);
router.post('/', canManageOrganization, upload.single('file'), uploadDocument);
router.put('/:id', canManageOrganization, validateRequest(updateDocumentSchema), updateDocument);
router.delete('/:id', canManageOrganization, deleteDocument);

export const documentsRoutes = router;

























