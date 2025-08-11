import { Request, Response } from 'express';
import { vendorService } from '../services/vendor.service';
import { vendorRepo } from '../repos/vendor.repo';
import { mapVendor } from '../services/mappers';

export const vendorController = {
  /**
   * Get vendor by ID
   */
  async byId(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const vendor = await vendorService.vendorById(id);
      
      if (!vendor) {
        return res.status(404).json({
          error: 'Not found',
          message: `Vendor ${id} not found`
        });
      }
      
      // Set cache headers
      res.set({
        'Cache-Control': 'public, max-age=300', // 5 minutes for vendor data
        'ETag': `"vendor-${id}"`
      });
      
      res.json(vendor);
    } catch (error) {
      console.error('Vendor byId error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch vendor'
      });
    }
  },

  /**
   * List vendors with pagination (handy for QA)
   */
  async list(req: Request, res: Response) {
    try {
      const { limit, offset } = req.query as { limit?: number; offset?: number };
      const result = await vendorRepo.listVendors({ limit, offset });
      
      // Map vendors to DTOs
      const mappedVendors = result.data.map(mapVendor);
      
      // Set cache headers
      res.set({
        'Cache-Control': 'public, max-age=60', // 1 minute for vendor lists
        'ETag': `"vendors-${limit}-${offset}-${result.meta.total}"`
      });
      
      res.json({
        data: mappedVendors,
        meta: result.meta
      });
    } catch (error) {
      console.error('Vendor list error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch vendors'
      });
    }
  },

  /**
   * Get products for a specific vendor
   */
  async productsForVendor(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const { limit, offset } = req.query as { limit?: number; offset?: number };
      
      // First check if vendor exists
      const vendor = await vendorService.vendorById(id);
      if (!vendor) {
        return res.status(404).json({
          error: 'Not found',
          message: `Vendor ${id} not found`
        });
      }
      
      const result = await vendorService.vendorProducts(id, { limit, offset });
      
      // Set cache headers
      res.set({
        'Cache-Control': 'public, max-age=60', // 1 minute for vendor product lists
        'ETag': `"vendor-products-${id}-${limit}-${offset}-${result.meta.total}"`
      });
      
      res.json(result);
    } catch (error) {
      console.error('Vendor products error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch vendor products'
      });
    }
  }
};
