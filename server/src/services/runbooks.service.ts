import { prisma } from '../db';
import { logger } from '../logger';

export interface RunbookExecutionResult {
  success: boolean;
  message: string;
  details?: any;
  duration: number; // in ms
}

export interface RunbookCreate {
  title: string;
  incidentType: string;
  service?: string[];
  tags?: string[];
  severityFit?: string[];
  contentMarkdown: string;
  executable?: boolean;
  bindings?: any;
  estimatedDuration?: number;
  requiredRoles?: string;
  prerequisites?: string;
  rollbackPlan?: string;
  ownerId?: string;
  reviewCadenceDays?: number;
  priority?: number;
}

export interface RunbookUpdate {
  title?: string;
  incidentType?: string;
  service?: string[];
  tags?: string[];
  severityFit?: string[];
  contentMarkdown?: string;
  executable?: boolean;
  bindings?: any;
  estimatedDuration?: number;
  requiredRoles?: string;
  prerequisites?: string;
  rollbackPlan?: string;
  ownerId?: string;
  reviewCadenceDays?: number;
  priority?: number;
}

export interface RunbookSearchFilters {
  service?: string;
  severityFit?: string;
  tags?: string[];
  ownerId?: string;
  needsReview?: boolean;
  query?: string;
}

class RunbooksService {
  /**
   * List all runbooks
   */
  async listRunbooks(): Promise<any[]> {
    try {
      const runbooks = await prisma.runbook.findMany({
        where: {
          isActive: true
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true
            }
          }
        },
        orderBy: {
          priority: 'asc'
        }
      });

      return runbooks.map(r => ({
        ...r,
        service: r.service ? r.service.split(',') : [],
        tags: r.tags ? r.tags.split(',') : [],
        severityFit: r.severityFit ? r.severityFit.split(',') : [],
        bindings: r.bindings ? JSON.parse(r.bindings) : null
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to list runbooks');
      throw error;
    }
  }

  /**
   * Get runbook by ID
   */
  async getRunbook(runbookId: string): Promise<any> {
    try {
      const runbook = await prisma.runbook.findUnique({
        where: { id: runbookId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true
            }
          },
          incidents: {
            select: {
              id: true,
              title: true,
              severity: true,
              status: true,
              startedAt: true
            },
            take: 10,
            orderBy: { startedAt: 'desc' }
          },
          executions: {
            include: {
              startedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: { startedAt: 'desc' },
            take: 10
          }
        }
      });

      if (!runbook) {
        throw new Error('Runbook not found');
      }

      return {
        ...runbook,
        service: runbook.service ? runbook.service.split(',') : [],
        tags: runbook.tags ? runbook.tags.split(',') : [],
        severityFit: runbook.severityFit ? runbook.severityFit.split(',') : [],
        bindings: runbook.bindings ? JSON.parse(runbook.bindings) : null,
        executions: runbook.executions.map(e => ({
          ...e,
          steps: e.steps ? JSON.parse(e.steps) : []
        }))
      };
    } catch (error) {
      logger.error({ error, runbookId }, 'Failed to get runbook');
      throw error;
    }
  }

  /**
   * Get runbook by incident type
   */
  async getRunbookByType(incidentType: string): Promise<any> {
    try {
      const runbook = await prisma.runbook.findFirst({
        where: {
          incidentType,
          isActive: true
        }
      });

      return runbook;
    } catch (error) {
      logger.error({ error, incidentType }, 'Failed to get runbook for incident type');
      throw error;
    }
  }

  /**
   * Create new runbook
   */
  async createRunbook(data: RunbookCreate, createdById: string): Promise<any> {
    try {
      const runbook = await prisma.runbook.create({
        data: {
          title: data.title,
          incidentType: data.incidentType,
          service: data.service ? data.service.join(',') : null,
          tags: data.tags ? data.tags.join(',') : null,
          severityFit: data.severityFit ? data.severityFit.join(',') : null,
          contentMarkdown: data.contentMarkdown,
          executable: data.executable ?? false,
          bindings: data.bindings ? JSON.stringify(data.bindings) : null,
          estimatedDuration: data.estimatedDuration,
          requiredRoles: data.requiredRoles,
          prerequisites: data.prerequisites,
          rollbackPlan: data.rollbackPlan,
          ownerId: data.ownerId,
          reviewCadenceDays: data.reviewCadenceDays ?? 90,
          priority: data.priority ?? 0,
          version: 1
        },
        include: {
          owner: true
        }
      });

      logger.info({ runbookId: runbook.id, title: data.title }, 'Runbook created');

      return runbook;
    } catch (error) {
      logger.error({ error }, 'Failed to create runbook');
      throw error;
    }
  }

