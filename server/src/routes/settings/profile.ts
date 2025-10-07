import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { loadAccountContext, requireAccountContext } from '../../middleware/account-auth';
import { validateRequest } from '../../middleware/validation';
import { z } from 'zod';
import { prisma } from '../../db';
import { logger } from '../../logger';

const router = Router();

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional()
});

// GET /api/settings/profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.userId }, 'Error fetching user profile');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// PUT /api/settings/profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { firstName, lastName, phone, avatarUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phone,
        avatarUrl
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        updated_at: true
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.userId }, 'Error updating user profile');
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

router.get('/', getProfile);
router.put('/', validateRequest(updateProfileSchema), updateProfile);

export const profileRoutes = router;
