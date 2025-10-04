import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const prisma = new PrismaClient();

interface NotificationData {
  vendorId: string;
  type: 'LOW_STOCK' | 'PRICE_WATCH_HIT' | 'SHORTFALL_DETECTED' | 'WEEKLY_DIGEST';
  title: string;
  message: string;
  data?: any;
}

// Mock email service (replace with actual email service)
const sendEmail = async (to: string, subject: string, body: string) => {
  logger.info({ to, subject }, 'Mock email sent');
  // In production, integrate with SendGrid, AWS SES, etc.
  return Promise.resolve();
};

// Mock push notification service (replace with actual push service)
const sendPushNotification = async (userId: string, title: string, body: string, data?: any) => {
  logger.info({ userId, title, body, data }, 'Mock push notification sent');
  // In production, integrate with Firebase, OneSignal, etc.
  return Promise.resolve();
};

// Check for low stock items and send notifications
export const checkLowStockNotifications = async () => {
  try {
    const lowStockItems = await prisma.inventoryItem.findMany({
      where: {
        current_qty: {
          lte: prisma.inventoryItem.fields.reorder_point,
        },
      },
      include: {
        vendor: {
          include: {
            user: true,
          },
        },
      },
    });

    // Group by vendor
    const vendorGroups = lowStockItems.reduce((acc, item) => {
      if (!acc[item.vendorProfileId]) {
        acc[item.vendorProfileId] = {
          vendor: item.vendor,
          items: [],
        };
      }
      acc[item.vendorProfileId].items.push(item);
      return acc;
    }, {} as any);

    // Send notifications for each vendor
    for (const [vendorId, group] of Object.entries(vendorGroups) as any) {
      const { vendor, items } = group;
      
      if (items.length === 0) continue;

      const notification: NotificationData = {
        vendorId,
        type: 'LOW_STOCK',
        title: 'Low Stock Alert',
        message: `You have ${items.length} item${items.length > 1 ? 's' : ''} at or below reorder point`,
        data: {
          items: items.map((item: any) => ({
            id: item.id,
            name: item.name,
            currentQty: item.current_qty,
            reorderPoint: item.reorder_point,
            unit: item.unit,
          })),
        },
      };

      await sendNotification(notification);
    }

    logger.info({ count: lowStockItems.length }, 'Low stock notifications checked');
  } catch (error) {
    logger.error({ error }, 'Failed to check low stock notifications');
  }
};

