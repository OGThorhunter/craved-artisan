import { Request, Response } from 'express';
import { VendorService } from '../services/vendor.service';

// GET /vendors/:vendorId
export async function getVendorById(req: Request, res: Response) {
  try {
    const { vendorId } = (req as any).validated;
    
    // Set request ID header if available
    if (res.locals.requestId) {
      res.set('x-request-id', res.locals.requestId);
    }

    const vendor = await VendorService.getVendorById(vendorId, res);
    
    if (!vendor) {
      return res.status(404).json({
        error: 'Not found',
        message: `Vendor ${vendorId} not found`
      });
    }

    res.json(vendor);
  } catch (error) {
    console.error('Error in getVendorById:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve vendor'
    });
  }
}

// GET /vendors/:vendorId/products
export async function getVendorProducts(req: Request, res: Response) {
  try {
    const { vendorId } = (req as any).validated;
    const { limit, offset } = (req as any).validated;
    
    // Set request ID header if available
    if (res.locals.requestId) {
      res.set('x-request-id', res.locals.requestId);
    }

    const result = await VendorService.getVendorProducts(vendorId, limit, offset, res);
    
    if (!result) {
      return res.status(404).json({
        error: 'Not found',
        message: `Vendor ${vendorId} not found`
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error in getVendorProducts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve vendor products'
    });
  }
}
