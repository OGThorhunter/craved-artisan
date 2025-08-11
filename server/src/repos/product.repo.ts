import { prisma } from '../db/prisma';

export interface ProductFilters {
  limit?: number;
  offset?: number;
}

export const productRepo = {
  /**
   * List products with pagination
   */
  async listProducts({ limit = 20, offset = 0 }: ProductFilters = {}) {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.product.count()
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
   * Count total products
   */
  async countProducts() {
    return await prisma.product.count();
  },

  /**
   * Get a product by ID
   */
  async getProductById(productId: string) {
    return await prisma.product.findUnique({
      where: { id: productId }
    });
  }
};
