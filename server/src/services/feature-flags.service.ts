import { prisma } from '../db';
import { logger } from '../logger';

export interface FeatureFlagData {
  key: string;
  enabled: boolean;
  scope: 'GLOBAL' | 'ADMIN' | 'VENDOR' | 'CUSTOMER';
  rolloutPercentage: number;
  notes?: string;
}

class FeatureFlagsService {
  /**
   * List all feature flags
   */
  async listFlags(): Promise<any[]> {
    try {
      const flags = await prisma.featureFlag.findMany({
        include: {
          updatedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          key: 'asc'
        }
      });

      return flags;
    } catch (error) {
      logger.error('Failed to list feature flags:', error);
      throw error;
    }
  }

  /**
   * Get a specific feature flag
   */
  async getFlag(key: string): Promise<any> {
    try {
      const flag = await prisma.featureFlag.findUnique({
        where: { key },
        include: {
          updatedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return flag;
    } catch (error) {
      logger.error(`Failed to get feature flag ${key}:`, error);
      throw error;
    }
  }

  /**
   * Toggle feature flag
   */
  async toggleFlag(key: string, enabled: boolean, updatedById: string): Promise<any> {
    try {
      const flag = await prisma.featureFlag.upsert({
        where: { key },
        update: {
          enabled,
          updatedById,
          updatedAt: new Date()
        },
        create: {
          key,
          enabled,
          updatedById,
          scope: 'GLOBAL',
          rolloutPercentage: 100
        },
        include: {
          updatedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      logger.info({ key, enabled, updatedById }, 'Feature flag toggled');

      return flag;
    } catch (error) {
      logger.error(`Failed to toggle feature flag ${key}:`, error);
      throw error;
    }
  }

  /**
   * Update feature flag
   */
  async updateFlag(key: string, data: Partial<FeatureFlagData>, updatedById: string): Promise<any> {
    try {
      const flag = await prisma.featureFlag.upsert({
        where: { key },
        update: {
          ...data,
          updatedById,
          updatedAt: new Date()
        },
        create: {
          key,
          enabled: data.enabled ?? false,
          scope: data.scope ?? 'GLOBAL',
          rolloutPercentage: data.rolloutPercentage ?? 100,
          notes: data.notes,
          updatedById
        },
        include: {
          updatedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      logger.info({ key, updates: data, updatedById }, 'Feature flag updated');

      return flag;
    } catch (error) {
      logger.error(`Failed to update feature flag ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if feature is enabled for a user
   */
  async isEnabled(key: string, userId?: string, userRole?: string): Promise<boolean> {
    try {
      const flag = await prisma.featureFlag.findUnique({
        where: { key }
      });

      if (!flag) {
        // Flag doesn't exist - default to disabled
        return false;
      }

      if (!flag.enabled) {
        return false;
      }

      // Check scope
      if (flag.scope !== 'GLOBAL') {
        if (!userRole) {
          return false;
        }

        const scopeRoleMap: Record<string, string[]> = {
          'ADMIN': ['ADMIN', 'SUPER_ADMIN'],
          'VENDOR': ['VENDOR'],
          'CUSTOMER': ['CUSTOMER']
        };

        const allowedRoles = scopeRoleMap[flag.scope] || [];
        if (!allowedRoles.includes(userRole)) {
          return false;
        }
      }

      // Check rollout percentage
      if (flag.rolloutPercentage < 100) {
        if (!userId) {
          return false;
        }

        // Deterministic rollout based on user ID hash
        const hash = this.hashUserId(userId);
        const percentage = (hash % 100) + 1;
        
        return percentage <= flag.rolloutPercentage;
      }

      return true;
    } catch (error) {
      logger.error(`Failed to check feature flag ${key}:`, error);
      return false;
    }
  }

  /**
   * Get all flags for a user (resolved)
   */
  async getFlagsForUser(userId: string, userRole: string): Promise<Record<string, boolean>> {
    try {
      const flags = await prisma.featureFlag.findMany({
        where: {
          enabled: true
        }
      });

      const resolved: Record<string, boolean> = {};

      for (const flag of flags) {
        resolved[flag.key] = await this.isEnabled(flag.key, userId, userRole);
      }

      return resolved;
    } catch (error) {
      logger.error('Failed to get flags for user:', error);
      return {};
    }
  }

  /**
   * Delete a feature flag
   */
  async deleteFlag(key: string): Promise<void> {
    try {
      await prisma.featureFlag.delete({
        where: { key }
      });

      logger.info({ key }, 'Feature flag deleted');
    } catch (error) {
      logger.error(`Failed to delete feature flag ${key}:`, error);
      throw error;
    }
  }

  /**
   * Initialize default feature flags
   */
  async initializeDefaults(): Promise<void> {
    const defaults = [
      {
        key: 'ai_assist_parts',
        enabled: true,
        scope: 'VENDOR',
        rolloutPercentage: 100,
        notes: 'AI-powered recipe parsing and product suggestions'
      },
      {
        key: 'sse_realtime',
        enabled: true,
        scope: 'GLOBAL',
        rolloutPercentage: 100,
        notes: 'Server-Sent Events for real-time updates'
      },
      {
        key: 'label_studio_pro',
        enabled: false,
        scope: 'VENDOR',
        rolloutPercentage: 0,
        notes: 'Advanced label designer with custom templates'
      },
      {
        key: 'vacation_fee_pause',
        enabled: true,
        scope: 'VENDOR',
        rolloutPercentage: 100,
        notes: 'Pause platform fees during vacation mode'
      },
      {
        key: 'marketplace_v2',
        enabled: false,
        scope: 'GLOBAL',
        rolloutPercentage: 0,
        notes: 'New marketplace UI with enhanced search'
      }
    ];

    try {
      for (const flag of defaults) {
        await prisma.featureFlag.upsert({
          where: { key: flag.key },
          update: {}, // Don't update if exists
          create: {
            ...flag,
            scope: flag.scope as any
          }
        });
      }

      logger.info('Default feature flags initialized');
    } catch (error) {
      logger.error('Failed to initialize default feature flags:', error);
    }
  }

  /**
   * Simple hash function for deterministic rollout
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

export const featureFlagsService = new FeatureFlagsService();

