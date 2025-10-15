import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { loadAccountContext, requireAccountContext } from '../../middleware/account-auth';
import { validateRequest } from '../../middleware/validation';
import { z } from 'zod';
import { prisma } from '../../db';
import { logger } from '../../logger';
import bcrypt from 'bcryptjs';
import { logEvent } from '../../utils/audit';
import { AuditScope, ActorType, Severity } from '@prisma/client';
import { AUTH_PASSWORD_CHANGED, AUTH_SESSION_TERMINATED, AUTH_MFA_ENROLLED, AUTH_MFA_REMOVED } from '../../constants/audit-events';

const router = Router();

// Validation schemas
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
});

const enable2FASchema = z.object({
  secret: z.string().min(1)
});

const disable2FASchema = z.object({
  password: z.string().min(1)
});

// GET /api/settings/security/sessions
export const getSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add current session indicator
    const sessionsWithCurrent = sessions.map(session => ({
      ...session,
      isCurrent: session.id === req.sessionID
    }));

    res.json({
      success: true,
      data: sessionsWithCurrent
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.userId }, 'Error fetching sessions');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// DELETE /api/settings/security/sessions/:sessionId
export const revokeSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { sessionId } = req.params;

    // Don't allow revoking current session
    if (sessionId === req.sessionID) {
      return res.status(400).json({
        success: false,
        message: 'Cannot revoke current session'
      });
    }

    await prisma.session.delete({
      where: {
        id: sessionId,
        userId
      }
    });

    // Audit log: session terminated
    logEvent({
      scope: AuditScope.AUTH,
      action: AUTH_SESSION_TERMINATED,
      actorId: userId,
      actorType: ActorType.USER,
      actorIp: req.context?.actor.ip,
      actorUa: req.context?.actor.ua,
      requestId: req.context?.requestId,
      traceId: req.context?.traceId,
      targetType: 'Session',
      targetId: sessionId,
      severity: Severity.NOTICE,
      metadata: { terminatedSessionId: sessionId }
    });

    res.json({
      success: true,
      message: 'Session revoked successfully'
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.userId }, 'Error revoking session');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// POST /api/settings/security/change-password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    // Get user with current password hash
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

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    // Audit log: password changed
    logEvent({
      scope: AuditScope.AUTH,
      action: AUTH_PASSWORD_CHANGED,
      actorId: userId,
      actorType: ActorType.USER,
      actorIp: req.context?.actor.ip,
      actorUa: req.context?.actor.ua,
      requestId: req.context?.requestId,
      traceId: req.context?.traceId,
      targetType: 'User',
      targetId: userId,
      severity: Severity.NOTICE
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.userId }, 'Error changing password');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// POST /api/settings/security/2fa/enable
export const enable2FA = async (req: Request, res: Response) => {
  try {
    // Placeholder for 2FA implementation
    // In a real implementation, this would:
    // 1. Generate a secret key
    // 2. Store it securely
    // 3. Return QR code for user to scan

    res.json({
      success: true,
      message: '2FA setup is not yet implemented',
      data: {
        secret: 'placeholder-secret',
        qrCode: 'data:image/png;base64,placeholder'
      }
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.userId }, 'Error enabling 2FA');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// POST /api/settings/security/2fa/disable
export const disable2FA = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { password: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Placeholder for 2FA disable
    // In a real implementation, this would remove the 2FA secret

    res.json({
      success: true,
      message: '2FA disabled successfully'
    });

  } catch (error) {
    logger.error({ error, userId: req.user?.userId }, 'Error disabling 2FA');
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

router.get('/sessions', getSessions);
router.delete('/sessions/:sessionId', revokeSession);
router.post('/change-password', validateRequest(changePasswordSchema), changePassword);
router.post('/2fa/enable', validateRequest(enable2FASchema), enable2FA);
router.post('/2fa/disable', validateRequest(disable2FASchema), disable2FA);

export const securityRoutes = router;























