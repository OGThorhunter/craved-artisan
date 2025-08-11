import { Request, Response } from 'express';
import { vendorRepo } from '../repos/vendor.repo';
import { mapVendor, mapProduct } from './mappers';

export class VendorService {
  // Get vendor by ID
  static async getVendorById(vendorId: string, res: Response) {
    const vendor = await vendorRepo.getVendorById(vendorId);
    
    if (!vendor) {
      return null;
    }

    // Set cache headers
    res.set({
      'Cache-Control': 'public, max-age=300', // 5 minutes for vendor data
      'ETag': `"vendor-${vendorId}-${vendor.updatedAt?.getTime() || Date.now()}"`
    });

    return mapVendor(vendor);
  }

  // Get vendor products with pagination
  static async getVendorProducts(
    vendorId: string, 
    limit: number, 
    offset: number, 
    res: Response
  ) {
    // Enforce limits
    const safeLimit = Math.min(limit, 100);
    const safeOffset = Math.max(offset, 0);

    // Get data from repo
    const [products, total] = await Promise.all([
      vendorRepo.getVendorProducts(vendorId, safeLimit, safeOffset),
      vendorRepo.countVendorProducts(vendorId)
    ]);

    // Map products
    const mappedProducts = products.map(mapProduct);

    // Compute meta
    const meta = {
      total,
      limit: safeLimit,
      offset: safeOffset,
      hasNext: safeOffset + safeLimit < total,
      hasPrev: safeOffset > 0,
      totalPages: Math.ceil(total / safeLimit),
      currentPage: Math.floor(safeOffset / safeLimit) + 1
    };

    // Set cache headers with shorter TTL for product lists
    res.set({
      'Cache-Control': 'public, max-age=60', // 1 minute for product lists
      'ETag': `"vendor-products-${vendorId}-${safeLimit}-${safeOffset}-${total}"`
    });

    return {
      data: mappedProducts,
      meta
    };
  }
}
