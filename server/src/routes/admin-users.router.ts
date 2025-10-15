import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAdmin, auditAdminAction } from '../middleware/admin-auth';
import { logger } from '../logger';
import { riskScoringService } from '../services/risk-scoring';
import { stripeAdminSyncService } from '../services/stripe-admin-sync';
import { taxAdminService } from '../services/tax-admin';
import { duplicateDetectionService } from '../services/duplicate-detection';

const router = Router();
const prisma = new PrismaClient();

// ================================
// LIST & SEARCH
// ================================

/**
 * GET /api/admin/users
 * List users with advanced filtering, search, and pagination
 */
router.get('/', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    
    // Build filters
    const where: any = {};
    
    // Role filter (can be comma-separated for multiple roles)
    if (req.query.role) {
      const roles = (req.query.role as string).split(',');
      // Check if user has vendor/coordinator profile or specific roles
      where.OR = [
        { vendorProfile: { isNot: null } },
        { coordinatorProfile: { isNot: null } },
        { roles: { some: { role: { in: roles } } } }
      ];
    }
    
    // Status filter
    if (req.query.status) {
      where.status = req.query.status;
    }
    
    // Onboarding stage filter
    if (req.query.onboardingStage) {
      where.onboardingStage = req.query.onboardingStage;
    }
    
    // Email verified filter
    if (req.query.emailVerified === 'true') {
      where.emailVerified = true;
    } else if (req.query.emailVerified === 'false') {
      where.emailVerified = false;
    }
    
    // MFA enabled filter
    if (req.query.mfaEnabled === 'true') {
      where.mfaEnabled = true;
    } else if (req.query.mfaEnabled === 'false') {
      where.mfaEnabled = false;
    }
    
    // Beta tester filter
    if (req.query.betaTester === 'true') {
      where.betaTester = true;
    }
    
    // Risk score filter
    if (req.query.riskScoreMin) {
      where.riskScore = { gte: parseInt(req.query.riskScoreMin as string) };
    }
    if (req.query.riskScoreMax) {
      where.riskScore = { ...(where.riskScore || {}), lte: parseInt(req.query.riskScoreMax as string) };
    }
    
    // Date range filters
    if (req.query.createdFrom) {
      where.created_at = { gte: new Date(req.query.createdFrom as string) };
    }
    if (req.query.createdTo) {
      where.created_at = { ...(where.created_at || {}), lte: new Date(req.query.createdTo as string) };
    }
    
    if (req.query.lastActiveFrom) {
      where.lastActiveAt = { gte: new Date(req.query.lastActiveFrom as string) };
    }
    if (req.query.lastActiveTo) {
      where.lastActiveAt = { ...(where.lastActiveAt || {}), lte: new Date(req.query.lastActiveTo as string) };
    }
    
    // ZIP code filter
    if (req.query.zip) {
      where.zip_code = req.query.zip;
    }
    
    // Search query (name or email)
    if (req.query.query) {
      const searchQuery = req.query.query as string;
      where.OR = [
        { email: { contains: searchQuery } },
        { name: { contains: searchQuery } },
        { firstName: { contains: searchQuery } },
        { lastName: { contains: searchQuery } }
      ];
    }
    
    // Execute query
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          vendorProfile: {
            select: {
              id: true,
              storeName: true,
              stripeAccountId: true,
              stripeAccountStatus: true
            }
          },
          coordinatorProfile: {
            select: {
              id: true,
              organizationName: true,
              stripeAccountId: true
            }
          },
          roles: true,
          riskFlags: {
            where: { resolvedAt: null },
            select: {
              code: true,
              severity: true
            }
          },
          stripeAccount: {
            select: {
              payoutsEnabled: true,
              requirementsDue: true
            }
          },
          vacationMode: {
            select: {
              enabled: true,
              endDate: true
            }
          },
          _count: {
            select: {
              orders: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);
    
    // Calculate onboarding progress % for each user
    const usersWithMetrics = users.map(user => {
      const onboardingProgress = calculateOnboardingProgress(user);
      const stripeStatus = getStripeStatus(user);
      
      return {
        id: user.id,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
        email: user.email,
        roles: determineUserRoles(user),
        status: user.status,
        riskScore: user.riskScore,
        riskFlags: user.riskFlags.map(f => f.code),
        onboardingProgress,
        lastActiveAt: user.lastActiveAt,
        orderCount: user._count.orders,
        stripeStatus,
        vacationMode: user.vacationMode?.enabled || false,
        created_at: user.created_at,
        emailVerified: user.emailVerified,
        mfaEnabled: user.mfaEnabled
      };
    });
    
    return res.json({
      success: true,
      data: {
        users: usersWithMetrics,
        pagination: {
          page,
          limit,
          total,
          pageCount: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Admin users list error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// ================================
// USER DETAIL
// ================================

/**
 * GET /api/admin/users/:id
 * Get detailed user information
 */
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        vendorProfile: true,
        coordinatorProfile: true,
        roles: true,
        stripeAccount: true,
        taxProfile: true,
        riskFlags: {
          orderBy: { createdAt: 'desc' }
        },
        userNotes: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        userTasks: {
          where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
          orderBy: { dueDate: 'asc' }
        },
        vacationMode: true,
        sessions: {
          orderBy: { lastActiveAt: 'desc' },
          take: 10
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        securityEvents: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get role-specific analytics
    let analytics = {};
    
    if (user.vendorProfile) {
      const vendorOrders = await prisma.order.findMany({
        where: { vendorId: user.vendorProfile.id }
      });
      
      analytics = {
        gmv: vendorOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        orderCount: vendorOrders.length,
        avgOrderValue: vendorOrders.length > 0 
          ? vendorOrders.reduce((sum, o) => sum + o.totalAmount, 0) / vendorOrders.length 
          : 0,
        productCount: await prisma.product.count({
          where: { vendorProfileId: user.vendorProfile.id }
        })
      };
    }
    
    return res.json({
      success: true,
      data: {
        user,
        analytics,
        roles: determineUserRoles(user)
      }
    });
  } catch (error) {
    logger.error('Admin user detail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user details'
    });
  }
});

/**
 * GET /api/admin/users/:id/commerce
 * Get role-aware commerce data for a user
 */
router.get('/:id/commerce', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        vendorProfile: true,
        coordinatorProfile: true
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    let commerceData = {};
    
    // Customer commerce data
    const customerOrders = await prisma.order.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: {
          select: {
            storeName: true
          }
        }
      }
    });
    
    commerceData = {
      ...commerceData,
      customerOrders,
      customerStats: {
        totalOrders: customerOrders.length,
        totalSpent: customerOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        refundCount: customerOrders.filter(o => o.status === 'REFUNDED').length
      }
    };
    
    // Vendor commerce data
    if (user.vendorProfile) {
      const vendorOrders = await prisma.order.findMany({
        where: { vendorId: user.vendorProfile.id },
        orderBy: { createdAt: 'desc' }
      });
      
      commerceData = {
        ...commerceData,
        vendorOrders,
        vendorStats: {
          gmv: vendorOrders.reduce((sum, o) => sum + o.totalAmount, 0),
          orderCount: vendorOrders.length,
          disputeCount: 0 // TODO: Add dispute tracking
        }
      };
    }
    
    return res.json({
      success: true,
      data: commerceData
    });
  } catch (error) {
    logger.error('Admin user commerce error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch commerce data'
    });
  }
});

