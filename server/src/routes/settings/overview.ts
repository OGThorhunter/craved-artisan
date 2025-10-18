import { Request, Response } from 'express';
import { prisma } from '../../db';
import { logger } from '../../logger';

export const settingsOverview = async (req: Request, res: Response) => {
  try {
    const accountId = req.account!.id;
    const userId = req.user!.userId;

    // Get account with related data
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        address: true,
        billingProfile: true,
        users: {
          where: { status: 'ACTIVE' },
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
        },
        socials: true,
        documents: {
          select: {
            id: true,
            title: true,
            category: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        subscriptions: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            planName: true,
            currentPeriodEnd: true
          }
        },
        invoices: {
          select: {
            id: true,
            amountDueCents: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
          }
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Get user's role in this account
    const accountUser = await prisma.accountUser.findFirst({
      where: {
        accountId: accountId,
        userId: userId
      }
    });

    // Calculate summary statistics
    const activeUsersCount = account.users.length;
    const documentsCount = await prisma.document.count({
      where: { accountId: accountId }
    });
    const socialLinksCount = account.socials.length;
    const activeSubscriptionsCount = account.subscriptions.length;

    // Get recent audit logs
    const recentAuditLogs = await prisma.auditLog.findMany({
      where: { accountId: accountId },
      select: {
        id: true,
        action: true,
        entityType: true,
        createdAt: true,
        actor: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const overview = {
      account: {
        id: account.id,
        name: account.name,
        slug: account.slug,
        logoUrl: account.logoUrl,
        primaryEmail: account.primaryEmail,
        primaryPhone: account.primaryPhone,
        taxId: account.taxId,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
      },
      address: account.address,
      user: {
        role: accountUser?.role,
        status: accountUser?.status,
        title: accountUser?.title,
        workEmail: accountUser?.workEmail,
        workPhone: accountUser?.workPhone
      },
      statistics: {
        activeUsers: activeUsersCount,
        documents: documentsCount,
        socialLinks: socialLinksCount,
        activeSubscriptions: activeSubscriptionsCount
      },
      recentActivity: recentAuditLogs,
      billing: {
        hasBillingProfile: !!account.billingProfile,
        stripeCustomerId: account.billingProfile?.stripeCustomerId,
        activeSubscriptions: account.subscriptions,
        recentInvoices: account.invoices
      },
      recentDocuments: account.documents
    };

    res.json({
      success: true,
      data: overview
    });

  } catch (error) {
    logger.error({ error, accountId: req.account?.id }, 'Error fetching settings overview');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
























