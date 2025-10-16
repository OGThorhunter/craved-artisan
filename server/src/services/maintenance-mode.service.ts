import { prisma } from '../db';
import { logger } from '../logger';

export type MaintenanceType = 
  | 'GLOBAL_READONLY' 
  | 'VENDOR_READONLY' 
  | 'QUEUE_DRAIN' 
  | 'DATABASE_MAINTENANCE' 
  | 'DEPLOYMENT';

export interface MaintenanceModeStatus {
  globalReadonly: boolean;
  vendorReadonly: boolean;
  queueDrain: boolean;
  activeWindows: any[];
}

class MaintenanceModeService {
  private inMemoryStatus: MaintenanceModeStatus = {
    globalReadonly: false,
    vendorReadonly: false,
    queueDrain: false,
    activeWindows: []
  };

  /**
   * Enable maintenance mode
   */
  async enableMaintenance(
    type: MaintenanceType,
    reason: string,
    duration: number, // in minutes
    createdById: string
  ): Promise<any> {
    try {
      const scheduledStart = new Date();
      const scheduledEnd = new Date(scheduledStart.getTime() + duration * 60000);

      const window = await prisma.maintenanceWindow.create({
        data: {
          type,
          status: 'ACTIVE',
          reason,
          scheduledStart,
          scheduledEnd,
          actualStart: scheduledStart,
          createdById
        }
      });

      // Update in-memory status
      this.updateInMemoryStatus(type, true);

      logger.info({ type, reason, duration, createdById }, 'Maintenance mode enabled');

      return window;
    } catch (error) {
      logger.error('Failed to enable maintenance mode:', error);
      throw error;
    }
  }

  /**
   * Disable maintenance mode
   */
  async disableMaintenance(windowId: string): Promise<void> {
    try {
      const window = await prisma.maintenanceWindow.findUnique({
        where: { id: windowId }
      });

      if (!window) {
        throw new Error('Maintenance window not found');
      }

      await prisma.maintenanceWindow.update({
        where: { id: windowId },
        data: {
          status: 'COMPLETED',
          actualEnd: new Date()
        }
      });

      // Update in-memory status
      this.updateInMemoryStatus(window.type as MaintenanceType, false);

      logger.info({ windowId, type: window.type }, 'Maintenance mode disabled');
    } catch (error) {
      logger.error('Failed to disable maintenance mode:', error);
      throw error;
    }
  }

  /**
   * Get current maintenance status
   */
  async getStatus(): Promise<MaintenanceModeStatus> {
    try {
      // Refresh status from database
      const activeWindows = await prisma.maintenanceWindow.findMany({
        where: {
          status: 'ACTIVE'
        }
      });

      this.inMemoryStatus = {
        globalReadonly: activeWindows.some(w => w.type === 'GLOBAL_READONLY'),
        vendorReadonly: activeWindows.some(w => w.type === 'VENDOR_READONLY'),
        queueDrain: activeWindows.some(w => w.type === 'QUEUE_DRAIN'),
        activeWindows
      };

      return this.inMemoryStatus;
    } catch (error) {
      logger.error('Failed to get maintenance status:', error);
      throw error;
    }
  }

  /**
   * Check if system is in readonly mode
   */
  isGlobalReadonly(): boolean {
    return this.inMemoryStatus.globalReadonly;
  }

  /**
   * Check if vendor features are readonly
   */
  isVendorReadonly(): boolean {
    return this.inMemoryStatus.vendorReadonly;
  }

  /**
   * Check if queues are draining
   */
  isQueueDraining(): boolean {
    return this.inMemoryStatus.queueDrain;
  }

  /**
   * Toggle global readonly mode
   */
  async toggleGlobalReadonly(enabled: boolean, reason: string, createdById: string): Promise<any> {
    if (enabled) {
      return this.enableMaintenance('GLOBAL_READONLY', reason, 60, createdById);
    } else {
      const activeWindow = await this.findActiveWindow('GLOBAL_READONLY');
      if (activeWindow) {
        await this.disableMaintenance(activeWindow.id);
      }
      return null;
    }
  }

  /**
   * Toggle vendor readonly mode
   */
  async toggleVendorReadonly(enabled: boolean, reason: string, createdById: string): Promise<any> {
    if (enabled) {
      return this.enableMaintenance('VENDOR_READONLY', reason, 60, createdById);
    } else {
      const activeWindow = await this.findActiveWindow('VENDOR_READONLY');
      if (activeWindow) {
        await this.disableMaintenance(activeWindow.id);
      }
      return null;
    }
  }

  /**
   * Toggle queue drain mode
   */
  async toggleQueueDrain(enabled: boolean, reason: string, createdById: string): Promise<any> {
    if (enabled) {
      return this.enableMaintenance('QUEUE_DRAIN', reason, 30, createdById);
    } else {
      const activeWindow = await this.findActiveWindow('QUEUE_DRAIN');
      if (activeWindow) {
        await this.disableMaintenance(activeWindow.id);
      }
      return null;
    }
  }

  /**
   * List maintenance history
   */
  async getMaintenanceHistory(limit: number = 50): Promise<any[]> {
    try {
      const windows = await prisma.maintenanceWindow.findMany({
        orderBy: {
          scheduledStart: 'desc'
        },
        take: limit
      });

      return windows;
    } catch (error) {
      logger.error('Failed to get maintenance history:', error);
      throw error;
    }
  }

  /**
   * Auto-complete expired maintenance windows (run via cron)
   */
  async autoCompleteExpired(): Promise<void> {
    try {
      const now = new Date();
      
      const expired = await prisma.maintenanceWindow.findMany({
        where: {
          status: 'ACTIVE',
          scheduledEnd: {
            lte: now
          }
        }
      });

      for (const window of expired) {
        await prisma.maintenanceWindow.update({
          where: { id: window.id },
          data: {
            status: 'COMPLETED',
            actualEnd: now
          }
        });

        this.updateInMemoryStatus(window.type as MaintenanceType, false);

        logger.info({ windowId: window.id, type: window.type }, 'Auto-completed expired maintenance window');
      }
    } catch (error) {
      logger.error('Failed to auto-complete expired windows:', error);
    }
  }

  /**
   * Private: Update in-memory status
   */
  private updateInMemoryStatus(type: MaintenanceType, enabled: boolean): void {
    switch (type) {
      case 'GLOBAL_READONLY':
        this.inMemoryStatus.globalReadonly = enabled;
        break;
      case 'VENDOR_READONLY':
        this.inMemoryStatus.vendorReadonly = enabled;
        break;
      case 'QUEUE_DRAIN':
        this.inMemoryStatus.queueDrain = enabled;
        break;
    }
  }

  /**
   * Private: Find active maintenance window by type
   */
  private async findActiveWindow(type: MaintenanceType): Promise<any> {
    return prisma.maintenanceWindow.findFirst({
      where: {
        type,
        status: 'ACTIVE'
      }
    });
  }
}

export const maintenanceModeService = new MaintenanceModeService();

