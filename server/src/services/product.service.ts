import { productRepo, type ProductFilters } from '../repos/product.repo';
import { mapProduct, type ProductDTO } from './mappers';

export const productService = {
  /**
   * List products with pagination
   */
  async products(filters: ProductFilters = {}) {
    // Enforce limits
    const limit = Math.min(filters.limit ?? 20, 100);
    const offset = Math.max(filters.offset ?? 0, 0);

    const result = await productRepo.listProducts({ limit, offset });
    
    return {
      data: result.data.map(mapProduct),
      meta: {
        total: result.meta.total,
        limit: result.meta.limit,
        offset: result.meta.offset
      }
    };
  },

  /**
   * Get product by ID
   */
  async productById(id: string): Promise<ProductDTO | null> {
    const product = await productRepo.getProductById(id);
    return product ? mapProduct(product) : null;
  }
};
