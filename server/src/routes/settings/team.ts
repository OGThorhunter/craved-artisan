import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { loadAccountContext, requireAccountContext, canManageTeam, preventRemoveLastOwner } from '../../middleware/account-auth';
import { validateRequest } from '../../middleware/validation';
import { z } from 'zod';
import { prisma } from '../../db';
import { logger } from '../../logger';
import { logEvent } from '../../utils/audit';
import { AuditScope, ActorType, Severity } from '@prisma/client';
import { USER_TEAM_INVITED, USER_TEAM_REMOVED, USER_ROLE_GRANTED } from '../../constants/audit-events';

const router = Router();

// Validation schemas
const inviteTeamMemberSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['ADMIN', 'STAFF', 'VIEWER']),
  workEmail: z.string().email().optional(),
  workPhone: z.string().optional()
});

const updateTeamMemberRoleSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'STAFF', 'VIEWER'])
});

const updateTeamMemberStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED'])
});

// GET /api/settings/team
export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const { page = '1', q = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limit = 20;
    const offset = (pageNum - 1) * limit;

    const where = {
      accountId: accountId,
      deletedAt: null,
      ...(q && {
        OR: [
          { user: { firstName: { contains: q as string } } },
          { user: { lastName: { contains: q as string } } },
          { user: { email: { contains: q as string } } },
          { title: { contains: q as string } },
          { workEmail: { contains: q as string } }
        ]
      })
    };

    const [teamMembers, total] = await Promise.all([
      prisma.accountUser.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatarUrl: true,
              created_at: true
            }
          }
        },
        orderBy: [
          { role: 'asc' }, // OWNER first, then ADMIN, etc.
          { createdAt: 'asc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.accountUser.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        teamMembers,
        pagination: {
          page: pageNum,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error fetching team members');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// POST /api/settings/team/invite
export const inviteTeamMember = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const { email, firstName, lastName, role, workEmail, workPhone } = req.body;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create new user with temporary password
      user = await prisma.user.create({
        data: {
          email,
          firstName: firstName || 'New',
          lastName: lastName || 'User',
          password: 'temp-password', // Should be replaced with proper password setup
          name: `${firstName || 'New'} ${lastName || 'User'}`
        }
      });
    }

    // Check if user is already in this account
    const existingAccountUser = await prisma.accountUser.findFirst({
      where: {
        accountId,
        userId: user.id,
        deletedAt: null
      }
    });

    if (existingAccountUser) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this account'
      });
    }

    // Add user to account
    const accountUser = await prisma.accountUser.create({
      data: {
        accountId,
        userId: user.id,
        role,
        workEmail,
        workPhone,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    // Audit log: team member invited
    logEvent({
      scope: AuditScope.USER,
      action: USER_TEAM_INVITED,
      actorId: req.user!.userId,
      actorType: ActorType.USER,
      actorIp: req.context?.actor.ip,
      actorUa: req.context?.actor.ua,
      requestId: req.context?.requestId,
      traceId: req.context?.traceId,
      targetType: 'AccountUser',
      targetId: accountUser.id,
      severity: Severity.NOTICE,
      metadata: { 
        invitedUserId: user.id, 
        invitedUserEmail: email,
        role,
        accountId 
      }
    });

    res.json({
      success: true,
      data: accountUser,
      message: 'Team member invited successfully'
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error inviting team member');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// PUT /api/settings/team/:accountUserId/role
export const updateTeamMemberRole = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const { accountUserId } = req.params;
    const { role } = req.body;

    // Get old role for audit diff
    const oldAccountUser = await prisma.accountUser.findUnique({
      where: { id: accountUserId },
      select: { role: true, userId: true }
    });

    const updatedAccountUser = await prisma.accountUser.update({
      where: {
        id: accountUserId,
        accountId: accountId
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    // Audit log: role change
    logEvent({
      scope: AuditScope.USER,
      action: USER_ROLE_GRANTED,
      actorId: req.user!.userId,
      actorType: ActorType.USER,
      actorIp: req.context?.actor.ip,
      actorUa: req.context?.actor.ua,
      requestId: req.context?.requestId,
      traceId: req.context?.traceId,
      targetType: 'AccountUser',
      targetId: accountUserId,
      severity: Severity.WARNING,
      diffBefore: { role: oldAccountUser?.role },
      diffAfter: { role },
      metadata: { 
        userId: oldAccountUser?.userId,
        accountId
      }
    });

    res.json({
      success: true,
      data: updatedAccountUser,
      message: 'Team member role updated successfully'
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error updating team member role');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// PUT /api/settings/team/:accountUserId/status
export const updateTeamMemberStatus = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const { accountUserId } = req.params;
    const { status } = req.body;

    const updatedAccountUser = await prisma.accountUser.update({
      where: {
        id: accountUserId,
        accountId: accountId
      },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedAccountUser,
      message: 'Team member status updated successfully'
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error updating team member status');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// DELETE /api/settings/team/:accountUserId
export const removeTeamMember = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const { accountUserId } = req.params;

    // Get account user info for audit log
    const accountUser = await prisma.accountUser.findUnique({
      where: { id: accountUserId },
      select: { userId: true, role: true }
    });

    // Soft delete the account user
    await prisma.accountUser.update({
      where: {
        id: accountUserId,
        accountId: accountId
      },
      data: { deletedAt: new Date() }
    });

    // Audit log: team member removed
    logEvent({
      scope: AuditScope.USER,
      action: USER_TEAM_REMOVED,
      actorId: req.user!.userId,
      actorType: ActorType.USER,
      actorIp: req.context?.actor.ip,
      actorUa: req.context?.actor.ua,
      requestId: req.context?.requestId,
      traceId: req.context?.traceId,
      targetType: 'AccountUser',
      targetId: accountUserId,
      severity: Severity.WARNING,
      metadata: { 
        removedUserId: accountUser?.userId,
        role: accountUser?.role,
        accountId
      }
    });

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error removing team member');
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

router.get('/', getTeamMembers);
router.post('/invite', canManageTeam, validateRequest(inviteTeamMemberSchema), inviteTeamMember);
router.put('/:accountUserId/role', canManageTeam, preventRemoveLastOwner, validateRequest(updateTeamMemberRoleSchema), updateTeamMemberRole);
router.put('/:accountUserId/status', canManageTeam, validateRequest(updateTeamMemberStatusSchema), updateTeamMemberStatus);
router.delete('/:accountUserId', canManageTeam, removeTeamMember);

export const teamRoutes = router;























