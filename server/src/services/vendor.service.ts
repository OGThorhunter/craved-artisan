import { prisma } from "../lib/prisma";
import { logger } from "../logger";

/**
 * Find vendor profile by user ID
 */
export async function findVendorByUserId(userId: string) {
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId },
      include: {
        products: true,
        inventoryItems: true,
      },
    });

    if (!vendor) {
      logger.warn({ userId }, "Vendor profile not found for user");
    }

    return vendor;
  } catch (error) {
    logger.error({ error, userId }, "Error finding vendor by user ID");
    throw error;
  }
}

/**
 * Get all products for a vendor
 */
export async function getVendorProducts(vendorProfileId: string) {
  try {
    return await prisma.product.findMany({
      where: { vendorProfileId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    logger.error({ error, vendorProfileId }, "Error fetching vendor products");
    throw error;
  }
}

/**
 * Get all inventory items for a vendor
 */
export async function getVendorInventory(vendorProfileId: string) {
  try {
    return await prisma.inventoryItem.findMany({
      where: { vendorProfileId },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    logger.error({ error, vendorProfileId }, "Error fetching vendor inventory");
    throw error;
  }
}

/**
 * Get all orders for a vendor
 */
export async function getVendorOrders(vendorProfileId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { vendorProfileId },
      orderBy: { createdAt: "desc" },
    });

    // Calculate todayCount and monthRevenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = orders.filter(
      (order) => new Date(order.createdAt) >= today
    ).length;

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthRevenue = orders
      .filter(
        (order) =>
          order.status === "COMPLETED" &&
          new Date(order.createdAt) >= monthStart
      )
      .reduce((sum, order) => sum + order.total, 0);

    return {
      orders,
      todayCount,
      monthRevenue: monthRevenue.toFixed(2),
    };
  } catch (error) {
    logger.error({ error, vendorProfileId }, "Error fetching vendor orders");
    throw error;
  }
}

/**
 * Get all recipes for a vendor
 */
export async function getVendorRecipes(vendorProfileId: string) {
  try {
    return await prisma.recipe.findMany({
      where: { vendorProfileId },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    logger.error({ error, vendorProfileId }, "Error fetching vendor recipes");
    throw error;
  }
}

