import { PrismaClient, ConfigCategory } from '@prisma/client';
import { redisCacheService } from './redis-cache.service';
import { logger } from '../logger';

const prisma = new PrismaClient();

const SETTINGS_CACHE_TTL = 60; // 60 seconds as per spec

export class SettingsService {
  /**
   * Get all settings by category
   */
  async getSettingsByCategory(category: ConfigCategory) {
    const cacheKey = `settings:category:${category}`;
    
    try {
      // Try cache first
      const cached = await redisCacheService.get(cacheKey);
      if (cached) {
        logger.debug({ category }, 'Settings cache hit');
        return JSON.parse(cached);
      }
      
      // Fetch from database
      const settings = await prisma.configSetting.findMany({
        where: { category },
        orderBy: { key: 'asc' }
      });
      
      // Cache result
      await redisCacheService.set(cacheKey, JSON.stringify(settings), SETTINGS_CACHE_TTL);
      
      return settings;
    } catch (error) {
      logger.error({ error, category }, 'Failed to get settings by category');
      throw error;
    }
  }

  /**
   * Get a single setting by key with caching
   */
  async getSetting(key: string) {
    const cacheKey = `settings:key:${key}`;
    
    try {
      // Try cache first
      const cached = await redisCacheService.get(cacheKey);
      if (cached) {
        logger.debug({ key }, 'Setting cache hit');
        return JSON.parse(cached);
      }
      
      // Fetch from database
      const setting = await prisma.configSetting.findUnique({
        where: { key }
      });
      
      if (setting) {
        // Cache result
        await redisCacheService.set(cacheKey, JSON.stringify(setting), SETTINGS_CACHE_TTL);
      }
      
      return setting;
    } catch (error) {
      logger.error({ error, key }, 'Failed to get setting');
      throw error;
    }
  }

  /**
   * Get all settings
   */
  async getAllSettings() {
    const cacheKey = 'settings:all';
    
    try {
      // Try cache first
      const cached = await redisCacheService.get(cacheKey);
      if (cached) {
        logger.debug('All settings cache hit');
        return JSON.parse(cached);
      }
      
      // Fetch from database
      const settings = await prisma.configSetting.findMany({
        orderBy: [
          { category: 'asc' },
          { key: 'asc' }
        ]
      });
      
      // Cache result
      await redisCacheService.set(cacheKey, JSON.stringify(settings), SETTINGS_CACHE_TTL);
      
      return settings;
    } catch (error) {
      logger.error({ error }, 'Failed to get all settings');
      throw error;
    }
  }

  /**
   * Update a setting with audit trail
   */
  async updateSetting(key: string, value: any, updatedBy: string, reason: string) {
    try {
      // Get old value for audit
      const oldSetting = await prisma.configSetting.findUnique({
        where: { key }
      });

      // Update or create setting
      const setting = await prisma.configSetting.upsert({
        where: { key },
        update: {
          value,
          updatedBy
        },
        create: {
          key,
          value,
          category: this.inferCategory(key),
          updatedBy
        }
      });

      // Create audit event
      await prisma.auditEvent.create({
        data: {
          actorId: updatedBy,
          actorType: 'USER',
          scope: 'CONFIG',
          action: 'CONFIG_SETTING_UPDATED',
          targetType: 'ConfigSetting',
          targetId: setting.id,
          reason,
          severity: 'NOTICE',
          diffBefore: oldSetting ? { value: oldSetting.value } : null,
          diffAfter: { value },
          metadata: { key },
          selfHash: '', // Will be computed by audit service
          prevHash: null
        }
      });

      // Invalidate caches
      await this.invalidateCaches(key, setting.category);

      logger.info({ key, updatedBy, reason }, 'Setting updated');

      return setting;
    } catch (error) {
      logger.error({ error, key }, 'Failed to update setting');
      throw error;
    }
  }

