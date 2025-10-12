import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { loadAccountContext, requireAccountContext, requireOwner, rateLimitSensitive } from '../../middleware/account-auth';
import { validateRequest } from '../../middleware/validation';
import { z } from 'zod';
import { prisma } from '../../db';
import { logger } from '../../logger';
import bcrypt from 'bcryptjs';

const router = Router();

// Validation schemas
const transferOwnershipSchema = z.object({
  newOwnerUserId: z.string().min(1),
  currentPassword: z.string().min(1)
});

const closeAccountSchema = z.object({
  confirmationText: z.literal('DELETE MY ACCOUNT'),
  currentPassword: z.string().min(1)
});

// POST /api/settings/danger-zone/transfer-ownership
export const transferOwnership = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const userId = req.user!.userId;
    const { newOwnerUserId, currentPassword } = req.body;

    // Verify current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new owner is a member of the account
    const newOwnerAccountUser = await prisma.accountUser.findFirst({
      where: {
        accountId,
        userId: newOwnerUserId,
        status: 'ACTIVE'
      }
    });

    if (!newOwnerAccountUser) {
      return res.status(400).json({
        success: false,
        message: 'New owner must be an active member of the account'
      });
    }

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Update current owner to ADMIN
      await tx.accountUser.updateMany({
        where: {
          accountId,
          userId,
          role: 'OWNER'
        },
        data: { role: 'ADMIN' }
      });

      // Update new owner to OWNER
      await tx.accountUser.update({
        where: { id: newOwnerAccountUser.id },
        data: { role: 'OWNER' }
      });

      // Update account owner
      await tx.account.update({
        where: { id: accountId },
        data: { ownerId: newOwnerUserId }
      });
    });

    res.json({
      success: true,
      message: 'Ownership transferred successfully'
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error transferring ownership');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// POST /api/settings/danger-zone/close-account
export const closeAccount = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const userId = req.user!.userId;
    const { confirmationText, currentPassword } = req.body;

    // Verify confirmation text
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      return res.status(400).json({
        success: false,
        message: 'Confirmation text is incorrect'
      });
    }

    // Verify current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Soft delete the account
    await prisma.account.update({
      where: { id: accountId },
      data: { deletedAt: new Date() }
    });

    // Soft delete all account users
    await prisma.accountUser.updateMany({
      where: { accountId },
      data: { deletedAt: new Date() }
    });

    // Soft delete related entities
    await Promise.all([
      prisma.socialLink.deleteMany({ where: { accountId } }),
      prisma.document.deleteMany({ where: { accountId } }),
      prisma.auditLog.deleteMany({ where: { accountId } }),
      prisma.subscription.deleteMany({ where: { accountId } }),
      prisma.invoice.deleteMany({ where: { accountId } })
    ]);

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        logger.error({ err }, 'Error destroying session');
      }
    });

    res.json({
      success: true,
      message: 'Account closed successfully'
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error closing account');
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
router.use(rateLimitSensitive(300000, 3)); // 5 minutes, max 3 attempts

router.post('/transfer-ownership', requireOwner, validateRequest(transferOwnershipSchema), transferOwnership);
router.post('/close-account', requireOwner, validateRequest(closeAccountSchema), closeAccount);

export const dangerZoneRoutes = router;





















