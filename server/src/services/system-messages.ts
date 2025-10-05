import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const prisma = new PrismaClient();

export interface SystemMessage {
  id: string;
  vendorProfileId: string;
  userId?: string;
  scope: string;
  type: string;
  title: string;
  body: string;
  data?: any;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemMessageFilters {
  scope?: string;
  type?: string;
  read?: boolean;
  vendorProfileId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class SystemMessagesService {
  private static instance: SystemMessagesService;
  
  public static getInstance(): SystemMessagesService {
    if (!SystemMessagesService.instance) {
      SystemMessagesService.instance = new SystemMessagesService();
    }
    return SystemMessagesService.instance;
  }

  // Create a system message
  async createMessage(data: {
    vendorProfileId: string;
    userId?: string;
    scope: string;
    type: string;
    title: string;
    body: string;
    data?: any;
  }): Promise<SystemMessage> {
    try {
      const message = await (prisma as any).systemMessage.create({
        data: {
          vendorProfileId: data.vendorProfileId,
          userId: data.userId,
          scope: data.scope,
          type: data.type,
          title: data.title,
          body: data.body,
          data: data.data ? JSON.stringify(data.data) : null
        }
      });

      logger.info(`System message created: ${message.id}`, {
        scope: data.scope,
        type: data.type,
        vendorProfileId: data.vendorProfileId
      } as any);

      return {
        ...message,
        data: message.data ? JSON.parse(message.data) : undefined
      };
    } catch (error) {
      logger.error('Failed to create system message:', error);
      throw error;
    }
  }

  // Get messages with filters and pagination
  async getMessages(
    filters: SystemMessageFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<{
    messages: SystemMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pageCount: number;
    };
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const where: any = {};
      
      if (filters.scope) where.scope = filters.scope;
      if (filters.type) where.type = filters.type;
      if (filters.vendorProfileId) where.vendorProfileId = filters.vendorProfileId;
      if (filters.userId) where.userId = filters.userId;
      
      if (filters.read !== undefined) {
        if (filters.read) {
          where.readAt = { not: null };
        } else {
          where.readAt = null;
        }
      }
      
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
      }
      
      const [messages, total] = await Promise.all([
        (prisma as any).systemMessage.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        (prisma as any).systemMessage.count({ where })
      ]);
      
      const parsedMessages = messages.map((msg: any) => ({
        ...msg,
        data: msg.data ? JSON.parse(msg.data) : undefined
      }));
      
      return {
        messages: parsedMessages,
        pagination: {
          page,
          limit,
          total,
          pageCount: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get system messages:', error);
      throw error;
    }
  }

  // Mark message as read
  async markAsRead(messageId: string): Promise<SystemMessage> {
    try {
      const message = await (prisma as any).systemMessage.update({
        where: { id: messageId },
        data: { readAt: new Date() }
      });

      return {
        ...message,
        data: message.data ? JSON.parse(message.data) : undefined
      };
    } catch (error) {
      logger.error('Failed to mark message as read:', error);
      throw error;
    }
  }

  // Mark multiple messages as read
  async markMultipleAsRead(messageIds: string[]): Promise<number> {
    try {
      const result = await (prisma as any).systemMessage.updateMany({
        where: { id: { in: messageIds } },
        data: { readAt: new Date() }
      });

      return result.count;
    } catch (error) {
      logger.error('Failed to mark messages as read:', error);
      throw error;
    }
  }

  // Mark all messages as read for a user/vendor
  async markAllAsRead(vendorProfileId: string, userId?: string): Promise<number> {
    try {
      const where: any = { vendorProfileId, readAt: null };
      if (userId) where.userId = userId;

      const result = await (prisma as any).systemMessage.updateMany({
        where,
        data: { readAt: new Date() }
      });

      return result.count;
    } catch (error) {
      logger.error('Failed to mark all messages as read:', error);
      throw error;
    }
  }

  // Delete message
  async deleteMessage(messageId: string): Promise<void> {
    try {
      await (prisma as any).systemMessage.delete({
        where: { id: messageId }
      });

      logger.info(`System message deleted: ${messageId}`);
    } catch (error) {
      logger.error('Failed to delete system message:', error);
      throw error;
    }
  }

  // Get message statistics
  async getMessageStats(vendorProfileId?: string): Promise<{
    total: number;
    unread: number;
    byScope: Record<string, number>;
    byType: Record<string, number>;
  }> {
    try {
      const where: any = {};
      if (vendorProfileId) where.vendorProfileId = vendorProfileId;

      const [total, unread, scopeStats, typeStats] = await Promise.all([
        (prisma as any).systemMessage.count({ where }),
        (prisma as any).systemMessage.count({ where: { ...where, readAt: null } }),
        (prisma as any).systemMessage.groupBy({
          by: ['scope'],
          where,
          _count: { scope: true }
        }),
        (prisma as any).systemMessage.groupBy({
          by: ['type'],
          where,
          _count: { type: true }
        })
      ]);

      const byScope = scopeStats.reduce((acc: any, stat: any) => {
        acc[stat.scope] = stat._count.scope;
        return acc;
      }, {} as Record<string, number>);

      const byType = typeStats.reduce((acc: any, stat: any) => {
        acc[stat.type] = stat._count.type;
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        unread,
        byScope,
        byType
      };
    } catch (error) {
      logger.error('Failed to get message stats:', error);
      throw error;
    }
  }

  // Broadcast message to multiple vendors
  async broadcastMessage(data: {
    vendorProfileIds: string[];
    scope: string;
    type: string;
    title: string;
    body: string;
    data?: any;
  }): Promise<SystemMessage[]> {
    try {
      const messages = await Promise.all(
        data.vendorProfileIds.map(vendorProfileId =>
          this.createMessage({
            vendorProfileId,
            scope: data.scope,
            type: data.type,
            title: data.title,
            body: data.body,
            data: data.data
          })
        )
      );

      logger.info(`Broadcast message sent to ${messages.length} vendors`, {
        scope: data.scope,
        type: data.type
      } as any);

      return messages;
    } catch (error) {
      logger.error('Failed to broadcast message:', error);
      throw error;
    }
  }

  // Get recent messages for dashboard
  async getRecentMessages(limit: number = 10): Promise<SystemMessage[]> {
    try {
      const messages = await (prisma as any).systemMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return messages.map((msg: any) => ({
        ...msg,
        data: msg.data ? JSON.parse(msg.data) : undefined
      }));
    } catch (error) {
      logger.error('Failed to get recent messages:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const systemMessages = SystemMessagesService.getInstance();
