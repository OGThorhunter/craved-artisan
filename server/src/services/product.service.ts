import { Request, Response } from 'express';
import { productRepo } from '../repos/product.repo';
import { mapProduct } from './mappers';

export class ProductService {
  // List products with pagination
  static async listProducts(limit: number, offset: number, res: Response) {
    // Enforce limits
    const safeLimit = Math.min(limit, 100);
    const safeOffset = Math.max(offset, 0);

    // Get data from repo
    const [products, total] = await Promise.all([
      productRepo.listProducts(safeLimit, safeOffset),
      productRepo.countProducts()
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

    // Set cache headers
    res.set({
      'Cache-Control': 'public, max-age=60', // 1 minute for product lists
      'ETag': `"products-${safeLimit}-${safeOffset}-${total}"`
    });

    return {
      data: mappedProducts,
      meta
    };
  }

  // Get product by ID
  static async getProductById(productId: string, res: Response) {
    const product = await productRepo.getProductById(productId);
    
    if (!product) {
      return null;
    }

    // Set cache headers
    res.set({
      'Cache-Control': 'public, max-age=300', // 5 minutes for individual products
      'ETag': `"product-${productId}-${product.updatedAt?.getTime() || Date.now()}"`
    });

    return mapProduct(product);
  }
}
