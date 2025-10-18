import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const prisma = new PrismaClient();

export interface ModerationItem {
  id: string;
  type: 'product' | 'vendor' | 'review' | 'event' | 'user' | 'content';
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  reportedBy?: string;
  reportedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  targetId: string;
  targetType: string;
  targetData: any;
  evidence: ModerationEvidence[];
  actions: ModerationAction[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModerationEvidence {
  id: string;
  type: 'screenshot' | 'text' | 'url' | 'metadata' | 'behavioral';
  content: string;
  description?: string;
  submittedBy: string;
  submittedAt: Date;
}

export interface ModerationAction {
  id: string;
  type: 'approve' | 'reject' | 'escalate' | 'warn' | 'suspend' | 'ban' | 'remove_content';
  performedBy: string;
  performedAt: Date;
  reason: string;
  details?: any;
  duration?: number; // for temporary actions
}

export interface AccountLink {
  id: string;
  userId: string;
  linkedUserId: string;
  linkType: 'email' | 'phone' | 'address' | 'payment' | 'device' | 'ip' | 'behavioral';
  confidence: number; // 0-100
  evidence: string[];
  riskScore: number; // 0-100
  status: 'active' | 'investigating' | 'confirmed' | 'false_positive' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

export interface TrustSafetyMetrics {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  averageResolutionTime: number; // hours
  topViolationTypes: Array<{ type: string; count: number }>;
  accountLinks: {
    total: number;
    highRisk: number;
    investigating: number;
  };
  actions: {
    warnings: number;
    suspensions: number;
    bans: number;
    contentRemovals: number;
  };
}

export interface UserRiskProfile {
  userId: string;
  riskScore: number;
  riskFactors: string[];
  accountLinks: AccountLink[];
  moderationHistory: ModerationItem[];
  actions: ModerationAction[];
  kycStatus: 'pending' | 'verified' | 'rejected' | 'expired';
  kybStatus: 'pending' | 'verified' | 'rejected' | 'expired';
  lastRiskAssessment: Date;
}

export class TrustSafetyService {
  private static instance: TrustSafetyService;
  
  public static getInstance(): TrustSafetyService {
    if (!TrustSafetyService.instance) {
      TrustSafetyService.instance = new TrustSafetyService();
    }
    return TrustSafetyService.instance;
  }

  // Get moderation queue
  async getModerationQueue(filters: {
    status?: 'pending' | 'approved' | 'rejected' | 'escalated';
    type?: 'product' | 'vendor' | 'review' | 'event' | 'user' | 'content';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    page?: number;
    pageSize?: number;
  }): Promise<{
    items: ModerationItem[];
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  }> {
    try {
      const {
        status = 'pending',
        type,
        priority,
        page = 1,
        pageSize = 20
      } = filters;

      const skip = (page - 1) * pageSize;

      // Build where clause
      const where: any = { status };
      if (type) where.type = type;
      if (priority) where.priority = priority;

      // Mock data for now - in production, this would query the database
      const mockItems: ModerationItem[] = [
        {
          id: 'mod-1',
          type: 'product',
          status: 'pending',
          priority: 'high',
          reason: 'Inappropriate content in product description',
          reportedBy: 'user-123',
          reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          targetId: 'prod-456',
          targetType: 'Product',
          targetData: {
            name: 'Artisan Bread Mix',
            vendor: 'Bakery Co.',
            description: 'Premium bread mix with organic ingredients...'
          },
          evidence: [
            {
              id: 'ev-1',
              type: 'text',
              content: 'Contains inappropriate language in description',
              submittedBy: 'user-123',
              submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
            }
          ],
          actions: [],
          notes: '',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: 'mod-2',
          type: 'vendor',
          status: 'pending',
          priority: 'urgent',
          reason: 'Suspicious vendor behavior - multiple account violations',
          reportedBy: 'system',
          reportedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          targetId: 'vendor-789',
          targetType: 'Vendor',
          targetData: {
            businessName: 'Suspicious Vendor Co.',
            email: 'suspicious@example.com',
            violations: ['fake_reviews', 'price_manipulation', 'account_sharing']
          },
          evidence: [
            {
              id: 'ev-2',
              type: 'metadata',
              content: 'Multiple IP addresses, shared payment methods',
              submittedBy: 'system',
              submittedAt: new Date(Date.now() - 30 * 60 * 1000)
            }
          ],
          actions: [],
          notes: '',
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
          id: 'mod-3',
          type: 'review',
          status: 'pending',
          priority: 'medium',
          reason: 'Fake review detected',
          reportedBy: 'user-456',
          reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          targetId: 'review-101',
          targetType: 'Review',
          targetData: {
            product: 'Coffee Beans',
            rating: 5,
            text: 'Amazing product! Best coffee ever!',
            reviewer: 'user-789'
          },
          evidence: [
            {
              id: 'ev-3',
              type: 'behavioral',
              content: 'Reviewer has no purchase history for this product',
              submittedBy: 'system',
              submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
            }
          ],
          actions: [],
          notes: '',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
        }
      ];

      // Filter mock data
      let filteredItems = mockItems;
      if (status) filteredItems = filteredItems.filter(item => item.status === status);
      if (type) filteredItems = filteredItems.filter(item => item.type === type);
      if (priority) filteredItems = filteredItems.filter(item => item.priority === priority);

      const total = filteredItems.length;
      const paginatedItems = filteredItems.slice(skip, skip + pageSize);

      return {
        items: paginatedItems,
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize)
      };
    } catch (error) {
      logger.error('Failed to get moderation queue:', { error });
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        pageCount: 0
      };
    }
  }

  // Get account link graph
  async getAccountLinkGraph(userId?: string): Promise<{
    nodes: Array<{
      id: string;
      type: 'user' | 'vendor';
      label: string;
      riskScore: number;
      status: string;
    }>;
    links: Array<{
      source: string;
      target: string;
      type: string;
      confidence: number;
      riskScore: number;
    }>;
  }> {
    try {
      // Mock account link graph data
      const mockNodes = [
        { id: 'user-1', type: 'user', label: 'John Doe', riskScore: 25, status: 'active' },
        { id: 'user-2', type: 'user', label: 'Jane Smith', riskScore: 15, status: 'active' },
        { id: 'vendor-1', type: 'vendor', label: 'Artisan Bakery', riskScore: 5, status: 'active' },
        { id: 'user-3', type: 'user', label: 'Bob Johnson', riskScore: 85, status: 'suspended' },
        { id: 'vendor-2', type: 'vendor', label: 'Suspicious Co.', riskScore: 95, status: 'banned' }
      ];

      const mockLinks = [
        { source: 'user-1', target: 'user-2', type: 'email', confidence: 85, riskScore: 20 },
        { source: 'user-2', target: 'vendor-1', type: 'payment', confidence: 90, riskScore: 10 },
        { source: 'user-3', target: 'vendor-2', type: 'ip', confidence: 95, riskScore: 90 },
        { source: 'user-1', target: 'vendor-1', type: 'behavioral', confidence: 70, riskScore: 15 }
      ];

      return {
        nodes: mockNodes,
        links: mockLinks
      };
    } catch (error) {
      logger.error('Failed to get account link graph:', { error });
      return { nodes: [], links: [] };
    }
  }

  // Get trust & safety metrics
  async getTrustSafetyMetrics(): Promise<TrustSafetyMetrics> {
    try {
      // Mock metrics data
      return {
        totalReports: 1247,
        pendingReports: 23,
        resolvedReports: 1224,
        averageResolutionTime: 4.2,
        topViolationTypes: [
          { type: 'Inappropriate Content', count: 456 },
          { type: 'Fake Reviews', count: 234 },
          { type: 'Account Sharing', count: 123 },
          { type: 'Price Manipulation', count: 89 },
          { type: 'Spam', count: 67 }
        ],
        accountLinks: {
          total: 892,
          highRisk: 45,
          investigating: 12
        },
        actions: {
          warnings: 156,
          suspensions: 23,
          bans: 8,
          contentRemovals: 234
        }
      };
    } catch (error) {
      logger.error('Failed to get trust & safety metrics:', { error });
      return {
        totalReports: 0,
        pendingReports: 0,
        resolvedReports: 0,
        averageResolutionTime: 0,
        topViolationTypes: [],
        accountLinks: { total: 0, highRisk: 0, investigating: 0 },
        actions: { warnings: 0, suspensions: 0, bans: 0, contentRemovals: 0 }
      };
    }
  }

  // Get user risk profile
  async getUserRiskProfile(userId: string): Promise<UserRiskProfile | null> {
    try {
      // Mock user risk profile
      return {
        userId,
        riskScore: 35,
        riskFactors: [
          'Multiple account links detected',
          'Unusual login patterns',
          'High dispute rate'
        ],
        accountLinks: [
          {
            id: 'link-1',
            userId,
            linkedUserId: 'user-456',
            linkType: 'email',
            confidence: 85,
            evidence: ['shared_email_domain', 'similar_behavior'],
            riskScore: 30,
            status: 'active',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ],
        moderationHistory: [],
        actions: [
          {
            id: 'action-1',
            type: 'warn',
            performedBy: 'admin-123',
            performedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            reason: 'Inappropriate content in product listing',
            details: { productId: 'prod-789' }
          }
        ],
        kycStatus: 'verified',
        kybStatus: 'pending',
        lastRiskAssessment: new Date(Date.now() - 24 * 60 * 60 * 1000)
      };
    } catch (error) {
      logger.error(`Failed to get user risk profile for ${userId}:`, { error, userId });
      return null;
    }
  }

  // Take moderation action
  async takeModerationAction(
    moderationId: string,
    action: {
      type: 'approve' | 'reject' | 'escalate' | 'warn' | 'suspend' | 'ban' | 'remove_content';
      reason: string;
      details?: any;
      duration?: number;
    },
    performedBy: string
  ): Promise<boolean> {
    try {
      // In production, this would update the database
      logger.info(`Moderation action taken: ${action.type} on ${moderationId} by ${performedBy}`);
      
      // Mock action implementation
      const actionRecord: ModerationAction = {
        id: `action-${Date.now()}`,
        type: action.type,
        performedBy,
        performedAt: new Date(),
        reason: action.reason,
        details: action.details,
        duration: action.duration
      };

      // Update moderation item status based on action
      let newStatus: 'pending' | 'approved' | 'rejected' | 'escalated' = 'pending';
      switch (action.type) {
        case 'approve':
          newStatus = 'approved';
          break;
        case 'reject':
          newStatus = 'rejected';
          break;
        case 'escalate':
          newStatus = 'escalated';
          break;
        default:
          newStatus = 'pending';
      }

      logger.info(`Moderation item ${moderationId} status updated to ${newStatus}`);
      return true;
    } catch (error) {
      logger.error(`Failed to take moderation action on ${moderationId}:`, { error, moderationId });
      return false;
    }
  }

  // Update account link status
  async updateAccountLinkStatus(
    linkId: string,
    status: 'active' | 'investigating' | 'confirmed' | 'false_positive' | 'resolved',
    updatedBy: string
  ): Promise<boolean> {
    try {
      logger.info(`Account link ${linkId} status updated to ${status} by ${updatedBy}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update account link ${linkId}:`, { error, linkId });
      return false;
    }
  }

  // Get moderation item details
  async getModerationItem(itemId: string): Promise<ModerationItem | null> {
    try {
      // Mock moderation item
      return {
        id: itemId,
        type: 'product',
        status: 'pending',
        priority: 'high',
        reason: 'Inappropriate content in product description',
        reportedBy: 'user-123',
        reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        targetId: 'prod-456',
        targetType: 'Product',
        targetData: {
          name: 'Artisan Bread Mix',
          vendor: 'Bakery Co.',
          description: 'Premium bread mix with organic ingredients...'
        },
        evidence: [
          {
            id: 'ev-1',
            type: 'text',
            content: 'Contains inappropriate language in description',
            submittedBy: 'user-123',
            submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
          }
        ],
        actions: [],
        notes: '',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      };
    } catch (error) {
      logger.error(`Failed to get moderation item ${itemId}:`, { error, itemId });
      return null;
    }
  }

  // Search users for risk assessment
  async searchUsers(query: string): Promise<Array<{
    id: string;
    name: string;
    email: string;
    riskScore: number;
    status: string;
  }>> {
    try {
      // Mock user search results
      return [
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          riskScore: 25,
          status: 'active'
        },
        {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          riskScore: 15,
          status: 'active'
        },
        {
          id: 'user-3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          riskScore: 85,
          status: 'suspended'
        }
      ].filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      logger.error('Failed to search users:', { error });
      return [];
    }
  }
}

// Export singleton instance
export const trustSafetyService = TrustSafetyService.getInstance();

























