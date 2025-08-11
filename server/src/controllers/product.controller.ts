import { Request, Response } from 'express';
import { productService } from '../services/product.service';

export const productController = {
  /**
   * List products with pagination
   */
  async list(req: Request, res: Response) {
    try {
      const { limit, offset } = req.query as { limit?: number; offset?: number };
      const result = await productService.products({ limit, offset });
      
      // Set cache headers
      res.set({
        'Cache-Control': 'public, max-age=60', // 1 minute for product lists
        'ETag': `"products-${limit}-${offset}-${result.meta.total}"`
      });
      
      res.json(result);
    } catch (error) {
      console.error('Product list error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch products'
      });
    }
  },

  /**
   * Get product by ID
   */
  async byId(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const product = await productService.productById(id);
      
      if (!product) {
        return res.status(404).json({
          error: 'Not found',
          message: `Product ${id} not found`
        });
      }
      
      // Set cache headers
      res.set({
        'Cache-Control': 'public, max-age=300', // 5 minutes for individual products
        'ETag': `"product-${id}"`
      });
      
      res.json(product);
    } catch (error) {
      console.error('Product byId error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch product'
      });
    }
  }
};