// Check for price watch hits and send notifications
export const checkPriceWatchNotifications = async () => {
  try {
    const priceWatches = await prisma.priceWatch.findMany({
      where: {
        active: true,
      },
      include: {
        inventoryItem: {
          include: {
            vendor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    for (const watch of priceWatches) {
      // Mock price check (in production, this would call B2B/Market APIs)
      const mockCurrentPrice = Number(watch.inventoryItem.avg_cost) * 0.9; // 10% lower for demo
      
      if (mockCurrentPrice <= Number(watch.target_unit_cost)) {
        const notification: NotificationData = {
          vendorId: watch.vendorProfileId,
          type: 'PRICE_WATCH_HIT',
          title: 'Price Watch Alert',
          message: `${watch.inventoryItem.name} is now available at your target price`,
          data: {
            itemId: watch.inventoryItem.id,
            itemName: watch.inventoryItem.name,
            targetPrice: watch.target_unit_cost,
            currentPrice: mockCurrentPrice,
            savings: Number(watch.inventoryItem.avg_cost) - mockCurrentPrice,
          },
        };

        await sendNotification(notification);
      }
    }

    logger.info({ count: priceWatches.length }, 'Price watch notifications checked');
  } catch (error) {
    logger.error({ error }, 'Failed to check price watch notifications');
  }
};

// Check for shortfalls and send notifications
export const checkShortfallNotifications = async () => {
  try {
    // Get upcoming sales windows and production plans
    const upcomingWindows = await prisma.salesWindow.findMany({
      where: {
        status: 'OPEN',
        fulfill_start_at: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
      },
      include: {
        products: {
          include: {
            product: {
              include: {
                materials: {
                  include: {
                    inventoryItem: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const upcomingProduction = await prisma.productionPlan.findMany({
      where: {
        status: 'PLANNED',
        planned_at: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
      },
      include: {
        product: {
          include: {
            materials: {
              include: {
                inventoryItem: true,
              },
            },
          },
        },
      },
    });

    // Check for shortfalls
    const vendorShortfalls = new Map();

    // Check sales windows
    for (const window of upcomingWindows) {
      for (const windowProduct of window.products) {
        if (!windowProduct.active) continue;

        for (const material of windowProduct.product.materials) {
          const available = Number(material.inventoryItem.current_qty);
          const required = Number(material.qty);
          
          if (available < required) {
            const vendorId = material.inventoryItem.vendorProfileId;
            if (!vendorShortfalls.has(vendorId)) {
              vendorShortfalls.set(vendorId, []);
            }
            vendorShortfalls.get(vendorId).push({
              itemName: material.inventoryItem.name,
              need: required,
              have: available,
              delta: required - available,
              unit: material.inventoryItem.unit,
              context: `Sales Window: ${window.name}`,
            });
          }
        }
      }
    }

    // Check production plans
    for (const plan of upcomingProduction) {
      for (const material of plan.product.materials) {
        const available = Number(material.inventoryItem.current_qty);
        const required = Number(material.qty) * plan.qty_to_make;
        
        if (available < required) {
          const vendorId = material.inventoryItem.vendorProfileId;
          if (!vendorShortfalls.has(vendorId)) {
            vendorShortfalls.set(vendorId, []);
          }
          vendorShortfalls.get(vendorId).push({
            itemName: material.inventoryItem.name,
            need: required,
            have: available,
            delta: required - available,
            unit: material.inventoryItem.unit,
            context: `Production: ${plan.product.name} (${plan.qty_to_make} units)`,
          });
        }
      }
    }

    // Send notifications for each vendor with shortfalls
    for (const [vendorId, shortfalls] of vendorShortfalls) {
      const vendor = await prisma.vendorProfile.findUnique({
        where: { id: vendorId },
        include: {
          user: true,
        },
      });

      if (!vendor) continue;

      const notification: NotificationData = {
        vendorId,
        type: 'SHORTFALL_DETECTED',
        title: 'Inventory Shortfall Alert',
        message: `You have ${shortfalls.length} inventory shortfall${shortfalls.length > 1 ? 's' : ''} for upcoming commitments`,
        data: {
          shortfalls,
        },
      };

      await sendNotification(notification);
    }

    logger.info({ count: vendorShortfalls.size }, 'Shortfall notifications checked');
  } catch (error) {
    logger.error({ error }, 'Failed to check shortfall notifications');
  }
};

// Send weekly inventory digest
export const sendWeeklyDigest = async () => {
  try {
    const vendors = await prisma.vendorProfile.findMany({
      include: {
        user: true,
        inventoryItems: {
          include: {
            movements: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                },
              },
            },
            priceWatches: {
              where: {
                active: true,
              },
            },
          },
        },
      },
    });

    for (const vendor of vendors) {
      const lowStockItems = vendor.inventoryItems.filter(
        item => Number(item.current_qty) <= Number(item.reorder_point)
      );
      
      const totalValue = vendor.inventoryItems.reduce(
        (sum, item) => sum + (Number(item.current_qty) * Number(item.avg_cost)), 0
      );
      
      const activePriceWatches = vendor.inventoryItems.reduce(
        (sum, item) => sum + item.priceWatches.length, 0
      );

      const recentMovements = vendor.inventoryItems.reduce(
        (sum, item) => sum + item.movements.length, 0
      );

      const notification: NotificationData = {
        vendorId: vendor.id,
        type: 'WEEKLY_DIGEST',
        title: 'Weekly Inventory Digest',
        message: 'Your weekly inventory health report is ready',
        data: {
          lowStockItems: lowStockItems.length,
          totalValue,
          activePriceWatches,
          recentMovements,
          items: lowStockItems.map(item => ({
            name: item.name,
            currentQty: item.current_qty,
            reorderPoint: item.reorder_point,
            unit: item.unit,
          })),
        },
      };

      await sendNotification(notification);
    }

    logger.info({ count: vendors.length }, 'Weekly digest notifications sent');
  } catch (error) {
    logger.error({ error }, 'Failed to send weekly digest');
  }
};

// Main notification sender
const sendNotification = async (notification: NotificationData) => {
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: notification.vendorId },
      include: {
        user: true,
      },
    });

    if (!vendor || !vendor.user) return;

    // Send email
    const emailSubject = notification.title;
    const emailBody = `
      <h2>${notification.title}</h2>
      <p>${notification.message}</p>
      ${notification.data ? `<pre>${JSON.stringify(notification.data, null, 2)}</pre>` : ''}
      <p>Visit your <a href="http://localhost:5173/dashboard/vendor/inventory-management">Inventory Management</a> page to take action.</p>
    `;
    
    await sendEmail(vendor.user.email, emailSubject, emailBody);

    // Send push notification
    await sendPushNotification(
      vendor.user.id,
      notification.title,
      notification.message,
      notification.data
    );

    logger.info({ 
      vendorId: notification.vendorId, 
      type: notification.type 
    }, 'Notification sent successfully');
  } catch (error) {
    logger.error({ error, notification }, 'Failed to send notification');
  }
};

// Schedule notifications (call this from a cron job or scheduler)
export const runNotificationChecks = async () => {
  logger.info('Starting inventory notification checks');
  
  await Promise.all([
    checkLowStockNotifications(),
    checkPriceWatchNotifications(),
    checkShortfallNotifications(),
  ]);
  
  logger.info('Inventory notification checks completed');
};

// Weekly digest job (call this weekly)
export const runWeeklyDigest = async () => {
  logger.info('Starting weekly inventory digest');
  
  await sendWeeklyDigest();
  
  logger.info('Weekly inventory digest completed');
};


