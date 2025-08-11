import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';

// GET /products
export async function listProducts(req: Request, res: Response) {
  try {
    const { limit, offset } = (req as any).validated;
    
    // Set request ID header if available
    if (res.locals.requestId) {
      res.set('x-request-id', res.locals.requestId);
    }

    const result = await ProductService.listProducts(limit, offset, res);
    res.json(result);
  } catch (error) {
    console.error('Error in listProducts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve products'
    });
  }
}

// GET /products/:productId
export async function getProductById(req: Request, res: Response) {
  try {
    const { productId } = (req as any).validated;
    
    // Set request ID header if available
    if (res.locals.requestId) {
      res.set('x-request-id', res.locals.requestId);
    }

    const product = await ProductService.getProductById(productId, res);
    
    if (!product) {
      return res.status(404).json({
        error: 'Not found',
        message: `Product ${productId} not found`
      });
    }

    res.json(product);
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve product'
    });
  }
}
