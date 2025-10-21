import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { loadAccountContext, requireAccountContext } from '../../middleware/account-auth';
import { validateRequest } from '../../middleware/validation';
import { z } from 'zod';
import { prisma } from '../../db';
import { logger } from '../../logger';

const router = Router();

// Validation schemas
const updateNotificationsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  digestFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'NEVER'])
});

// GET /api/settings/notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Placeholder - in a real implementation, this would fetch user notification preferences
    const notifications = {
      emailNotifications: true,
      smsNotifications: false,
      digestFrequency: 'WEEKLY' as const
    };

    res.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.userId }, 'Error fetching notifications');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// PUT /api/settings/notifications
export const updateNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { emailNotifications, smsNotifications, digestFrequency } = req.body;

    // Placeholder - in a real implementation, this would update user notification preferences
    const updatedNotifications = {
      emailNotifications,
      smsNotifications,
      digestFrequency
    };

    res.json({
      success: true,
      data: updatedNotifications,
      message: 'Notification preferences updated successfully'
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.userId }, 'Error updating notifications');
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

router.get('/', getNotifications);
router.put('/', validateRequest(updateNotificationsSchema), updateNotifications);

export const notificationsRoutes = router;





