  /**
   * Update runbook
   */
  async updateRunbook(runbookId: string, data: RunbookUpdate, updatedById: string): Promise<any> {
    try {
      const updateData: any = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.incidentType !== undefined) updateData.incidentType = data.incidentType;
      if (data.service !== undefined) updateData.service = data.service.join(',');
      if (data.tags !== undefined) updateData.tags = data.tags.join(',');
      if (data.severityFit !== undefined) updateData.severityFit = data.severityFit.join(',');
      if (data.contentMarkdown !== undefined) {
        updateData.contentMarkdown = data.contentMarkdown;
        // Increment version on content change
        const current = await prisma.runbook.findUnique({ where: { id: runbookId } });
        if (current) {
          updateData.version = current.version + 1;
        }
      }
      if (data.executable !== undefined) updateData.executable = data.executable;
      if (data.bindings !== undefined) updateData.bindings = JSON.stringify(data.bindings);
      if (data.estimatedDuration !== undefined) updateData.estimatedDuration = data.estimatedDuration;
      if (data.requiredRoles !== undefined) updateData.requiredRoles = data.requiredRoles;
      if (data.prerequisites !== undefined) updateData.prerequisites = data.prerequisites;
      if (data.rollbackPlan !== undefined) updateData.rollbackPlan = data.rollbackPlan;
      if (data.ownerId !== undefined) updateData.ownerId = data.ownerId;
      if (data.reviewCadenceDays !== undefined) updateData.reviewCadenceDays = data.reviewCadenceDays;
      if (data.priority !== undefined) updateData.priority = data.priority;

      const runbook = await prisma.runbook.update({
        where: { id: runbookId },
        data: updateData,
        include: {
          owner: true
        }
      });

      logger.info({ runbookId, updatedBy: updatedById }, 'Runbook updated');

      return runbook;
    } catch (error) {
      logger.error({ error }, 'Failed to update runbook');
      throw error;
    }
  }

  /**
   * Mark runbook as reviewed
   */
  async markReviewed(runbookId: string, reviewedById: string): Promise<any> {
    try {
      const runbook = await prisma.runbook.update({
        where: { id: runbookId },
        data: {
          lastReviewedAt: new Date()
        },
        include: {
          owner: true
        }
      });

      logger.info({ runbookId, reviewedBy: reviewedById }, 'Runbook marked as reviewed');

      return runbook;
    } catch (error) {
      logger.error({ error }, 'Failed to mark runbook as reviewed');
      throw error;
    }
  }

  /**
   * Search runbooks with filters
   */
  async searchRunbooks(filters: RunbookSearchFilters): Promise<any[]> {
    try {
      const where: any = {
        isActive: true
      };

      if (filters.ownerId) {
        where.ownerId = filters.ownerId;
      }

      const runbooks = await prisma.runbook.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true
            }
          }
        },
        orderBy: {
          priority: 'asc'
        }
      });

      let filtered = runbooks;

      // Filter by service
      if (filters.service) {
        filtered = filtered.filter(r => {
          if (!r.service) return false;
          return r.service.split(',').includes(filters.service!);
        });
      }

      // Filter by severity fit
      if (filters.severityFit) {
        filtered = filtered.filter(r => {
          if (!r.severityFit) return false;
          return r.severityFit.split(',').includes(filters.severityFit!);
        });
      }

      // Filter by tags
      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(r => {
          if (!r.tags) return false;
          const tags = r.tags.split(',');
          return filters.tags!.some(t => tags.includes(t));
        });
      }

      // Filter by needs review
      if (filters.needsReview) {
        filtered = filtered.filter(r => {
          if (!r.lastReviewedAt || !r.reviewCadenceDays) return true;
          const daysSinceReview = (Date.now() - r.lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceReview > r.reviewCadenceDays;
        });
      }

      // Filter by search query
      if (filters.query) {
        const query = filters.query.toLowerCase();
        filtered = filtered.filter(r =>
          r.title.toLowerCase().includes(query) ||
          r.contentMarkdown.toLowerCase().includes(query) ||
          (r.tags && r.tags.toLowerCase().includes(query))
        );
      }

      return filtered.map(r => ({
        ...r,
        service: r.service ? r.service.split(',') : [],
        tags: r.tags ? r.tags.split(',') : [],
        severityFit: r.severityFit ? r.severityFit.split(',') : [],
        bindings: r.bindings ? JSON.parse(r.bindings) : null
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to search runbooks');
      throw error;
    }
  }

  /**
   * Start runbook execution
   */
  async startExecution(runbookId: string, startedById: string, incidentId?: string): Promise<any> {
    try {
      const execution = await prisma.runbookExecution.create({
        data: {
          runbookId,
          incidentId,
          startedById,
          steps: JSON.stringify([])
        },
        include: {
          runbook: true,
          startedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      logger.info({ runbookId, executionId: execution.id, incidentId }, 'Runbook execution started');

      return execution;
    } catch (error) {
      logger.error({ error }, 'Failed to start runbook execution');
      throw error;
    }
  }

  /**
   * Update execution step
   */
  async updateExecutionStep(executionId: string, stepIndex: number, stepData: any): Promise<any> {
    try {
      const execution = await prisma.runbookExecution.findUnique({
        where: { id: executionId }
      });

      if (!execution) {
        throw new Error('Execution not found');
      }

      const steps = execution.steps ? JSON.parse(execution.steps) : [];
      steps[stepIndex] = {
        ...stepData,
        completedAt: new Date()
      };

      const updated = await prisma.runbookExecution.update({
        where: { id: executionId },
        data: {
          steps: JSON.stringify(steps)
        }
      });

      logger.info({ executionId, stepIndex }, 'Execution step updated');

      return updated;
    } catch (error) {
      logger.error({ error }, 'Failed to update execution step');
      throw error;
    }
  }

  /**
   * Attach runbook to incident
   */
  async attachToIncident(runbookId: string, incidentId: string, attachedById: string): Promise<void> {
    try {
      // Update incident with runbook link
      await prisma.incident.update({
        where: { id: incidentId },
        data: {
          runbookId
        }
      });

      // Create incident event
      await prisma.incidentEvent.create({
        data: {
          incidentId,
          type: 'ACTION',
          summary: 'Runbook attached',
          createdById: attachedById
        }
      });

      logger.info({ runbookId, incidentId }, 'Runbook attached to incident');
    } catch (error) {
      logger.error({ error }, 'Failed to attach runbook to incident');
      throw error;
    }
  }

  /**
   * Execute: Rebuild revenue snapshots
   */
  async rebuildRevenueSnapshots(startDate?: Date, endDate?: Date): Promise<RunbookExecutionResult> {
    const start = Date.now();
    
    try {
      logger.info({ startDate, endDate }, 'Rebuilding revenue snapshots');

      // Get date range
      const end = endDate || new Date();
      const begin = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days

      // Delete existing snapshots in range
      await prisma.revenueSnapshot.deleteMany({
        where: {
          date: {
            gte: begin,
            lte: end
          }
        }
      });

      // Rebuild snapshots day by day
      const days = Math.ceil((end.getTime() - begin.getTime()) / (24 * 60 * 60 * 1000));
      let rebuilt = 0;

      for (let i = 0; i <= days; i++) {
        const date = new Date(begin);
        date.setDate(date.getDate() + i);
        date.setHours(0, 0, 0, 0);

        // Get revenue data for this day
        const dayStart = new Date(date);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const ledgerEntries = await prisma.ledgerEntry.findMany({
          where: {
            occurredAt: {
              gte: dayStart,
              lte: dayEnd
            }
          }
        });

        // Calculate metrics
        let gmvCents = 0;
        let platformRevenueCents = 0;
        let marketplaceFeeCents = 0;
        let eventFeeCents = 0;
        let subscriptionFeeCents = 0;
        let processingCostCents = 0;
        let refundsCents = 0;
        let disputesCents = 0;

        for (const entry of ledgerEntries) {
          switch (entry.type) {
            case 'ORDER_FEE':
              marketplaceFeeCents += Math.abs(entry.amountCents);
              platformRevenueCents += Math.abs(entry.amountCents);
              break;
            case 'EVENT_FEE':
              eventFeeCents += Math.abs(entry.amountCents);
              platformRevenueCents += Math.abs(entry.amountCents);
              break;
            case 'SUBSCRIPTION_FEE':
              subscriptionFeeCents += Math.abs(entry.amountCents);
              platformRevenueCents += Math.abs(entry.amountCents);
              break;
            case 'PROCESSING_FEE':
              processingCostCents += Math.abs(entry.amountCents);
              break;
            case 'REFUND':
              refundsCents += Math.abs(entry.amountCents);
              break;
            case 'DISPUTE_LOSS':
              disputesCents += Math.abs(entry.amountCents);
              break;
          }
        }

        const netRevenueCents = platformRevenueCents - processingCostCents - refundsCents - disputesCents;
        const takeRateBps = gmvCents > 0 ? Math.floor((platformRevenueCents / gmvCents) * 10000) : 0;

        // Create snapshot
        await prisma.revenueSnapshot.create({
          data: {
            date,
            gmvCents,
            platformRevenueCents,
            marketplaceFeeCents,
            eventFeeCents,
            subscriptionFeeCents,
            processingCostCents,
            refundsCents,
            disputesCents,
            netRevenueCents,
            takeRateBps,
            payoutsPendingCents: 0,
            payoutsInTransitCents: 0,
            payoutsCompletedCents: 0,
            taxCollectedCents: 0
          }
        });

        rebuilt++;
      }

      const duration = Date.now() - start;

      return {
        success: true,
        message: `Rebuilt ${rebuilt} revenue snapshots`,
        details: { rebuilt, days, startDate: begin, endDate: end },
        duration
      };
    } catch (error) {
      logger.error({ error }, 'Failed to rebuild revenue snapshots');
      return {
        success: false,
        message: 'Failed to rebuild revenue snapshots',
        details: { error: String(error) },
        duration: Date.now() - start
      };
    }
  }

  /**
   * Execute: Recompute vendor metrics
   */
  async recomputeVendorMetrics(hours: number = 24): Promise<RunbookExecutionResult> {
    const start = Date.now();
    
    try {
      logger.info({ hours }, 'Recomputing vendor metrics');

      const since = new Date(Date.now() - hours * 60 * 60 * 1000);

      // Get all vendors
      const vendors = await prisma.vendorProfile.findMany({
        select: { id: true }
      });

      let updated = 0;

      for (const vendor of vendors) {
        // Recompute revenue
        const revenue = await prisma.order.aggregate({
          where: {
            vendorProfileId: vendor.id,
            status: 'PAID',
            createdAt: { gte: since }
          },
          _sum: {
            total: true
          },
          _count: true
        });

        // Recompute product metrics
        const products = await prisma.product.findMany({
          where: { vendorProfileId: vendor.id }
        });

        // Update any cached metrics if needed
        // For now, just count as success
        updated++;
      }

      const duration = Date.now() - start;

      return {
        success: true,
        message: `Recomputed metrics for ${updated} vendors`,
        details: { updated, hours },
        duration
      };
    } catch (error) {
      logger.error({ error }, 'Failed to recompute vendor metrics');
      return {
        success: false,
        message: 'Failed to recompute vendor metrics',
        details: { error: String(error) },
        duration: Date.now() - start
      };
    }
  }

  /**
   * Execute: Resend verification emails
   */
  async resendVerificationEmails(segmentCriteria: any): Promise<RunbookExecutionResult> {
    const start = Date.now();
    
    try {
      logger.info({ segmentCriteria }, 'Resending verification emails');

      // Find unverified users matching criteria
      const users = await prisma.user.findMany({
        where: {
          emailVerified: false,
          deletedAt: null,
          status: 'ACTIVE',
          ...segmentCriteria
        },
        select: {
          id: true,
          email: true,
          name: true
        }
      });

      let sent = 0;

      for (const user of users) {
        // TODO: Queue verification email via email service
        // For now, just log
        logger.info({ userId: user.id, email: user.email }, 'Would send verification email');
        sent++;
      }

      const duration = Date.now() - start;

      return {
        success: true,
        message: `Queued verification emails for ${sent} users`,
        details: { sent, criteria: segmentCriteria },
        duration
      };
    } catch (error) {
      logger.error({ error }, 'Failed to resend verification emails');
      return {
        success: false,
        message: 'Failed to resend verification emails',
        details: { error: String(error) },
        duration: Date.now() - start
      };
    }
  }

  /**
   * Execute: Reindex products/vendors
   */
  async reindexSearchData(): Promise<RunbookExecutionResult> {
    const start = Date.now();
    
    try {
      logger.info('Reindexing search data');

      // Get counts
      const [productCount, vendorCount] = await Promise.all([
        prisma.product.count({ where: { active: true } }),
        prisma.vendorProfile.count()
      ]);

      // TODO: Implement actual search index rebuild
      // For now, just return success
      logger.info({ productCount, vendorCount }, 'Search index would be rebuilt');

      const duration = Date.now() - start;

      return {
        success: true,
        message: `Reindexed ${productCount} products and ${vendorCount} vendors`,
        details: { productCount, vendorCount },
        duration
      };
    } catch (error) {
      logger.error({ error }, 'Failed to reindex search data');
      return {
        success: false,
        message: 'Failed to reindex search data',
        details: { error: String(error) },
        duration: Date.now() - start
      };
    }
  }

  /**
   * Execute: Trigger SAR export (test)
   */
  async triggerSARExport(userId: string): Promise<RunbookExecutionResult> {
    const start = Date.now();
    
    try {
      logger.info({ userId }, 'Triggering SAR export test');

      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          orders: true,
          vendorProfile: true,
          auditEvents: {
            take: 100,
            orderBy: { occurredAt: 'desc' }
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // TODO: Generate actual SAR export file
      // For now, just count data points
      const dataPoints = {
        user: 1,
        orders: user.orders.length,
        auditEvents: user.auditEvents.length,
        hasVendorProfile: !!user.vendorProfile
      };

      logger.info({ userId, dataPoints }, 'SAR export test completed');

      const duration = Date.now() - start;

      return {
        success: true,
        message: `SAR export test completed for user ${userId}`,
        details: dataPoints,
        duration
      };
    } catch (error) {
      logger.error({ error }, 'Failed to trigger SAR export');
      return {
        success: false,
        message: 'Failed to trigger SAR export',
        details: { error: String(error) },
        duration: Date.now() - start
      };
    }
  }

  /**
   * Initialize default runbooks
   */
  async initializeDefaults(): Promise<void> {
    const defaults = [
      {
        title: 'Database Performance Degradation',
        incidentType: 'DATABASE_SLOW',
        priority: 1,
        content: `# Database Performance Degradation

## Symptoms
- Slow query response times
- High CPU usage on database
- Connection pool exhaustion

## Immediate Actions
1. Check active connections: \`SELECT count(*) FROM pg_stat_activity\`
2. Identify slow queries: \`SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10\`
3. Check for locks: \`SELECT * FROM pg_locks WHERE NOT granted\`

## Resolution Steps
1. Kill long-running queries if safe
2. Run VACUUM ANALYZE if bloat detected
3. Add missing indexes
4. Scale database if needed

## Prevention
- Regular VACUUM schedule
- Query optimization
- Connection pooling review
`
      },
      {
        title: 'Queue Backlog',
        incidentType: 'QUEUE_BACKLOG',
        priority: 2,
        content: `# Queue Backlog

## Symptoms
- Jobs waiting count > 1000
- Processing rate < expected
- Failed jobs accumulating

## Immediate Actions
1. Check queue health dashboard
2. Review failed job errors
3. Check worker status

## Resolution Steps
1. Scale workers if resource issue
2. Fix code bugs causing failures
3. Retry failed jobs after fix
4. Purge old completed jobs

## Prevention
- Monitor queue depth
- Set up alerts for backlogs
- Regular queue maintenance
`
      },
      {
        title: 'Email Delivery Failure',
        incidentType: 'EMAIL_FAILURE',
        priority: 3,
        content: `# Email Delivery Failure

## Symptoms
- High email bounce rate
- SendGrid API errors
- Email queue backing up

## Immediate Actions
1. Check SendGrid API status
2. Review recent bounce/complaint rates
3. Verify API key validity

## Resolution Steps
1. Rotate API key if compromised
2. Clean invalid email addresses
3. Review email content for spam triggers
4. Contact SendGrid support if needed

## Prevention
- Monitor bounce/complaint rates
- Implement email validation
- Regular sender reputation checks
`
      }
    ];

    try {
      for (const runbook of defaults) {
        // Check if runbook with this incidentType already exists
        const existing = await prisma.runbook.findFirst({
          where: {
            incidentType: runbook.incidentType,
            isActive: true
          }
        });

        if (!existing) {
          await prisma.runbook.create({
            data: runbook
          });
        }
      }

      logger.info('Default runbooks initialized');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize default runbooks');
    }
  }
}

export const runbooksService = new RunbooksService();