/**
 * GET /api/admin/users/:id/audit
 * Get audit trail for a user
 */
router.get('/:id/audit', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const auditLogs = await prisma.adminAudit.findMany({
      where: {
        OR: [
          { adminId: id },
          { target: { contains: id } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    return res.json({
      success: true,
      data: { auditLogs }
    });
  } catch (error) {
    logger.error('Admin user audit error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    });
  }
});

/**
 * GET /api/admin/users/:id/sessions
 * Get active sessions for a user
 */
router.get('/:id/sessions', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const sessions = await prisma.session.findMany({
      where: { userId: id },
      orderBy: { lastActiveAt: 'desc' }
    });
    
    return res.json({
      success: true,
      data: { sessions }
    });
  } catch (error) {
    logger.error('Admin user sessions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions'
    });
  }
});

// ================================
// ADMIN ACTIONS
// ================================

/**
 * POST /api/admin/users/:id/actions
 * Execute admin actions on a user
 */
router.post('/:id/actions', requireAdmin, auditAdminAction('user.action'), async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason, ...params } = req.body;
    
    const adminId = req.admin?.id || req.user?.userId;
    
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Admin ID not found'
      });
    }
    
    let result;
    
    switch (action) {
      case 'suspend':
        result = await handleSuspend(id, reason, params, adminId);
        break;
      
      case 'reinstate':
        result = await handleReinstate(id, reason, adminId);
        break;
      
      case 'resetMfa':
        result = await handleResetMfa(id, reason, adminId);
        break;
      
      case 'forceLogout':
        result = await handleForceLogout(id, reason, adminId);
        break;
      
      case 'verifyEmail':
        result = await handleVerifyEmail(id, adminId);
        break;
      
      case 'verifyPhone':
        result = await handleVerifyPhone(id, adminId);
        break;
      
      case 'updateRiskScore':
        result = await handleUpdateRiskScore(id, params.score, adminId);
        break;
      
      case 'resolveFlag':
        result = await handleResolveFlag(id, params.flagId, adminId);
        break;
      
      case 'exportData':
        result = await handleExportData(id, params.format || 'JSON');
        break;
      
      case 'anonymize':
        result = await handleAnonymize(id, adminId);
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: `Unknown action: ${action}`
        });
    }
    
    return res.json({
      success: true,
      message: `Action ${action} executed successfully`,
      data: result
    });
  } catch (error) {
    logger.error('Admin user action error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to execute action'
    });
  }
});