  /**
   * Bulk update settings
   */
  async bulkUpdateSettings(
    updates: Array<{ key: string; value: any }>,
    updatedBy: string,
    reason: string
  ) {
    try {
      const results = [];

      for (const update of updates) {
        const result = await this.updateSetting(
          update.key,
          update.value,
          updatedBy,
          reason
        );
        results.push(result);
      }

      logger.info({ count: updates.length, updatedBy, reason }, 'Bulk settings update completed');

      return results;
    } catch (error) {
      logger.error({ error, updatesCount: updates.length }, 'Failed to bulk update settings');
      throw error;
    }
  }

  /**
   * Get public settings (safe for client exposure)
   */
  async getPublicSettings() {
    const cacheKey = 'settings:public';
    
    try {
      // Try cache first
      const cached = await redisCacheService.get(cacheKey);
      if (cached) {
        logger.debug('Public settings cache hit');
        return JSON.parse(cached);
      }
      
      // Fetch from database
      const settings = await prisma.configSetting.findMany({
        where: { isPublic: true },
        select: {
          key: true,
          value: true,
          category: true
        }
      });
      
      // Cache result (longer TTL for public settings)
      await redisCacheService.set(cacheKey, JSON.stringify(settings), 300); // 5 minutes
      
      return settings;
    } catch (error) {
      logger.error({ error }, 'Failed to get public settings');
      throw error;
    }
  }

  /**
   * Delete a setting
   */
  async deleteSetting(key: string, deletedBy: string, reason: string) {
    try {
      const setting = await prisma.configSetting.findUnique({
        where: { key }
      });

      if (!setting) {
        throw new Error(`Setting ${key} not found`);
      }

      await prisma.configSetting.delete({
        where: { key }
      });

      // Create audit event
      await prisma.auditEvent.create({
        data: {
          actorId: deletedBy,
          actorType: 'USER',
          scope: 'CONFIG',
          action: 'CONFIG_SETTING_DELETED',
          targetType: 'ConfigSetting',
          targetId: setting.id,
          reason,
          severity: 'WARNING',
          diffBefore: { value: setting.value },
          diffAfter: null,
          metadata: { key },
          selfHash: '',
          prevHash: null
        }
      });

      // Invalidate caches
      await this.invalidateCaches(key, setting.category);

      logger.warn({ key, deletedBy, reason }, 'Setting deleted');

      return { success: true };
    } catch (error) {
      logger.error({ error, key }, 'Failed to delete setting');
      throw error;
    }
  }

  /**
   * Invalidate relevant caches after settings update
   */
  private async invalidateCaches(key: string, category: ConfigCategory) {
    try {
      await Promise.all([
        redisCacheService.delete(`settings:key:${key}`),
        redisCacheService.delete(`settings:category:${category}`),
        redisCacheService.delete('settings:all'),
        redisCacheService.delete('settings:public')
      ]);
      
      logger.debug({ key, category }, 'Settings caches invalidated');
    } catch (error) {
      logger.error({ error, key, category }, 'Failed to invalidate settings caches');
    }
  }

  /**
   * Infer category from key pattern
   */
  private inferCategory(key: string): ConfigCategory {
    if (key.startsWith('platform.') || key.startsWith('identity.')) {
      return 'PLATFORM_IDENTITY';
    }
    if (key.startsWith('auth.') || key.startsWith('security.') || key.startsWith('session.')) {
      return 'AUTH_SECURITY';
    }
    if (key.startsWith('payment.') || key.startsWith('fee.') || key.startsWith('tax.')) {
      return 'PAYMENTS_FEES';
    }
    if (key.startsWith('notification.') || key.startsWith('email.') || key.startsWith('sms.')) {
      return 'NOTIFICATIONS';
    }
    if (key.startsWith('ai.') || key.startsWith('feature.')) {
      return 'AI_FEATURES';
    }
    if (key.startsWith('integration.') || key.startsWith('stripe.') || key.startsWith('sendgrid.')) {
      return 'INTEGRATIONS';
    }
    if (key.startsWith('compliance.') || key.startsWith('legal.') || key.startsWith('gdpr.')) {
      return 'COMPLIANCE';
    }
    if (key.startsWith('maintenance.') || key.startsWith('system.')) {
      return 'MAINTENANCE';
    }
    
    // Default to maintenance if unclear
    return 'MAINTENANCE';
  }
}

export const settingsService = new SettingsService();

