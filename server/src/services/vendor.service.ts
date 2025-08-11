import { vendorRepo, type VendorFilters, type VendorProductFilters } from '../repos/vendor.repo';
import { mapVendor, mapProduct, type VendorDTO, type ProductDTO } from './mappers';

export const vendorService = {
  /**
   * Get vendor by ID
   */
  async vendorById(id: string): Promise<VendorDTO | null> {
    const vendor = await vendorRepo.getVendorById(id);
    return vendor ? mapVendor(vendor) : null;
  },

  /**
   * Get vendor products with pagination
   */
  async vendorProducts(id: string, filters: VendorProductFilters = {}) {
    // Enforce limits
    const limit = Math.min(filters.limit ?? 20, 100);
    const offset = Math.max(filters.offset ?? 0, 0);

    const result = await vendorRepo.getVendorProducts(id, { limit, offset });
    
    return {
      data: result.data.map(mapProduct),
      meta: {
        total: result.meta.total,
        limit: result.meta.limit,
        offset: result.meta.offset
      }
    };
  }
};