// Action handlers
async function handleSuspend(userId: string, reason: string, params: any, adminId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { status: 'SUSPENDED' }
  });
  
  await prisma.adminAudit.create({
    data: {
      adminId,
      action: 'SUSPEND_USER',
      target: `User:${userId}`,
      payload: { reason, ...params }
    }
  });
  
  logger.info(`[ADMIN_ACTION] Admin ${adminId} suspended user ${userId} | Reason: ${reason}`);
  
  return { suspended: true };
}

async function handleReinstate(userId: string, reason: string, adminId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { status: 'ACTIVE' }
  });
  
  await prisma.adminAudit.create({
    data: {
      adminId,
      action: 'REINSTATE_USER',
      target: `User:${userId}`,
      payload: { reason }
    }
  });
  
  logger.info(`[ADMIN_ACTION] Admin ${adminId} reinstated user ${userId} | Reason: ${reason}`);
  
  return { reinstated: true };
}

async function handleResetMfa(userId: string, reason: string, adminId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { mfaEnabled: false }
  });
  
  await prisma.adminAudit.create({
    data: {
      adminId,
      action: 'RESET_MFA',
      target: `User:${userId}`,
      payload: { reason }
    }
  });
  
  logger.info(`[ADMIN_ACTION] Admin ${adminId} reset MFA for user ${userId} | Reason: ${reason}`);
  
  return { mfaReset: true };
}

async function handleForceLogout(userId: string, reason: string, adminId: string) {
  // Delete all sessions
  await prisma.session.deleteMany({
    where: { userId }
  });
  
  await prisma.adminAudit.create({
    data: {
      adminId,
      action: 'FORCE_LOGOUT',
      target: `User:${userId}`,
      payload: { reason }
    }
  });
  
  logger.info(`[ADMIN_ACTION] Admin ${adminId} force logged out user ${userId} | Reason: ${reason}`);
  
  return { loggedOut: true };
}

async function handleVerifyEmail(userId: string, adminId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerified: true,
      emailVerifiedAt: new Date()
    }
  });
  
  await prisma.adminAudit.create({
    data: {
      adminId,
      action: 'VERIFY_EMAIL',
      target: `User:${userId}`,
      payload: { manual: true }
    }
  });
  
  logger.info(`[ADMIN_ACTION] Admin ${adminId} manually verified email for user ${userId}`);
  
  return { emailVerified: true };
}

async function handleVerifyPhone(userId: string, adminId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      phoneVerified: true,
      phoneVerifiedAt: new Date()
    }
  });
  
  await prisma.adminAudit.create({
    data: {
      adminId,
      action: 'VERIFY_PHONE',
      target: `User:${userId}`,
      payload: { manual: true }
    }
  });
  
  logger.info(`[ADMIN_ACTION] Admin ${adminId} manually verified phone for user ${userId}`);
  
  return { phoneVerified: true };
}

