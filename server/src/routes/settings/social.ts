import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { loadAccountContext, requireAccountContext, canManageOrganization } from '../../middleware/account-auth';
import { validateRequest } from '../../middleware/validation';
import { z } from 'zod';
import { prisma } from '../../db';
import { logger } from '../../logger';

const router = Router();

// Validation schemas
const createSocialLinkSchema = z.object({
  platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'PINTEREST', 'X', 'THREADS', 'WEBSITE', 'OTHER']),
  url: z.string().url(),
  handle: z.string().optional()
});

const updateSocialLinkSchema = z.object({
  platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'PINTEREST', 'X', 'THREADS', 'WEBSITE', 'OTHER']),
  url: z.string().url(),
  handle: z.string().optional()
});

// GET /api/settings/social-links
export const getSocialLinks = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;

    const socialLinks = await prisma.socialLink.findMany({
      where: { accountId },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: socialLinks
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error fetching social links');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// POST /api/settings/social-links
export const createSocialLink = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const { platform, url, handle } = req.body;

    // Sanitize URL to prevent XSS
    const sanitizedUrl = url.replace(/javascript:/gi, '').replace(/data:/gi, '');

    const socialLink = await prisma.socialLink.create({
      data: {
        accountId,
        platform,
        url: sanitizedUrl,
        handle
      }
    });

    res.json({
      success: true,
      data: socialLink,
      message: 'Social link created successfully'
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error creating social link');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// PUT /api/settings/social-links/:id
export const updateSocialLink = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const { id } = req.params;
    const { platform, url, handle } = req.body;

    // Sanitize URL to prevent XSS
    const sanitizedUrl = url.replace(/javascript:/gi, '').replace(/data:/gi, '');

    const socialLink = await prisma.socialLink.update({
      where: {
        id,
        accountId
      },
      data: {
        platform,
        url: sanitizedUrl,
        handle
      }
    });

    res.json({
      success: true,
      data: socialLink,
      message: 'Social link updated successfully'
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error updating social link');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// DELETE /api/settings/social-links/:id
export const deleteSocialLink = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const { id } = req.params;

    await prisma.socialLink.delete({
      where: {
        id,
        accountId
      }
    });

    res.json({
      success: true,
      message: 'Social link deleted successfully'
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error deleting social link');
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

router.get('/', getSocialLinks);
router.post('/', canManageOrganization, validateRequest(createSocialLinkSchema), createSocialLink);
router.put('/:id', canManageOrganization, validateRequest(updateSocialLinkSchema), updateSocialLink);
router.delete('/:id', canManageOrganization, deleteSocialLink);

export const socialRoutes = router;





























