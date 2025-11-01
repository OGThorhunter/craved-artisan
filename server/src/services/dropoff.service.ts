import { prisma } from "../lib/prisma";
import { logger } from "../logger";

/**
 * Get all dropoff locations
 */
export async function getDropoffLocations() {
  try {
    return await prisma.dropoffLocation.findMany({
      where: {
        active: true,
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    logger.error({ error }, "Error fetching dropoff locations");
    throw error;
  }
}

/**
 * Update a dropoff location
 */
export async function updateDropoffLocation(
  id: string,
  data: {
    name?: string;
    address?: string;
    pendingOrders?: number;
    pickupWindow?: string;
    notes?: string;
    active?: boolean;
  }
) {
  try {
    return await prisma.dropoffLocation.update({
      where: { id },
      data,
    });
  } catch (error) {
    logger.error({ error, id, data }, "Error updating dropoff location");
    throw error;
  }
}

/**
 * Create a new dropoff location
 */
export async function createDropoffLocation(data: {
  name: string;
  address?: string;
  pickupWindow?: string;
  notes?: string;
}) {
  try {
    return await prisma.dropoffLocation.create({
      data: {
        ...data,
        pendingOrders: 0,
        active: true,
      },
    });
  } catch (error) {
    logger.error({ error, data }, "Error creating dropoff location");
    throw error;
  }
}

/**
 * Get a single dropoff location by ID
 */
export async function getDropoffLocationById(id: string) {
  try {
    return await prisma.dropoffLocation.findUnique({
      where: { id },
    });
  } catch (error) {
    logger.error({ error, id }, "Error fetching dropoff location by ID");
    throw error;
  }
}

