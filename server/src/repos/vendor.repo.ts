import prisma from '../lib/prisma';

export interface VendorFilters {
  limit?: number;
  offset?: number;
}

export interface VendorProductFilters {
  limit?: number;
  offset?: number;
}

export const vendorRepo = {
  /**
   * Get a vendor by ID
   */
  async getVendorById(vendorId: string) {
    return await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });
  },

  /**
   * List vendors with pagination (helpful for QA)
   */
  async listVendors({ limit = 20, offset = 0 }: VendorFilters = {}) {
    const [vendors, total] = await Promise.all([
      prisma.vendorProfile.findMany({
        skip: offset,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.vendorProfile.count()
    ]);

    return {
      data: vendors,
      meta: {
        total,
        limit,
        offset
      }
    };
  },

  /**
   * Get products for a specific vendor
   */
  async getVendorProducts(vendorId: string, { limit = 20, offset = 0 }: VendorProductFilters = {}) {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { vendor_id: vendorId },
        skip: offset,
        take: limit,
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.product.count({
        where: { vendor_id: vendorId }
      })
    ]);

    return {
      data: products,
      meta: {
        total,
        limit,
        offset
      }
    };
  },

  /**
   * Count products for a specific vendor
   */
  async countVendorProducts(vendorId: string) {
    return await prisma.product.count({
      where: { vendor_id: vendorId }
    });
  }
};
