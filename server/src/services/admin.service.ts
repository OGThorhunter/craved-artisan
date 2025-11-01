import { prisma } from "../lib/prisma";
import { logger } from "../logger";

/**
 * Get admin dashboard overview with key metrics
 */
export async function getAdminOverview() {
  try {
    // Get current month start for MTD calculations
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel queries for performance
    const [activeVendors, activeCustomers, mtdRevenue, openTickets] = await Promise.all([
      // Count active vendors (vendors with profiles)
      prisma.vendorProfile.count({
        where: {
          // You may want to add additional filters here based on your business logic
        },
      }),

      // Count active customers (users with orders)
      prisma.user.count({
        where: {
          orders: {
            some: {}, // Has at least one order
          },
        },
      }),

      // Calculate MTD revenue from completed orders
      prisma.order.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: {
            gte: monthStart,
          },
        },
        _sum: {
          total: true,
        },
      }),

      // Count open support tickets
      prisma.supportTicket.count({
        where: {
          status: {
            not: "CLOSED",
          },
        },
      }),
    ]);

    // Format revenue as currency string
    const revenueValue = mtdRevenue._sum.total || 0;
    const mtdRevenueFormatted = `$${revenueValue.toFixed(2)}`;

    return {
      activeVendors,
      activeCustomers,
      mtdRevenue: mtdRevenueFormatted,
      openTickets,
    };
  } catch (error) {
    logger.error({ error }, "Error fetching admin overview");
    throw error;
  }
}

