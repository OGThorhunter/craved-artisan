import { prisma } from "../lib/prisma";
import { logger } from "../logger";

/**
 * Get customer profile by user ID
 * Note: CustomerProfile is vendor-scoped, so we return User data for customer dashboard
 */
export async function getCustomerProfileByUserId(userId: string) {
  try {
    // Get user with zip_code
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        zip_code: true,
        avatarUrl: true,
        created_at: true,
      },
    });

    if (!user) {
      logger.warn({ userId }, "User not found for customer profile");
      return null;
    }

    return user;
  } catch (error) {
    logger.error({ error, userId }, "Error fetching customer profile");
    throw error;
  }
}

/**
 * Get all orders for a customer by user ID
 */
export async function getCustomerOrdersByUserId(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        fulfillments: {
          take: 1, // Get the most recent fulfillment
          orderBy: { createdAt: "desc" },
        },
        shippingAddress: true,
      },
    });

    // Transform to match expected shape
    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.orderItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.unitPrice,
        total: item.total,
        product: item.product,
      })),
      fulfillment: order.fulfillments[0] || null,
      shippingAddress: order.shippingAddress || null,
    }));
  } catch (error) {
    logger.error({ error, userId }, "Error fetching customer orders");
    throw error;
  }
}