async function handleUpdateRiskScore(userId: string, score: number, adminId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { riskScore: score }
  });
  
  await prisma.adminAudit.create({
    data: {
      adminId,
      action: 'UPDATE_RISK_SCORE',
      target: `User:${userId}`,
      payload: { newScore: score }
    }
  });
  
  logger.info(`[ADMIN_ACTION] Admin ${adminId} updated risk score for user ${userId} to ${score}`);
  
  return { riskScore: score };
}

async function handleResolveFlag(userId: string, flagId: string, adminId: string) {
  await prisma.riskFlag.update({
    where: { id: flagId },
    data: {
      resolvedAt: new Date(),
      resolvedBy: adminId
    }
  });
  
  await prisma.adminAudit.create({
    data: {
      adminId,
      action: 'RESOLVE_RISK_FLAG',
      target: `User:${userId}`,
      payload: { flagId }
    }
  });
  
  logger.info(`[ADMIN_ACTION] Admin ${adminId} resolved risk flag ${flagId} for user ${userId}`);
  
  return { flagResolved: true };
}

async function handleExportData(userId: string, format: 'JSON' | 'CSV') {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: true,
      vendorProfile: true,
      coordinatorProfile: true,
      roles: true,
      userNotes: true,
      riskFlags: true,
      securityEvents: true
    }
  });
  
  // Redact sensitive data
  const exportData = {
    user: {
      id: user?.id,
      email: user?.email,
      name: user?.name,
      created_at: user?.created_at
    },
    orders: user?.orders.map(o => ({
      id: o.id,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt
    })),
    roles: user?.roles,
    notes: user?.userNotes.length
  };
  
  return { exportData, format };
}

async function handleAnonymize(userId: string, adminId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      email: `deleted-${userId}@anonymized.local`,
      name: '[DELETED]',
      firstName: null,
      lastName: null,
      phone: null,
      avatarUrl: null,
      status: 'SOFT_DELETED',
      deletedAt: new Date()
    }
  });
  
  await prisma.adminAudit.create({
    data: {
      adminId,
      action: 'ANONYMIZE_USER',
      target: `User:${userId}`,
      payload: { timestamp: new Date().toISOString() }
    }
  });
  
  logger.info(`[ADMIN_ACTION] Admin ${adminId} anonymized user ${userId}`);
  
  return { anonymized: true };
}

// ================================
// HELPER FUNCTIONS
// ================================

function calculateOnboardingProgress(user: any): number {
  let progress = 0;
  const steps = 5;
  
  if (user.emailVerified) progress++;
  if (user.phoneVerified) progress++;
  if (user.vendorProfile || user.coordinatorProfile) progress++;
  if (user.stripeAccount?.payoutsEnabled) progress++;
  if (user._count?.orders > 0) progress++;
  
  return Math.round((progress / steps) * 100);
}

function getStripeStatus(user: any): string {
  if (!user.vendorProfile && !user.coordinatorProfile) return 'N/A';
  if (!user.stripeAccount) return 'NOT_CREATED';
  if (user.stripeAccount.requirementsDue && JSON.parse(user.stripeAccount.requirementsDue).length > 0) return 'INCOMPLETE';
  if (user.stripeAccount.payoutsEnabled) return 'VERIFIED';
  return 'PENDING';
}

function determineUserRoles(user: any): string[] {
  const roles: string[] = [];
  
  if (user.vendorProfile) roles.push('VENDOR');
  if (user.coordinatorProfile) roles.push('EVENT_COORDINATOR');
  if (user.roles && user.roles.length > 0) {
    roles.push(...user.roles.map((r: any) => r.role));
  }
  if (roles.length === 0) roles.push('CUSTOMER');
  
  return [...new Set(roles)]; // Remove duplicates
}

// ================================
// CRUD OPERATIONS
// ================================

/**
 * PUT /api/admin/users/:id
 * Update basic user information
 */
