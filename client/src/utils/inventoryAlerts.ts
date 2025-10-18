import type { InventoryItem } from '@/types/inventory';

export interface AlertItem {
  id: string;
  type: 'low_stock' | 'expiring_soon' | 'expired';
  message: string;
  count: number;
  severity: 'high' | 'medium' | 'low';
  action?: string;
  onClick?: () => void;
}

export interface InventoryAlerts {
  lowStockItems: InventoryItem[];
  expiringSoonItems: InventoryItem[];
  expiredItems: InventoryItem[];
  totalAlerts: number;
  highSeverityCount: number;
}

// Constants for alert thresholds
export const ALERT_THRESHOLDS = {
  LOW_STOCK_MULTIPLIER: 1.0, // Items at or below reorder point
  EXPIRING_SOON_DAYS: 30, // Items expiring within 30 days
  EXPIRED_DAYS: 0, // Items that have already expired
} as const;

/**
 * Calculate all inventory alerts based on current stock levels and expiration dates
 */
export function calculateInventoryAlerts(items: InventoryItem[]): InventoryAlerts {
  const now = new Date();
  const expiringSoonDate = new Date(now.getTime() + ALERT_THRESHOLDS.EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000);

  const lowStockItems = items.filter(item => 
    item.currentStock <= item.reorderPoint * ALERT_THRESHOLDS.LOW_STOCK_MULTIPLIER
  );

  const expiringSoonItems = items.filter(item => {
    if (!item.expirationDate) return false;
    const expirationDate = new Date(item.expirationDate);
    return expirationDate <= expiringSoonDate && expirationDate > now;
  });

  const expiredItems = items.filter(item => {
    if (!item.expirationDate) return false;
    const expirationDate = new Date(item.expirationDate);
    return expirationDate <= now;
  });

  const totalAlerts = lowStockItems.length + expiringSoonItems.length + expiredItems.length;
  const highSeverityCount = expiredItems.length + lowStockItems.filter(item => 
    item.currentStock === 0
  ).length;

  return {
    lowStockItems,
    expiringSoonItems,
    expiredItems,
    totalAlerts,
    highSeverityCount,
  };
}

/**
 * Generate alert items for the alert bar component
 */
export function generateAlertItems(
  alerts: InventoryAlerts,
  onLowStockClick?: () => void,
  onExpiringClick?: () => void,
  onExpiredClick?: () => void
): AlertItem[] {
  const alertItems: AlertItem[] = [];

  // Low stock alert
  if (alerts.lowStockItems.length > 0) {
    const criticalLowStock = alerts.lowStockItems.filter(item => item.currentStock === 0);
    const severity = criticalLowStock.length > 0 ? 'high' : 'medium';
    
    alertItems.push({
      id: 'low_stock',
      type: 'low_stock',
      message: criticalLowStock.length > 0 
        ? `${criticalLowStock.length} items out of stock, ${alerts.lowStockItems.length - criticalLowStock.length} low stock`
        : `${alerts.lowStockItems.length} items need reordering`,
      count: alerts.lowStockItems.length,
      severity,
      action: 'View Items',
      onClick: onLowStockClick,
    });
  }

  // Expiring soon alert
  if (alerts.expiringSoonItems.length > 0) {
    const expiringThisWeek = alerts.expiringSoonItems.filter(item => {
      if (!item.expirationDate) return false;
      const expirationDate = new Date(item.expirationDate);
      const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      return expirationDate <= oneWeekFromNow;
    });

    const severity = expiringThisWeek.length > 0 ? 'high' : 'medium';

    alertItems.push({
      id: 'expiring_soon',
      type: 'expiring_soon',
      message: expiringThisWeek.length > 0
        ? `${expiringThisWeek.length} items expiring this week, ${alerts.expiringSoonItems.length - expiringThisWeek.length} expiring soon`
        : `${alerts.expiringSoonItems.length} items expiring within 30 days`,
      count: alerts.expiringSoonItems.length,
      severity,
      action: 'View Items',
      onClick: onExpiringClick,
    });
  }

  // Expired items alert
  if (alerts.expiredItems.length > 0) {
    alertItems.push({
      id: 'expired',
      type: 'expired',
      message: `${alerts.expiredItems.length} items have expired`,
      count: alerts.expiredItems.length,
      severity: 'high',
      action: 'Remove Items',
      onClick: onExpiredClick || undefined,
    });
  }

  return alertItems;
}

/**
 * Check if an item has any alerts
 */
export function hasItemAlerts(item: InventoryItem): boolean {
  const isLowStock = item.currentStock <= item.reorderPoint * ALERT_THRESHOLDS.LOW_STOCK_MULTIPLIER;
  
  const isExpiringSoon = item.expirationDate && (() => {
    const expirationDate = new Date(item.expirationDate);
    const expiringSoonDate = new Date(Date.now() + ALERT_THRESHOLDS.EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000);
    return expirationDate <= expiringSoonDate && expirationDate > new Date();
  })();

  const isExpired = item.expirationDate ? new Date(item.expirationDate) <= new Date() : false;

  return isLowStock || isExpiringSoon || isExpired;
}

/**
 * Get the highest severity alert for an item
 */
export function getItemAlertSeverity(item: InventoryItem): 'high' | 'medium' | 'low' | null {
  if (!hasItemAlerts(item)) return null;

  // Check for expired items (highest priority)
  if (item.expirationDate && new Date(item.expirationDate) <= new Date()) {
    return 'high';
  }

  // Check for out of stock (high priority)
  if (item.currentStock === 0) {
    return 'high';
  }

  // Check for expiring this week (high priority)
  if (item.expirationDate) {
    const expirationDate = new Date(item.expirationDate);
    const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (expirationDate <= oneWeekFromNow && expirationDate > new Date()) {
      return 'high';
    }
  }

  // Check for low stock (medium priority)
  if (item.currentStock <= item.reorderPoint * ALERT_THRESHOLDS.LOW_STOCK_MULTIPLIER) {
    return 'medium';
  }

  // Check for expiring soon (medium priority)
  if (item.expirationDate) {
    const expirationDate = new Date(item.expirationDate);
    const expiringSoonDate = new Date(Date.now() + ALERT_THRESHOLDS.EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000);
    if (expirationDate <= expiringSoonDate && expirationDate > new Date()) {
      return 'medium';
    }
  }

  return 'low';
}

/**
 * Get days until expiration for an item
 */
export function getDaysUntilExpiration(item: InventoryItem): number | null {
  if (!item.expirationDate) return null;
  
  const expirationDate = new Date(item.expirationDate);
  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Format expiration status for display
 */
export function formatExpirationStatus(item: InventoryItem): string | null {
  const daysUntilExpiration = getDaysUntilExpiration(item);
  
  if (daysUntilExpiration === null) return null;
  
  if (daysUntilExpiration < 0) {
    return `Expired ${Math.abs(daysUntilExpiration)} days ago`;
  } else if (daysUntilExpiration === 0) {
    return 'Expires today';
  } else if (daysUntilExpiration === 1) {
    return 'Expires tomorrow';
  } else if (daysUntilExpiration <= 7) {
    return `Expires in ${daysUntilExpiration} days`;
  } else {
    return `Expires in ${daysUntilExpiration} days`;
  }
}