router.put('/:id', requireAdmin, auditAdminAction('user.update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, firstName, lastName, phone, zip_code, locale, timezone } = req.body;
    
    const adminId = req.admin?.id || req.user?.userId;
    
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(name && { name }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(zip_code && { zip_code }),
        ...(locale && { locale }),
        ...(timezone && { timezone })
      }
    });
    
    logger.info(`[ADMIN_ACTION] Admin ${adminId} updated user ${id}`);
    
    return res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    logger.error('Admin user update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

/**
 * POST /api/admin/users/:id/notes
 * Add admin note to user
 */
router.post('/:id/notes', requireAdmin, auditAdminAction('user.note.create'), async (req, res) => {
  try {
    const { id } = req.params;
    const { content, visibility } = req.body;
    const adminId = req.admin?.id || req.user?.userId;
    
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Admin ID not found'
      });
    }
    
    const note = await prisma.userNote.create({
      data: {
        userId: id,
        authorId: adminId,
        content,
        visibility: visibility || 'ADMIN_ONLY'
      }
    });
    
    logger.info(`[ADMIN_ACTION] Admin ${adminId} added note to user ${id}`);
    
    return res.json({
      success: true,
      data: note
    });
  } catch (error) {
    logger.error('Admin user note creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create note'
    });
  }
});

/**
 * POST /api/admin/users/:id/tasks
 * Create task for user
 */
router.post('/:id/tasks', requireAdmin, auditAdminAction('user.task.create'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority, assignedTo } = req.body;
    
    const task = await prisma.userTask.create({
      data: {
        userId: id,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'MEDIUM',
        assignedTo
      }
    });
    
    logger.info(`[ADMIN_ACTION] Created task for user ${id}: ${title}`);
    
    return res.json({
      success: true,
      data: task
    });
  } catch (error) {
    logger.error('Admin task creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create task'
    });
  }
});

// ================================
// ROLE CONVERSION
// ================================

/**
 * POST /api/admin/users/:id/convert-role
 * Convert user role with profile creation/deletion
 */
router.post('/:id/convert-role', requireAdmin, auditAdminAction('user.role.convert'), async (req, res) => {
  try {
    const { id } = req.params;
    const { fromRole, toRole } = req.body;
    const adminId = req.admin?.id || req.user?.userId;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        vendorProfile: true,
        coordinatorProfile: true
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Handle role conversions
    if (toRole === 'VENDOR' && !user.vendorProfile) {
      // Create vendor profile
      await prisma.vendorProfile.create({
        data: {
          userId: id,
          storeName: user.name || 'New Vendor',
          slug: `vendor-${id.slice(0, 8)}-${Date.now()}`
        }
      });
      
      await prisma.userRole.create({
        data: {
          userId: id,
          role: 'VENDOR'
        }
      });
    } else if (toRole === 'EVENT_COORDINATOR' && !user.coordinatorProfile) {
      // Create coordinator profile
      await prisma.eventCoordinatorProfile.create({
        data: {
          userId: id,
          organizationName: user.name || 'New Coordinator',
          slug: `coordinator-${id.slice(0, 8)}-${Date.now()}`
        }
      });
      
      await prisma.userRole.create({
        data: {
          userId: id,
          role: 'EVENT_COORDINATOR'
        }
      });
    } else if (toRole === 'CUSTOMER') {
      // Remove vendor/coordinator roles
      await prisma.userRole.deleteMany({
        where: {
          userId: id,
          role: { in: ['VENDOR', 'EVENT_COORDINATOR'] }
        }
      });
    }
    
    await prisma.adminAudit.create({
      data: {
        adminId: adminId!,
        action: 'CONVERT_USER_ROLE',
        target: `User:${id}`,
        payload: { fromRole, toRole }
      }
    });
    
    logger.info(`[ADMIN_ACTION] Admin ${adminId} converted user ${id} from ${fromRole} to ${toRole}`);
    
    return res.json({
      success: true,
      message: `User role converted from ${fromRole} to ${toRole}`
    });
  } catch (error) {
    logger.error('Admin role conversion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to convert role'
    });
  }
});

// ================================
// STRIPE & TAX INTEGRATION
// ================================

/**
 * POST /api/admin/users/:id/stripe/sync
 * Sync Stripe account for user
 */
router.post('/:id/stripe/sync', requireAdmin, auditAdminAction('stripe.sync'), async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin?.id || req.user?.userId;
    
    const status = await stripeAdminSyncService.reSyncAccount(id, adminId!);
    
    return res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Stripe sync error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to sync Stripe account'
    });
  }
});

/**
 * POST /api/admin/users/:id/tax/sync
 * Sync tax profile for user
 */
router.post('/:id/tax/sync', requireAdmin, auditAdminAction('tax.sync'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await taxAdminService.updateTaxProfile(id);
    
    return res.json({
      success: true,
      message: 'Tax profile synced successfully'
    });
  } catch (error) {
    logger.error('Tax sync error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to sync tax profile'
    });
  }
});

/**
 * GET /api/admin/users/:id/stripe/requirements
 * Get Stripe requirements for user
 */
router.get('/:id/stripe/requirements', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const requirements = await stripeAdminSyncService.refreshRequirements(id);
    
    return res.json({
      success: true,
      data: { requirements }
    });
  } catch (error) {
    logger.error('Stripe requirements error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Stripe requirements'
    });
  }
});

// ================================
// DUPLICATE DETECTION & MERGE
// ================================

/**
 * GET /api/admin/users/:id/duplicates
 * Find potential duplicate users
 */
router.get('/:id/duplicates', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const duplicates = await duplicateDetectionService.findDuplicates(id);
    
    return res.json({
      success: true,
      data: { duplicates }
    });
  } catch (error) {
    logger.error('Duplicate detection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to find duplicates'
    });
  }
});

/**
 * POST /api/admin/users/:id/merge-preview
 * Preview merge operation
 */
router.post('/:id/merge-preview', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { duplicateId } = req.body;
    
    const preview = await duplicateDetectionService.previewMerge(id, duplicateId);
    
    return res.json({
      success: true,
      data: preview
    });
  } catch (error) {
    logger.error('Merge preview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to preview merge'
    });
  }
});

/**
 * POST /api/admin/users/:id/merge
 * Execute merge of duplicate user
 */
router.post('/:id/merge', requireAdmin, auditAdminAction('user.merge'), async (req, res) => {
  try {
    const { id } = req.params;
    const { duplicateId } = req.body;
    const adminId = req.admin?.id || req.user?.userId;
    
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Admin ID not found'
      });
    }
    
    await duplicateDetectionService.executeMerge(id, duplicateId, adminId);
    
    logger.info(`[ADMIN_ACTION] Admin ${adminId} merged user ${duplicateId} into ${id}`);
    
    return res.json({
      success: true,
      message: 'Users merged successfully'
    });
  } catch (error) {
    logger.error('Merge execution error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to merge users'
    });
  }
});

// ================================
// BULK OPERATIONS
// ================================

/**
 * POST /api/admin/users/bulk
 * Execute bulk actions on multiple users
 */
router.post('/bulk', requireAdmin, auditAdminAction('users.bulk'), async (req, res) => {
  try {
    const { userIds, action, params } = req.body;
    const adminId = req.admin?.id || req.user?.userId;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'userIds must be a non-empty array'
      });
    }
    
    let results = [];
    
    switch (action) {
      case 'suspend':
        for (const userId of userIds) {
          await prisma.user.update({
            where: { id: userId },
            data: { status: 'SUSPENDED' }
          });
        }
        results.push({ suspended: userIds.length });
        break;
      
      case 'activate':
        for (const userId of userIds) {
          await prisma.user.update({
            where: { id: userId },
            data: { status: 'ACTIVE' }
          });
        }
        results.push({ activated: userIds.length });
        break;
      
      case 'updateRiskScore':
        for (const userId of userIds) {
          await riskScoringService.updateUserRiskScore(userId);
        }
        results.push({ scoresUpdated: userIds.length });
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: `Unknown bulk action: ${action}`
        });
    }
    
    await prisma.adminAudit.create({
      data: {
        adminId: adminId!,
        action: `BULK_${action.toUpperCase()}`,
        target: `Users:${userIds.length}`,
        payload: { userIds, params }
      }
    });
    
    logger.info(`[ADMIN_ACTION] Admin ${adminId} executed bulk ${action} on ${userIds.length} users`);
    
    return res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('Bulk operation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to execute bulk operation'
    });
  }
});

export default router;

